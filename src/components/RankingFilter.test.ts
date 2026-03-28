// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
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
  beforeEach(() => {
    window.history.replaceState({}, "", "/");
  });

  it("renders all users", () => {
    render(RankingFilter, { users });
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("Carol")).toBeInTheDocument();
  });

  it("shows correct rank numbers for default dimension (public contributions)", () => {
    render(RankingFilter, { users });
    const links = screen.getAllByRole("link");
    // sorted by publicContributions: Alice(500) > Bob(300) > Carol(100)
    expect(links[0]).toHaveTextContent("1");
    expect(links[0]).toHaveTextContent("Alice");
    expect(links[1]).toHaveTextContent("2");
    expect(links[1]).toHaveTextContent("Bob");
    expect(links[2]).toHaveTextContent("3");
    expect(links[2]).toHaveTextContent("Carol");
  });

  it("shows correct rank numbers after switching to followers tab", async () => {
    const user = userEvent.setup();
    render(RankingFilter, { users });

    await user.click(screen.getByRole("button", { name: "Followers" }));

    const links = screen.getAllByRole("link");
    // sorted by followers: Bob(200) > Alice(100) > Carol(50)
    expect(links[0]).toHaveTextContent("1");
    expect(links[0]).toHaveTextContent("Bob");
    expect(links[1]).toHaveTextContent("2");
    expect(links[1]).toHaveTextContent("Alice");
    expect(links[2]).toHaveTextContent("3");
    expect(links[2]).toHaveTextContent("Carol");
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

  it("has per-page selector with default 50", () => {
    render(RankingFilter, { users });
    const select = screen.getByRole("combobox", { name: /per page/i });
    expect(select).toBeInTheDocument();
    expect((select as HTMLSelectElement).value).toBe("50");
  });

  it("changes visible users when per-page is changed", async () => {
    const manyUsers = Array.from({ length: 60 }, (_, i) =>
      createMockUser({
        login: `user-${i}`,
        name: `User ${i}`,
        publicContributions: 1000 - i,
      }),
    );
    const user = userEvent.setup();
    const { container } = render(RankingFilter, { users: manyUsers });

    // Default 50 per page
    await waitFor(() => {
      expect(container.querySelectorAll("a[href]")).toHaveLength(50);
    });

    // Change to 25
    await user.selectOptions(
      screen.getByRole("combobox", { name: /per page/i }),
      "25",
    );
    await waitFor(() => {
      expect(container.querySelectorAll("a[href]")).toHaveLength(25);
    });
  });

  it("shows no results message when search has no matches", async () => {
    const user = userEvent.setup();
    render(RankingFilter, { users });

    await user.type(screen.getByPlaceholderText("Search developer..."), "zzz");

    expect(screen.getByText("No results")).toBeInTheDocument();
  });
});
