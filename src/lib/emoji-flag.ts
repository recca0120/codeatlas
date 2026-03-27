/**
 * Extract ISO country code from emoji flag in a string.
 * Emoji flags are composed of two Regional Indicator Symbols (U+1F1E6–U+1F1FF).
 *
 * Example: "🇹🇼" → "TW", "🇯🇵 Tokyo" → "JP"
 */
export function extractCountryFromEmojiFlag(text: string): string | null {
  // Regional Indicator Symbols: U+1F1E6 (🇦) to U+1F1FF (🇿)
  // A flag is two consecutive regional indicators
  const flagRegex = /[\u{1F1E6}-\u{1F1FF}][\u{1F1E6}-\u{1F1FF}]/u;

  const match = text.match(flagRegex);
  if (!match) return null;

  const chars = [...match[0]];
  if (chars.length !== 2) return null;

  const a = chars[0].codePointAt(0)! - 0x1f1e6 + 65; // 'A'
  const b = chars[1].codePointAt(0)! - 0x1f1e6 + 65;

  return String.fromCharCode(a) + String.fromCharCode(b);
}
