// @vitest-environment jsdom
import { render, screen } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import LocaleSwitcher from "./LocaleSwitcher.svelte";

describe("LocaleSwitcher", () => {
  it("shows '中文' button when locale is en", () => {
    render(LocaleSwitcher, { locale: "en" });
    expect(screen.getByRole("button", { name: "中文" })).toBeInTheDocument();
    expect(screen.queryByText("English")).not.toBeInTheDocument();
  });

  it("shows 'EN' button when locale is zh-TW", () => {
    render(LocaleSwitcher, { locale: "zh-TW" });
    expect(screen.getByRole("button", { name: "EN" })).toBeInTheDocument();
    expect(screen.queryByText("中文")).not.toBeInTheDocument();
  });
});
