import fs from "node:fs";
import path from "node:path";

// Usage:
//   pnpm tsx scripts/generate-sample-data.ts        # 10 users per country (default)
//   pnpm tsx scripts/generate-sample-data.ts 1000   # 1000 users per country

const LIMIT = Number(process.argv[2] || "10");
const CONFIG_DIR = "config/countries";

// Read country configs from existing JSON files
const configFiles = fs
  .readdirSync(CONFIG_DIR)
  .filter((f) => f.endsWith(".json"));
const countries = configFiles.map((f) =>
  JSON.parse(fs.readFileSync(path.join(CONFIG_DIR, f), "utf-8")),
);

const LANGS = [
  "TypeScript",
  "JavaScript",
  "Python",
  "Go",
  "Rust",
  "Java",
  "C++",
  "Ruby",
  "PHP",
  "Swift",
  "Kotlin",
  "Dart",
];
const COMPANIES = [
  "Google",
  "Microsoft",
  "Amazon",
  "Meta",
  "Apple",
  "GitHub",
  "Vercel",
  "Stripe",
  null,
  null,
  null,
  null,
];
const DESCS = [
  "A modern CLI tool",
  "Web framework for developers",
  "Data pipeline library",
  "Open source utilities",
  "API wrapper",
  null,
];

function rand(a: number, b: number) {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}
function pick<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
}

console.log(
  `Generating sample data: ${countries.length} countries × ${LIMIT} users`,
);

for (let idx = 0; idx < countries.length; idx++) {
  const { code, name, locations } = countries[idx];

  const users = [];
  for (let i = 0; i < LIMIT; i++) {
    const decay = Math.exp(-i * 0.04);
    const login = `${code.slice(0, 3)}-dev-${i + 1}`;
    const pub = Math.round(35000 * decay + rand(50, 200));
    const priv = rand(0, 500);
    const fol = Math.round(5000 * decay + rand(10, 50));
    const langs = pick(LANGS, rand(1, 4));
    const repos = Array.from({ length: rand(1, 3) }, (_, j) => ({
      name: `${login}-proj-${j + 1}`,
      description: DESCS[rand(0, DESCS.length - 1)],
      stars: Math.round(2000 * decay * Math.random() + rand(5, 50)),
      language: langs[j % langs.length],
    }));

    users.push({
      login,
      avatarUrl: `https://avatars.githubusercontent.com/u/${(idx + 1) * 1000 + i}?v=4`,
      name: `Dev ${i + 1} (${name})`,
      company: COMPANIES[rand(0, COMPANIES.length - 1)],
      location: locations[rand(0, locations.length - 1)],
      bio: i < 3 ? `Developer from ${name}` : null,
      followers: fol,
      publicContributions: pub,
      privateContributions: priv,
      languages: langs,
      topRepos: repos,
      twitterUsername: i < 2 ? login : null,
      blog: i < 1 ? `https://${login}.dev` : null,
    });
  }

  const byPub = [...users].sort(
    (a, b) => b.publicContributions - a.publicContributions,
  );
  const byTot = [...users].sort(
    (a, b) =>
      b.publicContributions +
      b.privateContributions -
      (a.publicContributions + a.privateContributions),
  );
  const byFol = [...users].sort((a, b) => b.followers - a.followers);

  fs.mkdirSync("public/data", { recursive: true });
  fs.writeFileSync(
    `public/data/${code}.json`,
    JSON.stringify(
      {
        countryCode: code,
        updatedAt: new Date().toISOString(),
        users: [],
        rankings: {
          public_contributions: byPub,
          total_contributions: byTot,
          followers: byFol,
        },
      },
      null,
      2,
    ),
  );

  if ((idx + 1) % 20 === 0) console.log(`  ${idx + 1} countries...`);
}

console.log(`Done! ${countries.length} countries × ${LIMIT} users.`);
