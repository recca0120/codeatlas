// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCurrentPath, navigate } from "./router";

describe("router", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/");
  });

  describe("navigate", () => {
    it("calls pushState with the given path", () => {
      const spy = vi.spyOn(window.history, "pushState");
      navigate("/taiwan/");
      expect(spy).toHaveBeenCalledWith({}, "", "/taiwan/");
      spy.mockRestore();
    });

    it("dispatches a popstate event", () => {
      const handler = vi.fn();
      window.addEventListener("popstate", handler);
      navigate("/taiwan/");
      expect(handler).toHaveBeenCalled();
      window.removeEventListener("popstate", handler);
    });
  });

  describe("getCurrentPath", () => {
    it("returns pathname without basePath", () => {
      window.history.replaceState({}, "", "/codeatlas/taiwan/");
      expect(getCurrentPath("/codeatlas")).toBe("/taiwan/");
    });

    it("returns pathname when no basePath", () => {
      window.history.replaceState({}, "", "/taiwan/");
      expect(getCurrentPath("")).toBe("/taiwan/");
    });

    it("strips locale prefix", () => {
      window.history.replaceState({}, "", "/codeatlas/zh-TW/taiwan/");
      expect(getCurrentPath("/codeatlas", "zh-TW")).toBe("/taiwan/");
    });
  });
});
