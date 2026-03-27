import { describe, expect, it } from "vitest";
import { createHttpClient } from "./http";

describe("createHttpClient", () => {
  it("returns a ky instance", () => {
    const client = createHttpClient("/codeatlas/");
    expect(client).toBeDefined();
    expect(typeof client.get).toBe("function");
  });

  it("accepts basePath parameter", () => {
    const client = createHttpClient("/myapp/");
    expect(client).toBeDefined();
  });

  it("defaults basePath to /", () => {
    const client = createHttpClient();
    expect(client).toBeDefined();
  });
});
