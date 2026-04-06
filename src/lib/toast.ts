import { z } from "zod";

let container: HTMLDivElement | null = null;

function getContainer(): HTMLDivElement {
  if (container) return container;
  container = document.createElement("div");
  container.style.cssText =
    "position:fixed;top:16px;right:16px;z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none;";
  document.body.appendChild(container);
  return container;
}

export function toast(
  message: string,
  type: "error" | "info" = "info",
  duration = 5000,
) {
  const el = document.createElement("div");
  el.style.cssText = `
    padding:12px 20px;border-radius:8px;font-size:13px;font-family:Inter,system-ui,sans-serif;
    max-width:400px;pointer-events:auto;animation:toastIn .3s ease;
    color:#fafafa;box-shadow:0 4px 12px rgba(0,0,0,.3);
    background:${type === "error" ? "#dc2626" : "#3f3f46"};
  `;
  el.textContent = message;

  const style = document.createElement("style");
  style.textContent =
    "@keyframes toastIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}";
  if (!document.querySelector("style[data-toast]")) {
    style.setAttribute("data-toast", "");
    document.head.appendChild(style);
  }

  getContainer().appendChild(el);
  setTimeout(() => {
    el.style.opacity = "0";
    el.style.transition = "opacity .3s";
    setTimeout(() => el.remove(), 300);
  }, duration);
}

export function toastZodError(e: unknown): void {
  if (e instanceof z.ZodError) {
    toast(
      `Data validation error: ${e.issues.map((i) => i.message).join(", ")}`,
      "error",
    );
  }
}
