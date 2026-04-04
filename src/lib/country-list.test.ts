import { describe, expect, it } from "vitest";
import {
  CONTINENT_MAP,
  type CountrySummary,
  calcHeat,
  filterCountries,
  groupByContinent,
  sortCountries,
} from "./country-list";

function makeSummary(overrides: Partial<CountrySummary> = {}): CountrySummary {
  return {
    code: "taiwan",
    name: "Taiwan",
    flag: "\u{1F1F9}\u{1F1FC}",
    devCount: 450,
    totalContributions: 182000,
    ...overrides,
  };
}

describe("CONTINENT_MAP", () => {
  it("maps taiwan to Asia", () => {
    expect(CONTINENT_MAP.taiwan).toBe("Asia");
  });

  it("maps germany to Europe", () => {
    expect(CONTINENT_MAP.germany).toBe("Europe");
  });

  it("maps united-states to Americas", () => {
    expect(CONTINENT_MAP["united-states"]).toBe("Americas");
  });

  it("maps nigeria to Africa", () => {
    expect(CONTINENT_MAP.nigeria).toBe("Africa");
  });

  it("maps australia to Oceania", () => {
    expect(CONTINENT_MAP.australia).toBe("Oceania");
  });
});

describe("groupByContinent", () => {
  it("groups countries by continent", () => {
    const countries = [
      makeSummary({ code: "taiwan", name: "Taiwan" }),
      makeSummary({ code: "japan", name: "Japan" }),
      makeSummary({ code: "germany", name: "Germany" }),
    ];
    const grouped = groupByContinent(countries);
    expect(grouped.Asia).toHaveLength(2);
    expect(grouped.Europe).toHaveLength(1);
    expect(grouped.Americas).toBeUndefined();
  });

  it("returns empty object for empty input", () => {
    expect(groupByContinent([])).toEqual({});
  });

  it("puts unknown codes into Other", () => {
    const countries = [makeSummary({ code: "atlantis", name: "Atlantis" })];
    const grouped = groupByContinent(countries);
    expect(grouped.Other).toHaveLength(1);
  });
});

describe("filterCountries", () => {
  const countries = [
    makeSummary({ code: "taiwan", name: "Taiwan" }),
    makeSummary({ code: "japan", name: "Japan" }),
    makeSummary({ code: "germany", name: "Germany" }),
  ];

  it("returns all when query is empty", () => {
    expect(filterCountries(countries, "")).toHaveLength(3);
  });

  it("filters by name case-insensitively", () => {
    expect(filterCountries(countries, "tai")).toHaveLength(1);
    expect(filterCountries(countries, "TAI")).toHaveLength(1);
  });

  it("filters by code", () => {
    expect(filterCountries(countries, "japan")).toHaveLength(1);
  });

  it("returns empty when no match", () => {
    expect(filterCountries(countries, "xyz")).toHaveLength(0);
  });
});

describe("sortCountries", () => {
  const countries = [
    makeSummary({ code: "taiwan", name: "Taiwan", devCount: 450 }),
    makeSummary({ code: "japan", name: "Japan", devCount: 1200 }),
    makeSummary({ code: "germany", name: "Germany", devCount: 800 }),
  ];

  it("sorts by devCount descending", () => {
    const sorted = sortCountries(countries, "devs");
    expect(sorted[0].name).toBe("Japan");
    expect(sorted[1].name).toBe("Germany");
    expect(sorted[2].name).toBe("Taiwan");
  });

  it("sorts by name ascending", () => {
    const sorted = sortCountries(countries, "name");
    expect(sorted[0].name).toBe("Germany");
    expect(sorted[1].name).toBe("Japan");
    expect(sorted[2].name).toBe("Taiwan");
  });

  it("does not mutate original array", () => {
    const original = [...countries];
    sortCountries(countries, "devs");
    expect(countries).toEqual(original);
  });
});

describe("calcHeat", () => {
  it("returns 0 when maxDevs is 0", () => {
    expect(calcHeat(100, 0)).toBe(0);
  });

  it("returns 1 when devCount equals maxDevs", () => {
    expect(calcHeat(1000, 1000)).toBe(1);
  });

  it("returns ratio between 0 and 1", () => {
    const heat = calcHeat(500, 1000);
    expect(heat).toBe(0.5);
  });
});
