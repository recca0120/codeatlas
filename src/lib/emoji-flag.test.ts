import { describe, expect, it } from "vitest";
import { extractCountryFromEmojiFlag } from "./emoji-flag";

describe("extractCountryFromEmojiFlag", () => {
  it("detects Taiwan flag", () => {
    expect(extractCountryFromEmojiFlag("🇹🇼")).toBe("TW");
  });

  it("detects Japan flag", () => {
    expect(extractCountryFromEmojiFlag("🇯🇵 Tokyo")).toBe("JP");
  });

  it("detects US flag in middle of text", () => {
    expect(extractCountryFromEmojiFlag("Developer 🇺🇸 NYC")).toBe("US");
  });

  it("returns null for no flag", () => {
    expect(extractCountryFromEmojiFlag("Taipei, Taiwan")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(extractCountryFromEmojiFlag("")).toBeNull();
  });

  it("returns first flag if multiple", () => {
    expect(extractCountryFromEmojiFlag("🇹🇼🇯🇵")).toBe("TW");
  });
});
