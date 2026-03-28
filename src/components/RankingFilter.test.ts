// @vitest-environment jsdom
import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { createMockUser } from "../lib/test-utils";
import RankingFilter from "./RankingFilter.svelte";

const users = [
  createMockUser({
    login: "alice",
    name: "Alice",
    publicContributions: 500,
    followers: 100,
    location: "Taipei",
  }),
  createMockUser({
    login: "bob",
    name: "Bob",
    publicContributions: 300,
    followers: 200,
    location: "Kaohsiung",
  }),
  createMockUser({
    login: "carol",
    name: "Carol",
    publicContributions: 100,
    followers: 50,
    location: "Taipei",
  }),
];

describe("RankingFilter", () => {
  it("renders all users", () => {
    render(RankingFilter, { users });
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("Carol")).toBeInTheDocument();
  });

  it("shows correct rank numbers", () => {
    render(RankingFilter, { users });
    const links = screen.getAllByRole("link");
    expect(links[0]).toHaveTextContent("1");
    expect(links[0]).toHaveTextContent("Alice");
    expect(links[1]).toHaveTextContent("2");
    expect(links[2]).toHaveTextContent("3");
  });

  it("preserves original rank after search filter", async () => {
    const user = userEvent.setup();
    render(RankingFilter, { users });

    await user.type(
      screen.getByPlaceholderText("Search developer..."),
      "carol",
    );

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    // carol's rank should still be 3, not 1
    expect(links[0]).toHaveTextContent("3");
    expect(links[0]).toHaveTextContent("Carol");
  });

  it("filters by search query", async () => {
    const user = userEvent.setup();
    render(RankingFilter, { users });

    const input = screen.getByPlaceholderText("Search developer...");
    await user.clear(input);
    await user.type(input, "bob");

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveTextContent("Bob");
  });

  it("shows no results message when search has no matches", async () => {
    const user = userEvent.setup();
    render(RankingFilter, { users });

    await user.type(screen.getByPlaceholderText("Search developer..."), "zzz");

    expect(screen.getByText("No results")).toBeInTheDocument();
  });
});
