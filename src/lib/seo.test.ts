// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { updateMeta } from "./seo";

describe("updateMeta", () => {
  beforeEach(() => {
    document.title = "default";
    document.querySelector('meta[name="description"]')?.remove();
    document.querySelector('meta[property="og:title"]')?.remove();
    document.querySelector('meta[property="og:description"]')?.remove();
  });

  it("updates document title", () => {
    updateMeta({ title: "Taiwan Rankings" });
    expect(document.title).toBe("Taiwan Rankings");
  });

  it("updates meta description", () => {
    updateMeta({ description: "Top developers in Taiwan" });
    const meta = document.querySelector('meta[name="description"]');
    expect(meta?.getAttribute("content")).toBe("Top developers in Taiwan");
  });

  it("updates og:title and og:description", () => {
    updateMeta({ title: "Taiwan", description: "Top devs" });
    expect(
      document
        .querySelector('meta[property="og:title"]')
        ?.getAttribute("content"),
    ).toBe("Taiwan");
    expect(
      document
        .querySelector('meta[property="og:description"]')
        ?.getAttribute("content"),
    ).toBe("Top devs");
  });

  it("creates meta tags if they don't exist", () => {
    updateMeta({ title: "Test", description: "Desc" });
    expect(document.querySelector('meta[name="description"]')).not.toBeNull();
  });
});
