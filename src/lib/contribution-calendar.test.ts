import { describe, expect, it } from "vitest";
import {
  type ContributionCalendar,
  getContributionLevel,
  getTotalContributions,
} from "./contribution-calendar";

describe("getContributionLevel", () => {
  it("returns 0 for zero contributions", () => {
    expect(getContributionLevel(0, 20)).toBe(0);
  });

  it("returns 4 for max contributions", () => {
    expect(getContributionLevel(20, 20)).toBe(4);
  });

  it("returns proportional level", () => {
    expect(getContributionLevel(5, 20)).toBe(1);
    expect(getContributionLevel(10, 20)).toBe(2);
    expect(getContributionLevel(15, 20)).toBe(3);
  });

  it("handles zero max", () => {
    expect(getContributionLevel(0, 0)).toBe(0);
  });
});

describe("getTotalContributions", () => {
  it("sums all days across weeks", () => {
    const calendar: ContributionCalendar = {
      weeks: [
        {
          contributionDays: [
            { date: "2025-01-06", count: 5 },
            { date: "2025-01-07", count: 3 },
          ],
        },
        { contributionDays: [{ date: "2025-01-13", count: 10 }] },
      ],
    };
    expect(getTotalContributions(calendar)).toBe(18);
  });

  it("returns 0 for empty calendar", () => {
    expect(getTotalContributions({ weeks: [] })).toBe(0);
  });
});
