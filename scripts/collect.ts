import fs from "node:fs/promises";
import path from "node:path";
import { loadAllCountryConfigs } from "../src/lib/country-config";
import { buildCountryData } from "../src/lib/data-output";
import { searchUsersByLocation } from "../src/lib/github-client";
import { createOctokitClient } from "../src/lib/octokit-github-client";

const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.error("GITHUB_TOKEN is required");
  process.exit(1);
}

const client = createOctokitClient(token);
const configs = await loadAllCountryConfigs("config/countries");

console.log(`Found ${configs.length} country configs`);

for (const config of configs) {
  console.log(`Collecting data for ${config.name}...`);

  const users = await searchUsersByLocation(client, config.locations);
  console.log(`  Found ${users.length} users`);

  const data = buildCountryData(config.code, users);
  const outputPath = path.join("data", `${config.code}.json`);

  await fs.mkdir("data", { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(data, null, 2));
  console.log(`  Saved to ${outputPath}`);
}

console.log("Done!");
