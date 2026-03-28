// @vitest-environment jsdom
import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LinkTest from "./LinkTest.test.svelte";

describe("Link", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/");
  });

  it("renders as an anchor tag with href", () => {
    render(LinkTest, { href: "/taiwan/", label: "Taiwan" });
    const link = screen.getByRole("link", { name: "Taiwan" });
    expect(link).toHaveAttribute("href", "/taiwan/");
  });

  it("navigates client-side on click (no page reload)", async () => {
    const user = userEvent.setup();
    const spy = vi.spyOn(window.history, "pushState");
    render(LinkTest, { href: "/taiwan/", label: "Taiwan" });

    await user.click(screen.getByRole("link", { name: "Taiwan" }));

    expect(spy).toHaveBeenCalledWith({}, "", "/taiwan/");
    spy.mockRestore();
  });

  it("does not intercept ctrl+click", async () => {
    const spy = vi.spyOn(window.history, "pushState");
    render(LinkTest, { href: "/taiwan/", label: "Taiwan" });

    const link = screen.getByRole("link", { name: "Taiwan" });
    const event = new MouseEvent("click", { bubbles: true, ctrlKey: true });
    link.dispatchEvent(event);

    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
