// @vitest-environment jsdom
import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import type { CountrySummary } from "../lib/country-list";
import CountryList from "./CountryList.svelte";

const tc = (logins: string[]) =>
  logins.map((login) => ({
    login,
    avatarUrl: `https://avatars.githubusercontent.com/${login}`,
  }));

const countries: CountrySummary[] = [
  {
    code: "taiwan",
    name: "Taiwan",
    flag: "\u{1F1F9}\u{1F1FC}",
    devCount: 450,
    totalContributions: 182000,
    topContributors: tc(["tw1", "tw2", "tw3"]),
  },
  {
    code: "japan",
    name: "Japan",
    flag: "\u{1F1EF}\u{1F1F5}",
    devCount: 1200,
    totalContributions: 520000,
    topContributors: tc(["jp1", "jp2", "jp3"]),
  },
  {
    code: "germany",
    name: "Germany",
    flag: "\u{1F1E9}\u{1F1EA}",
    devCount: 800,
    totalContributions: 340000,
    topContributors: tc(["de1", "de2"]),
  },
  {
    code: "brazil",
    name: "Brazil",
    flag: "\u{1F1E7}\u{1F1F7}",
    devCount: 600,
    totalContributions: 240000,
    topContributors: tc(["br1"]),
  },
  {
    code: "nigeria",
    name: "Nigeria",
    flag: "\u{1F1F3}\u{1F1EC}",
    devCount: 350,
    totalContributions: 140000,
    topContributors: tc(["ng1", "ng2", "ng3"]),
  },
  {
    code: "australia",
    name: "Australia",
    flag: "\u{1F1E6}\u{1F1FA}",
    devCount: 500,
    totalContributions: 210000,
    topContributors: [],
  },
];

describe("CountryList", () => {
  it("renders all countries by default (All tab)", () => {
    render(CountryList, { countries });
    for (const c of countries) {
      expect(screen.getByText(c.name)).toBeInTheDocument();
    }
  });

  it("shows All tab as active by default", () => {
    render(CountryList, { countries });
    const allTab = screen.getByRole("button", { name: /All/i });
    expect(allTab.className).toContain("active");
  });

  it("filters by continent when tab is clicked", async () => {
    const user = userEvent.setup();
    render(CountryList, { countries });

    await user.click(screen.getByRole("button", { name: /Asia/i }));

    expect(screen.getByText("Taiwan")).toBeInTheDocument();
    expect(screen.getByText("Japan")).toBeInTheDocument();
    expect(screen.queryByText("Germany")).not.toBeInTheDocument();
    expect(screen.queryByText("Brazil")).not.toBeInTheDocument();
  });

  it("filters by search query", async () => {
    const user = userEvent.setup();
    render(CountryList, { countries });

    const input = screen.getByPlaceholderText(/search/i);
    await user.type(input, "tai");

    expect(screen.getByText("Taiwan")).toBeInTheDocument();
    expect(screen.queryByText("Japan")).not.toBeInTheDocument();
  });

  it("sorts by name when name sort is clicked", async () => {
    const user = userEvent.setup();
    render(CountryList, { countries });

    // Switch to a single continent tab to test flat sort
    await user.click(screen.getByRole("button", { name: /Asia/i }));
    await user.click(screen.getByRole("button", { name: /Name/i }));

    const cards = screen.getAllByTestId("country-card");
    expect(cards[0].textContent).toContain("Japan");
    expect(cards[1].textContent).toContain("Taiwan");
  });

  it("sorts by developers by default (descending) within a continent tab", async () => {
    const user = userEvent.setup();
    render(CountryList, { countries });

    await user.click(screen.getByRole("button", { name: /Asia/i }));

    const cards = screen.getAllByTestId("country-card");
    expect(cards[0].textContent).toContain("Japan");
    expect(cards[1].textContent).toContain("Taiwan");
  });

  it("groups by continent in All tab", () => {
    render(CountryList, { countries });

    // Asia countries should appear before Europe countries
    const cards = screen.getAllByTestId("country-card");
    const names = cards.map((c) => c.textContent);
    const japanIdx = names.findIndex((t) => t?.includes("Japan"));
    const germanyIdx = names.findIndex((t) => t?.includes("Germany"));
    const brazilIdx = names.findIndex((t) => t?.includes("Brazil"));
    expect(japanIdx).toBeLessThan(germanyIdx);
    expect(germanyIdx).toBeLessThan(brazilIdx);
  });

  it("shows developer count on each card", () => {
    render(CountryList, { countries });
    expect(screen.getByText("1,200")).toBeInTheDocument();
    expect(screen.getByText("450")).toBeInTheDocument();
  });

  it("combines continent tab and search filter", async () => {
    const user = userEvent.setup();
    render(CountryList, { countries });

    await user.click(screen.getByRole("button", { name: /Asia/i }));
    const input = screen.getByPlaceholderText(/search/i);
    await user.type(input, "jap");

    expect(screen.getByText("Japan")).toBeInTheDocument();
    expect(screen.queryByText("Taiwan")).not.toBeInTheDocument();
  });

  it("renders top contributor avatars on cards", () => {
    render(CountryList, { countries });
    const avatars = screen.getAllByTestId("contributor-avatar");
    expect(avatars.length).toBeGreaterThan(0);
    expect(avatars[0]).toHaveAttribute(
      "src",
      expect.stringContaining("avatars.githubusercontent.com"),
    );
  });
});
