import { describe, expect, it } from "vitest";
import { buildUrl } from "./url";

describe("buildUrl", () => {
  it("prepends base to path", () => {
    expect(buildUrl("taiwan/", "/codeatlas/")).toBe("/codeatlas/taiwan/");
  });

  it("handles path with leading slash", () => {
    expect(buildUrl("/taiwan/", "/codeatlas/")).toBe("/codeatlas/taiwan/");
  });

  it("handles base without trailing slash", () => {
    expect(buildUrl("faq", "/codeatlas")).toBe("/codeatlas/faq");
  });

  it("handles root base", () => {
    expect(buildUrl("taiwan/", "/")).toBe("/taiwan/");
  });

  it("handles empty path", () => {
    expect(buildUrl("", "/codeatlas/")).toBe("/codeatlas/");
  });
});
