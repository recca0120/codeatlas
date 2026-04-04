import fs from "node:fs/promises";
import { Command } from "commander";
import {
  buildOutputPath,
  filterCountries,
  generateFakeUsers,
  generateSummaryFile,
  getCheckpointCountry,
  loadCheckpoint,
  nextCheckpoint,
  reorderFromCheckpoint,
  saveCheckpoint,
} from "../src/lib/cli-utils";
import { loadAllCountryConfigs } from "../src/lib/country-config";
import { buildCountryData, rebuildCountryData } from "../src/lib/data-output";
import { searchUsersByLocation } from "../src/lib/github-client";
import { createOctokitClient } from "../src/lib/octokit-github-client";

const DATA_DIR = "public/data";
const COUNTRIES_JSON = "public/data/countries.json";
const SUMMARY_PATH = "public/data/countries-summary.json";

async function runSummary() {
  const all = await loadAllCountryConfigs(COUNTRIES_JSON);
  await generateSummaryFile(all, DATA_DIR, SUMMARY_PATH);
  console.log(`  → ${SUMMARY_PATH}`);
}

async function writeCountryData(
  countryCode: string,
  data: unknown,
): Promise<string> {
  const outputPath = buildOutputPath(countryCode);
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(data));
  return outputPath;
}

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
    .option("--next", "collect the next country from checkpoint")
    .option(
      "--page-size <number>",
      "users per API page (default: 20)",
      Number.parseInt,
    )
    .option(
      "--rebuild",
      "rebuild existing JSON files (apply format changes without fetching)",
    ),
).action(
  async (opts: {
    country?: string;
    limit?: number;
    next?: boolean;
    pageSize?: number;
    rebuild?: boolean;
  }) => {
    const CHECKPOINT_PATH = "public/data/checkpoint.json";
    const all = await loadAllCountryConfigs("public/data/countries.json");

    if (opts.next && opts.country) {
      console.error("Error: --next and --country cannot be used together");
      process.exit(1);
    }

    const useCheckpoint = opts.next || !opts.country;
    let checkpoint = 0;

    if (useCheckpoint) {
      checkpoint = await loadCheckpoint(CHECKPOINT_PATH);
    }

    let countries: typeof all;
    if (opts.next) {
      const config = getCheckpointCountry(all, checkpoint);
      console.log(
        `Checkpoint ${checkpoint}/${all.length}: ${config.flag} ${config.name}`,
      );
      countries = [config];
    } else if (opts.country) {
      countries = filterCountries(all, opts.country);
    } else {
      countries = reorderFromCheckpoint(all, checkpoint);
      console.log(`Starting from checkpoint ${checkpoint}/${all.length}`);
    }

    if (opts.rebuild) {
      console.log(`Rebuilding ${countries.length} country(ies)...\n`);
      for (const config of countries) {
        const outputPath = buildOutputPath(config.code);
        try {
          const raw = JSON.parse(await fs.readFile(outputPath, "utf8"));
          const data = rebuildCountryData(raw);
          await writeCountryData(config.code, data);
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

    for (const config of countries) {
      console.log(`${config.flag} ${config.name}...`);

      const batch: string[] = [];
      const users = await searchUsersByLocation(client, config.locations, {
        countryCode: config.code,
        limit: opts.limit,
        pageSize: opts.pageSize,
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
      const outputPath = await writeCountryData(config.code, data);
      console.log(`  → ${outputPath}`);

      if (useCheckpoint) {
        checkpoint = nextCheckpoint(checkpoint, all.length);
        await saveCheckpoint(CHECKPOINT_PATH, checkpoint);
      }
    }

    console.log("\nGenerating summary...");
    await runSummary();
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
  const all = await loadAllCountryConfigs("public/data/countries.json");
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
    await writeCountryData(config.code, data);

    if ((i + 1) % 20 === 0) console.log(`  ${i + 1} countries...`);
  }

  console.log("\nGenerating summary...");
  await runSummary();
  console.log(`\nDone! ${countries.length} countries × ${limit} users.`);
});

// ── summary ──
program
  .command("summary")
  .description("regenerate countries-summary.json from existing data files")
  .action(async () => {
    console.log("Generating summary...");
    await runSummary();
    console.log("Done!");
  });

program.parse();
