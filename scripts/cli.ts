import fs from "node:fs/promises";
import { Command } from "commander";
import {
  buildOutputPath,
  filterCountries,
  generateFakeUsers,
} from "../src/lib/cli-utils";
import { loadAllCountryConfigs } from "../src/lib/country-config";
import { buildCountryData } from "../src/lib/data-output";
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
  program.command("collect").description("collect real data from GitHub API"),
).action(async (opts: { country?: string; limit?: number }) => {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error("Error: GITHUB_TOKEN environment variable is required");
    process.exit(1);
  }

  const all = await loadAllCountryConfigs("config/countries.json");
  const countries = filterCountries(all, opts.country);
  const client = createOctokitClient(token);

  console.log(
    `Collecting ${countries.length} country(ies)${opts.limit ? ` (limit: ${opts.limit})` : ""}...\n`,
  );

  for (const config of countries) {
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
});

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

program.parse();
