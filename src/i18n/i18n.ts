import en from "./locales/en";
import zhTW from "./locales/zh-TW";
import type { TranslationKey } from "./translations";

export const SUPPORTED_LOCALES = ["en", "zh-TW"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

const locales: Record<Locale, Record<string, string>> = {
  en,
  "zh-TW": zhTW,
};

export function isValidLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" && SUPPORTED_LOCALES.includes(value as Locale)
  );
}

export function t(key: TranslationKey, locale: string = "en"): string {
  const l = isValidLocale(locale) ? locale : "en";
  return locales[l][key] ?? key;
}
