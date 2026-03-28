/**
 * Known ambiguous location names that match multiple countries/regions.
 * Key: lowercase location keyword
 * Value: list of exclusion patterns (if user's location matches these, they're from the wrong place)
 */
const AMBIGUOUS_LOCATIONS: Record<
  string,
  { country: string; excludePatterns: RegExp[] }[]
> = {
  georgia: [
    {
      country: "georgia", // the country (Tbilisi, Batumi)
      excludePatterns: [
        /\bUS\b/i,
        /\bUSA\b/i,
        /\bUnited States\b/i,
        /\bAtlanta\b/i,
        /\bSavannah\b/i,
        /\bAugusta\b/i,
      ],
    },
  ],
  granada: [
    {
      country: "nicaragua",
      excludePatterns: [/\bSpain\b/i, /\bEspaña\b/i, /\bAndaluc/i],
    },
    {
      country: "spain",
      excludePatterns: [/\bNicaragua\b/i],
    },
  ],
};

/**
 * Determine if a user should be excluded based on their actual location
 * vs the country we're searching for.
 *
 * @param searchCountry The country code we're collecting data for
 * @param userLocation The user's GitHub profile location string
 * @returns true if the user should be excluded (wrong country)
 */
export function shouldExcludeUser(
  searchCountry: string,
  userLocation: string | null,
): boolean {
  if (!userLocation) return false;

  const lower = userLocation.toLowerCase();

  // Check each ambiguous location
  for (const [keyword, rules] of Object.entries(AMBIGUOUS_LOCATIONS)) {
    if (!lower.includes(keyword)) continue;

    for (const rule of rules) {
      if (rule.country === searchCountry) {
        // We're searching for this country — exclude if user matches exclusion patterns
        for (const pattern of rule.excludePatterns) {
          if (pattern.test(userLocation)) {
            return true;
          }
        }
      }
    }
  }

  return false;
}
