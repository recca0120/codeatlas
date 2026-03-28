import fs from "node:fs";
import { generateCountryOgImage } from "../src/lib/og-image";

async function main() {
  const png = await generateCountryOgImage(
    "Global Developer Rankings",
    "🌍",
    [],
  );
  fs.writeFileSync("public/og.png", png);
  console.log("Generated public/og.png");
}

main();
