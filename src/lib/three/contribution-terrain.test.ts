import { describe, expect, it } from "vitest";
import {
  type ContributionWeek,
  createContributionTerrain,
  getContributionColor,
  getContributionHeight,
} from "./contribution-terrain";

describe("getContributionHeight", () => {
  it("returns min height for zero count", () => {
    expect(getContributionHeight(0, 10)).toBe(0.1);
  });

  it("returns max height for max count", () => {
    expect(getContributionHeight(10, 10)).toBe(5);
  });

  it("returns proportional height", () => {
    expect(getContributionHeight(5, 10)).toBe(2.5);
  });
});

describe("getContributionColor", () => {
  it("returns dark for zero contributions", () => {
    expect(getContributionColor(0, 10)).toBe(0x161b22);
  });

  it("returns gold for high contributions", () => {
    expect(getContributionColor(10, 10)).toBe(0xffd700);
  });

  it("returns green for medium contributions", () => {
    const color = getContributionColor(5, 10);
    expect(color).toBe(0x26a641); // 50% falls in 0.5-0.75 bracket = bright green
  });
});

describe("createContributionTerrain", () => {
  it("returns empty group for empty weeks", () => {
    const group = createContributionTerrain([]);
    expect(group.children).toHaveLength(0);
  });

  it("creates meshes for each day", () => {
    const weeks: ContributionWeek[] = [
      {
        contributionDays: [
          { date: "2025-01-06", count: 5 },
          { date: "2025-01-07", count: 3 },
        ],
      },
      {
        contributionDays: [{ date: "2025-01-13", count: 10 }],
      },
    ];
    const group = createContributionTerrain(weeks);
    expect(group.children).toHaveLength(3); // 2 + 1 days
  });

  it("stores date and count in userData", () => {
    const weeks: ContributionWeek[] = [
      {
        contributionDays: [{ date: "2025-01-06", count: 7 }],
      },
    ];
    const group = createContributionTerrain(weeks);
    expect(group.children[0].userData.date).toBe("2025-01-06");
    expect(group.children[0].userData.count).toBe(7);
  });
});
