import fs from "node:fs/promises";
import { Command } from "commander";
import {
  buildOutputPath,
  filterCountries,
  generateFakeUsers,
  prioritizeCountry,
  shouldSkipCountry,
} from "../src/lib/cli-utils";
import { loadAllCountryConfigs } from "../src/lib/country-config";
import { buildCountryData, rebuildCountryData } from "../src/lib/data-output";
import { searchUsersByLocation } from "../src/lib/github-client";
import { createOctokitClient } from "../src/lib/octokit-github-client";

const program = new Command()
  .name("codeatlas")
  .description("CodeAtlas CLI — collect and generate developer ranking data")
  .version("1.0.0");

// Shared options
function addSharedOptions(cmd: Command) {
  return cmd
    .option("-c, --country <code>", "process single country by code")
    .option("-l, --limit <number>", "max users per country", Number.parseInt);
}

// ── collect ──
addSharedOptions(
  program
    .command("collect")
    .description("collect real data from GitHub API")
    .option("--skip-today", "skip countries already collected today")
    .option(
      "--rebuild",
      "rebuild existing JSON files (apply format changes without fetching)",
    ),
).action(
  async (opts: {
    country?: string;
    limit?: number;
    skipToday?: boolean;
    rebuild?: boolean;
  }) => {
    const all = await loadAllCountryConfigs("config/countries.json");
    const countries = filterCountries(all, opts.country);

    if (opts.rebuild) {
      console.log(`Rebuilding ${countries.length} country(ies)...\n`);
      for (const config of countries) {
        const outputPath = buildOutputPath(config.code);
        try {
          const raw = JSON.parse(await fs.readFile(outputPath, "utf8"));
          const data = rebuildCountryData(raw);
          await fs.writeFile(outputPath, JSON.stringify(data, null, 2));
          console.log(`  ✓ ${config.flag} ${config.name}`);
        } catch {
          console.log(`  ⊘ ${config.flag} ${config.name} (no data)`);
        }
      }
      console.log("\nDone!");
      return;
    }

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      console.error("Error: GITHUB_TOKEN environment variable is required");
      process.exit(1);
    }
    const client = createOctokitClient(token);

    console.log(
      `Collecting ${countries.length} country(ies)${opts.limit ? ` (limit: ${opts.limit})` : ""}...\n`,
    );

    const today = new Date().toISOString().split("T")[0];

    for (const config of countries) {
      if (opts.skipToday) {
        try {
          const existing = JSON.parse(
            await fs.readFile(buildOutputPath(config.code), "utf8"),
          );
          if (shouldSkipCountry(existing.updatedAt, today)) {
            console.log(`${config.flag} ${config.name} ⊘ (already up to date)`);
            continue;
          }
        } catch {
          // File doesn't exist yet, proceed
        }
      }

      console.log(`${config.flag} ${config.name}...`);

      const batch: string[] = [];
      const users = await searchUsersByLocation(client, config.locations, {
        countryCode: config.code,
        limit: opts.limit,
        onProgress: (current, login) => {
          if (process.stdout.isTTY) {
            process.stdout.write(`\r  [${current}] ${login}`.padEnd(60));
          } else {
            batch.push(login);
            if (batch.length === 10) {
              console.log(`  [${current}] ${batch.join(", ")}`);
              batch.length = 0;
            }
          }
        },
      });
      if (process.stdout.isTTY) {
        process.stdout.write(`\r${" ".repeat(60)}\r`);
      } else if (batch.length > 0) {
        console.log(`  [${users.length}] ${batch.join(", ")}`);
      }
      console.log(`  Found ${users.length} users (deduplicated)`);

      const data = buildCountryData(config.code, users);
      const outputPath = buildOutputPath(config.code);
      await fs.mkdir("public/data", { recursive: true });
      await fs.writeFile(outputPath, JSON.stringify(data, null, 2));
      console.log(`  → ${outputPath}`);
    }

    console.log("\nDone!");
  },
);

// ── generate ──
addSharedOptions(
  program
    .command("generate")
    .description("generate sample/fake data for development"),
).action(async (opts: { country?: string; limit?: number }) => {
  const limit = opts.limit || 10;
  const all = await loadAllCountryConfigs("config/countries.json");
  const countries = filterCountries(all, opts.country);

  console.log(
    `Generating ${countries.length} country(ies) × ${limit} users...\n`,
  );

  for (let i = 0; i < countries.length; i++) {
    const config = countries[i];
    const users = generateFakeUsers(
      config.code,
      config.name,
      config.locations,
      limit,
    );
    const data = buildCountryData(config.code, users);
    const outputPath = buildOutputPath(config.code);
    await fs.mkdir("public/data", { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(data, null, 2));

    if ((i + 1) % 20 === 0) console.log(`  ${i + 1} countries...`);
  }

  console.log(`\nDone! ${countries.length} countries × ${limit} users.`);
});

// ── list-countries ──
program
  .command("list-countries")
  .description("list country codes (space-separated)")
  .option("-p, --priority <code>", "move this country to the front")
  .action(async (opts: { priority?: string }) => {
    const all = await loadAllCountryConfigs("config/countries.json");
    let codes = all.map((c) => c.code);
    if (opts.priority) {
      codes = prioritizeCountry(codes, opts.priority);
    }
    console.log(codes.join(" "));
  });

program.parse();
