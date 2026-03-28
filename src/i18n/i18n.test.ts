import { describe, expect, it } from "vitest";
import { isValidLocale, type Locale, SUPPORTED_LOCALES, t } from "./i18n";

describe("SUPPORTED_LOCALES", () => {
  it("contains en and zh-TW", () => {
    expect(SUPPORTED_LOCALES).toContain("en");
    expect(SUPPORTED_LOCALES).toContain("zh-TW");
  });
});

describe("isValidLocale", () => {
  it("returns true for en", () => {
    expect(isValidLocale("en")).toBe(true);
  });

  it("returns true for zh-TW", () => {
    expect(isValidLocale("zh-TW")).toBe(true);
  });

  it("returns false for unsupported locale", () => {
    expect(isValidLocale("fr")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isValidLocale("")).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isValidLocale(undefined)).toBe(false);
  });
});

describe("t", () => {
  it("returns English translation by default", () => {
    expect(t("nav.home")).toBe("CodeAtlas");
  });

  it("returns English translation for en locale", () => {
    expect(t("nav.faq", "en")).toBe("FAQ");
  });

  it("returns Chinese translation for zh-TW locale", () => {
    expect(t("nav.faq", "zh-TW")).toBe("常見問題");
  });

  it("returns key as fallback for missing key", () => {
    expect(t("nonexistent.key" as any, "en")).toBe("nonexistent.key");
  });

  it("returns English translation for invalid locale", () => {
    expect(t("nav.home", "fr" as any)).toBe("CodeAtlas");
  });
});
