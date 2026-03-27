import fs from "node:fs/promises";
import type { APIRoute, GetStaticPaths } from "astro";
import { loadAllCountryConfigs } from "../../lib/country-config";
import type { CountryData } from "../../lib/data-output";
import { generateCountryOgImage } from "../../lib/og-image";

export const getStaticPaths: GetStaticPaths = async () => {
  const configs = await loadAllCountryConfigs("config/countries");
  return configs.map((config) => ({
    params: { country: config.code },
    props: { config },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const { config } = props;

  let topUsers: { login: string; publicContributions: number }[] = [];
  try {
    const raw = await fs.readFile(`data/${config.code}.json`, "utf-8");
    const data: CountryData = JSON.parse(raw);
    topUsers = data.rankings.public_contributions.slice(0, 5);
  } catch {
    // No data yet
  }

  const png = await generateCountryOgImage(config.name, config.flag, topUsers);
  return new Response(Buffer.from(png), {
    headers: { "Content-Type": "image/png" },
  });
};
