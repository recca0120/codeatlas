import fs from "node:fs/promises";
import path from "node:path";
import {
  loadAllCountryConfigs,
  loadCountryConfig,
} from "../src/lib/country-config";
import { buildCountryData } from "../src/lib/data-output";
import { searchUsersByLocation } from "../src/lib/github-client";
import { createOctokitClient } from "../src/lib/octokit-github-client";

// Usage:
//   pnpm tsx scripts/collect.ts                    # all countries, all users
//   pnpm tsx scripts/collect.ts --country taiwan   # single country
//   pnpm tsx scripts/collect.ts --limit 100        # max 100 users per country
//   pnpm tsx scripts/collect.ts --country taiwan --limit 50

const args = process.argv.slice(2);
const countryArg = args.includes("--country")
  ? args[args.indexOf("--country") + 1]
  : null;
const limitArg = args.includes("--limit")
  ? Number(args[args.indexOf("--limit") + 1])
  : null;

const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.error("GITHUB_TOKEN is required");
  process.exit(1);
}

const client = createOctokitClient(token);

// Load configs
let configs;
if (countryArg) {
  try {
    const config = await loadCountryConfig(
      `config/countries/${countryArg}.json`,
    );
    configs = [config];
  } catch {
    console.error(
      `Country config not found: config/countries/${countryArg}.json`,
    );
    process.exit(1);
  }
} else {
  configs = await loadAllCountryConfigs("config/countries");
}

console.log(
  `Collecting ${configs.length} country(ies)${limitArg ? ` (limit: ${limitArg} users each)` : ""}...`,
);

for (const config of configs) {
  console.log(`\n${config.flag} ${config.name}...`);

  let users = await searchUsersByLocation(
    client,
    config.locations,
    config.code,
  );
  console.log(`  Found ${users.length} users`);

  if (limitArg && users.length > limitArg) {
    users = users.slice(0, limitArg);
    console.log(`  Limited to ${limitArg} users`);
  }

  const data = buildCountryData(config.code, users);
  const outputPath = path.join("public/data", `${config.code}.json`);

  await fs.mkdir("public/data", { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(data, null, 2));
  console.log(`  Saved to ${outputPath}`);
}

console.log("\nDone!");
