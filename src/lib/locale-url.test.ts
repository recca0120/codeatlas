import { describe, expect, it } from "vitest";
import { getOtherLocaleUrl } from "./locale-url";

describe("getOtherLocaleUrl", () => {
  it("en homepage → zh-TW homepage", () => {
    expect(getOtherLocaleUrl("zh-TW", "/codeatlas/", "/codeatlas")).toBe(
      "/codeatlas/zh-TW/",
    );
  });

  it("zh-TW homepage → en homepage", () => {
    expect(getOtherLocaleUrl("en", "/codeatlas/zh-TW/", "/codeatlas")).toBe(
      "/codeatlas/",
    );
  });

  it("en country page → zh-TW country page", () => {
    expect(getOtherLocaleUrl("zh-TW", "/codeatlas/taiwan/", "/codeatlas")).toBe(
      "/codeatlas/zh-TW/taiwan/",
    );
  });

  it("zh-TW country page → en country page", () => {
    expect(
      getOtherLocaleUrl("en", "/codeatlas/zh-TW/taiwan/", "/codeatlas"),
    ).toBe("/codeatlas/taiwan/");
  });

  it("en profile page → zh-TW profile page", () => {
    expect(
      getOtherLocaleUrl("zh-TW", "/codeatlas/taiwan/recca0120", "/codeatlas"),
    ).toBe("/codeatlas/zh-TW/taiwan/recca0120");
  });

  it("zh-TW profile page → en profile page", () => {
    expect(
      getOtherLocaleUrl(
        "en",
        "/codeatlas/zh-TW/taiwan/recca0120",
        "/codeatlas",
      ),
    ).toBe("/codeatlas/taiwan/recca0120");
  });

  it("works without basePath prefix", () => {
    expect(getOtherLocaleUrl("zh-TW", "/taiwan/", "")).toBe("/zh-TW/taiwan/");
    expect(getOtherLocaleUrl("en", "/zh-TW/taiwan/", "")).toBe("/taiwan/");
  });
});
