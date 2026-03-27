import fs from "node:fs";
import { Resvg } from "@resvg/resvg-js";
import satori from "satori";

let fontsLoaded:
  | { name: string; data: Buffer; weight: 400 | 700; style: "normal" }[]
  | null = null;

function loadFonts() {
  if (fontsLoaded) return fontsLoaded;

  // Use system fonts or bundled fonts
  // For now, we'll use a simple approach
  try {
    const regular = fs.readFileSync("public/fonts/Inter-Regular.woff");
    const bold = fs.readFileSync("public/fonts/Inter-Bold.woff");
    fontsLoaded = [
      {
        name: "Inter",
        data: regular,
        weight: 400 as const,
        style: "normal" as const,
      },
      {
        name: "Inter",
        data: bold,
        weight: 700 as const,
        style: "normal" as const,
      },
    ];
  } catch {
    throw new Error(
      "Font files not found at public/fonts/Inter-Regular.woff and public/fonts/Inter-Bold.woff",
    );
  }
  return fontsLoaded;
}

export async function generateCountryOgImage(
  countryName: string,
  flag: string,
  topUsers: { login: string; publicContributions: number }[],
): Promise<Uint8Array> {
  const fonts = loadFonts();

  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: "60px",
          backgroundColor: "#0f172a",
          color: "#f8fafc",
          fontFamily: "Inter",
        },
        children: [
          {
            type: "div",
            props: {
              style: { display: "flex", flexDirection: "column" },
              children: [
                {
                  type: "div",
                  props: {
                    style: { fontSize: 72, marginBottom: 8 },
                    children: `${flag} ${countryName}`,
                  },
                },
                {
                  type: "div",
                  props: {
                    style: { fontSize: 36, color: "#94a3b8" },
                    children: "Top GitHub Developers",
                  },
                },
              ],
            },
          },
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                gap: 24,
                fontSize: 24,
                color: "#94a3b8",
              },
              children: topUsers.slice(0, 5).map((u, i) => ({
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    gap: 8,
                    color:
                      i === 0
                        ? "#fbbf24"
                        : i === 1
                          ? "#94a3b8"
                          : i === 2
                            ? "#b45309"
                            : "#64748b",
                  },
                  children: `#${i + 1} ${u.login}`,
                },
              })),
            },
          },
          {
            type: "div",
            props: {
              style: { fontSize: 20, color: "#475569" },
              children: "CodeAtlas",
            },
          },
        ],
      },
    },
    { width: 1200, height: 630, fonts },
  );

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width" as const, value: 1200 },
    font: { loadSystemFonts: false },
  });
  return resvg.render().asPng();
}

export async function generateUserOgImage(
  username: string,
  avatarBase64: string,
  rank: number,
  contributions: number,
  countryName: string,
  flag: string,
): Promise<Uint8Array> {
  const fonts = loadFonts();

  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          padding: "60px",
          backgroundColor: "#0f172a",
          color: "#f8fafc",
          fontFamily: "Inter",
          gap: "40px",
        },
        children: [
          {
            type: "img",
            props: {
              src: avatarBase64,
              width: 200,
              height: 200,
              style: { borderRadius: "50%" },
            },
          },
          {
            type: "div",
            props: {
              style: { display: "flex", flexDirection: "column" },
              children: [
                {
                  type: "div",
                  props: {
                    style: { fontSize: 56, fontWeight: 700 },
                    children: username,
                  },
                },
                {
                  type: "div",
                  props: {
                    style: { fontSize: 36, color: "#fbbf24", marginTop: 8 },
                    children: `#${rank} in ${flag} ${countryName}`,
                  },
                },
                {
                  type: "div",
                  props: {
                    style: { fontSize: 28, color: "#94a3b8", marginTop: 12 },
                    children: `${contributions.toLocaleString()} contributions`,
                  },
                },
              ],
            },
          },
        ],
      },
    },
    { width: 1200, height: 630, fonts },
  );

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width" as const, value: 1200 },
    font: { loadSystemFonts: false },
  });
  return resvg.render().asPng();
}
