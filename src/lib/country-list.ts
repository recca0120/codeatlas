import type { CountrySummary } from "./data-output";

export { type CountrySummary, CountrySummarySchema } from "./data-output";

export type SortKey = "devs" | "name";

export const CONTINENTS = [
  "Asia",
  "Europe",
  "Americas",
  "Africa",
  "Oceania",
] as const;
export const CONTINENT_MAP: Record<string, string> = {
  afghanistan: "Asia",
  albania: "Europe",
  algeria: "Africa",
  andorra: "Europe",
  angola: "Africa",
  argentina: "Americas",
  armenia: "Asia",
  australia: "Oceania",
  austria: "Europe",
  azerbaijan: "Asia",
  bahrain: "Asia",
  bangladesh: "Asia",
  belarus: "Europe",
  belgium: "Europe",
  benin: "Africa",
  bhutan: "Asia",
  bolivia: "Americas",
  "bosnia-and-herzegovina": "Europe",
  botswana: "Africa",
  brazil: "Americas",
  bulgaria: "Europe",
  "burkina-faso": "Africa",
  burundi: "Africa",
  cambodia: "Asia",
  cameroon: "Africa",
  canada: "Americas",
  chad: "Africa",
  chile: "Americas",
  china: "Asia",
  "hong-kong": "Asia",
  taiwan: "Asia",
  colombia: "Americas",
  congo: "Africa",
  croatia: "Europe",
  cuba: "Americas",
  cyprus: "Europe",
  czechia: "Europe",
  denmark: "Europe",
  "dominican-republic": "Americas",
  ecuador: "Americas",
  egypt: "Africa",
  "el-salvador": "Americas",
  estonia: "Europe",
  ethiopia: "Africa",
  finland: "Europe",
  france: "Europe",
  georgia: "Asia",
  germany: "Europe",
  ghana: "Africa",
  greece: "Europe",
  guatemala: "Americas",
  honduras: "Americas",
  hungary: "Europe",
  iceland: "Europe",
  india: "Asia",
  indonesia: "Asia",
  iran: "Asia",
  iraq: "Asia",
  ireland: "Europe",
  israel: "Asia",
  italy: "Europe",
  jamaica: "Americas",
  japan: "Asia",
  jordan: "Asia",
  kazakhstan: "Asia",
  kenya: "Africa",
  kuwait: "Asia",
  laos: "Asia",
  latvia: "Europe",
  lithuania: "Europe",
  luxembourg: "Europe",
  madagascar: "Africa",
  malawi: "Africa",
  malaysia: "Asia",
  maldives: "Asia",
  mali: "Africa",
  malta: "Europe",
  mauritius: "Africa",
  mexico: "Americas",
  moldova: "Europe",
  mongolia: "Asia",
  montenegro: "Europe",
  morocco: "Africa",
  mozambique: "Africa",
  myanmar: "Asia",
  namibia: "Africa",
  nepal: "Asia",
  netherlands: "Europe",
  "new-zealand": "Oceania",
  nicaragua: "Americas",
  nigeria: "Africa",
  norway: "Europe",
  oman: "Asia",
  pakistan: "Asia",
  palestine: "Asia",
  panama: "Americas",
  paraguay: "Americas",
  peru: "Americas",
  philippines: "Asia",
  poland: "Europe",
  portugal: "Europe",
  qatar: "Asia",
  romania: "Europe",
  russia: "Europe",
  rwanda: "Africa",
  "saudi-arabia": "Asia",
  senegal: "Africa",
  serbia: "Europe",
  singapore: "Asia",
  slovakia: "Europe",
  slovenia: "Europe",
  "south-africa": "Africa",
  "south-korea": "Asia",
  spain: "Europe",
  "sri-lanka": "Asia",
  sudan: "Africa",
  sweden: "Europe",
  switzerland: "Europe",
  syria: "Asia",
  tanzania: "Africa",
  thailand: "Asia",
  tunisia: "Africa",
  turkey: "Europe",
  uganda: "Africa",
  ukraine: "Europe",
  "united-arab-emirates": "Asia",
  "united-kingdom": "Europe",
  "united-states": "Americas",
  uruguay: "Americas",
  uzbekistan: "Asia",
  venezuela: "Americas",
  vietnam: "Asia",
  zambia: "Africa",
  zimbabwe: "Africa",
};

export function groupByContinent(
  countries: CountrySummary[],
): Record<string, CountrySummary[]> {
  const grouped: Record<string, CountrySummary[]> = {};
  for (const c of countries) {
    const cont = CONTINENT_MAP[c.code] || "Other";
    if (!grouped[cont]) grouped[cont] = [];
    grouped[cont].push(c);
  }
  return grouped;
}

export function filterCountriesByQuery(
  countries: CountrySummary[],
  query: string,
): CountrySummary[] {
  if (!query) return countries;
  const q = query.toLowerCase();
  return countries.filter(
    (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q),
  );
}

export function sortCountries(
  countries: CountrySummary[],
  sortKey: SortKey,
): CountrySummary[] {
  const sorted = [...countries];
  if (sortKey === "devs") {
    sorted.sort((a, b) => b.devCount - a.devCount);
  } else {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  }
  return sorted;
}

export function calcHeat(devCount: number, maxDevs: number): number {
  if (maxDevs === 0) return 0;
  return devCount / maxDevs;
}

export type Rank = "S" | "A" | "B" | "C";

export function calcRank(percentile: number): Rank {
  if (percentile <= 0.1) return "S";
  if (percentile <= 0.3) return "A";
  if (percentile <= 0.6) return "B";
  return "C";
}
