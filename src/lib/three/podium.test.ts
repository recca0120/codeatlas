import { describe, expect, it } from "vitest";
import { createMockUser } from "../test-utils";
import { createPodium } from "./podium";

describe("createPodium", () => {
  it("creates a group with 3 podium meshes", () => {
    const group = createPodium({
      first: createMockUser({ login: "alice" }),
      second: createMockUser({ login: "bob" }),
      third: createMockUser({ login: "carol" }),
    });
    expect(group.children.length).toBe(3);
  });

  it("center podium (index 1) is for #1 rank", () => {
    const group = createPodium({
      first: createMockUser({ login: "alice" }),
      second: createMockUser({ login: "bob" }),
      third: createMockUser({ login: "carol" }),
    });
    const meshes = group.children.filter((c) => (c as any).isMesh);
    expect(meshes[1].userData.rank).toBe(1);
    expect(meshes[1].userData.user.login).toBe("alice");
  });

  it("center podium is tallest", () => {
    const group = createPodium({
      first: createMockUser({ login: "alice" }),
      second: createMockUser({ login: "bob" }),
      third: createMockUser({ login: "carol" }),
    });
    const meshes = group.children.filter((c) => (c as any).isMesh);
    expect(meshes[1].position.y).toBeGreaterThan(meshes[0].position.y);
    expect(meshes[1].position.y).toBeGreaterThan(meshes[2].position.y);
  });
});
