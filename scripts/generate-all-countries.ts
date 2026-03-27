import fs from "node:fs";

// Country list from gayanvoice/top-github-users config
const RAW_COUNTRIES = [
  { c: "afghanistan", n: "Afghanistan", ci: ["kabul", "kandahar", "herat"] },
  { c: "albania", n: "Albania", ci: ["tirana", "durrës", "vlorë"] },
  { c: "algeria", n: "Algeria", ci: ["algiers", "oran", "constantine"] },
  { c: "andorra", n: "Andorra", ci: ["andorra-la-vella"] },
  { c: "angola", n: "Angola", ci: ["luanda", "huambo"] },
  {
    c: "argentina",
    n: "Argentina",
    ci: ["buenos-aires", "cordoba", "rosario"],
  },
  { c: "armenia", n: "Armenia", ci: ["yerevan", "gyumri"] },
  {
    c: "australia",
    n: "Australia",
    ci: ["sydney", "melbourne", "perth", "brisbane"],
  },
  {
    c: "austria",
    n: "Austria",
    ci: ["vienna", "salzburg", "innsbruck", "graz"],
  },
  { c: "azerbaijan", n: "Azerbaijan", ci: ["baku"] },
  { c: "bahrain", n: "Bahrain", ci: ["manama"] },
  { c: "bangladesh", n: "Bangladesh", ci: ["dhaka", "chittagong", "rajshahi"] },
  { c: "belarus", n: "Belarus", ci: ["minsk", "gomel"] },
  { c: "belgium", n: "Belgium", ci: ["brussels", "antwerp", "ghent"] },
  { c: "benin", n: "Benin", ci: ["cotonou", "porto-novo"] },
  { c: "bhutan", n: "Bhutan", ci: ["thimphu"] },
  { c: "bolivia", n: "Bolivia", ci: ["la-paz", "cochabamba", "santa-cruz"] },
  {
    c: "bosnia-and-herzegovina",
    n: "Bosnia and Herzegovina",
    ci: ["sarajevo", "mostar"],
  },
  { c: "botswana", n: "Botswana", ci: ["gaborone"] },
  {
    c: "brazil",
    n: "Brazil",
    ci: [
      "sao-paulo",
      "rio-de-janeiro",
      "brasilia",
      "belo-horizonte",
      "curitiba",
    ],
  },
  { c: "bulgaria", n: "Bulgaria", ci: ["sofia", "plovdiv", "varna"] },
  { c: "burkina-faso", n: "Burkina Faso", ci: ["ouagadougou"] },
  { c: "burundi", n: "Burundi", ci: ["bujumbura"] },
  { c: "cambodia", n: "Cambodia", ci: ["phnom-penh", "siem-reap"] },
  { c: "cameroon", n: "Cameroon", ci: ["yaounde", "douala"] },
  {
    c: "canada",
    n: "Canada",
    ci: ["toronto", "montreal", "vancouver", "calgary", "ottawa"],
  },
  { c: "chad", n: "Chad", ci: ["ndjamena"] },
  { c: "chile", n: "Chile", ci: ["santiago", "valparaiso", "concepcion"] },
  {
    c: "china",
    n: "China",
    ci: ["beijing", "shanghai", "shenzhen", "guangzhou", "chengdu"],
  },
  { c: "hong-kong", n: "Hong Kong", ci: ["hong-kong"] },
  {
    c: "taiwan",
    n: "Taiwan",
    ci: ["taipei", "kaohsiung", "taichung", "tainan", "hsinchu"],
  },
  { c: "colombia", n: "Colombia", ci: ["bogota", "medellin", "cali"] },
  { c: "congo", n: "Congo", ci: ["brazzaville"] },
  { c: "croatia", n: "Croatia", ci: ["zagreb", "split", "dubrovnik"] },
  { c: "cuba", n: "Cuba", ci: ["havana"] },
  { c: "cyprus", n: "Cyprus", ci: ["nicosia", "limassol"] },
  { c: "czechia", n: "Czechia", ci: ["prague", "brno"] },
  { c: "denmark", n: "Denmark", ci: ["copenhagen", "aarhus"] },
  { c: "dominican-republic", n: "Dominican Republic", ci: ["santo-domingo"] },
  { c: "ecuador", n: "Ecuador", ci: ["quito", "guayaquil"] },
  { c: "egypt", n: "Egypt", ci: ["cairo", "alexandria"] },
  { c: "el-salvador", n: "El Salvador", ci: ["san-salvador"] },
  { c: "estonia", n: "Estonia", ci: ["tallinn", "tartu"] },
  { c: "ethiopia", n: "Ethiopia", ci: ["addis-ababa"] },
  { c: "finland", n: "Finland", ci: ["helsinki", "tampere", "oulu"] },
  {
    c: "france",
    n: "France",
    ci: ["paris", "lyon", "toulouse", "marseille", "nantes"],
  },
  { c: "georgia", n: "Georgia", ci: ["tbilisi", "batumi"] },
  {
    c: "germany",
    n: "Germany",
    ci: ["berlin", "munich", "hamburg", "frankfurt", "stuttgart"],
  },
  { c: "ghana", n: "Ghana", ci: ["accra", "kumasi"] },
  { c: "greece", n: "Greece", ci: ["athens", "thessaloniki"] },
  { c: "guatemala", n: "Guatemala", ci: ["guatemala-city"] },
  { c: "honduras", n: "Honduras", ci: ["tegucigalpa"] },
  { c: "hungary", n: "Hungary", ci: ["budapest", "debrecen"] },
  { c: "iceland", n: "Iceland", ci: ["reykjavik"] },
  {
    c: "india",
    n: "India",
    ci: ["bangalore", "mumbai", "delhi", "hyderabad", "pune", "chennai"],
  },
  { c: "indonesia", n: "Indonesia", ci: ["jakarta", "bandung", "surabaya"] },
  { c: "iran", n: "Iran", ci: ["tehran", "isfahan", "tabriz"] },
  { c: "iraq", n: "Iraq", ci: ["baghdad", "erbil"] },
  { c: "ireland", n: "Ireland", ci: ["dublin", "galway", "cork"] },
  { c: "israel", n: "Israel", ci: ["tel-aviv", "jerusalem", "haifa"] },
  {
    c: "italy",
    n: "Italy",
    ci: ["rome", "milan", "turin", "florence", "naples"],
  },
  { c: "jamaica", n: "Jamaica", ci: ["kingston"] },
  {
    c: "japan",
    n: "Japan",
    ci: ["tokyo", "osaka", "kyoto", "fukuoka", "nagoya"],
  },
  { c: "jordan", n: "Jordan", ci: ["amman"] },
  { c: "kazakhstan", n: "Kazakhstan", ci: ["almaty", "astana"] },
  { c: "kenya", n: "Kenya", ci: ["nairobi", "mombasa"] },
  { c: "kuwait", n: "Kuwait", ci: ["kuwait-city"] },
  { c: "laos", n: "Laos", ci: ["vientiane"] },
  { c: "latvia", n: "Latvia", ci: ["riga"] },
  { c: "lithuania", n: "Lithuania", ci: ["vilnius", "kaunas"] },
  { c: "luxembourg", n: "Luxembourg", ci: ["luxembourg"] },
  { c: "madagascar", n: "Madagascar", ci: ["antananarivo"] },
  { c: "malawi", n: "Malawi", ci: ["lilongwe"] },
  { c: "malaysia", n: "Malaysia", ci: ["kuala-lumpur", "johor-bahru"] },
  { c: "maldives", n: "Maldives", ci: ["male"] },
  { c: "mali", n: "Mali", ci: ["bamako"] },
  { c: "malta", n: "Malta", ci: ["valletta"] },
  { c: "mauritius", n: "Mauritius", ci: ["port-louis"] },
  {
    c: "mexico",
    n: "Mexico",
    ci: ["mexico-city", "guadalajara", "monterrey", "tijuana"],
  },
  { c: "moldova", n: "Moldova", ci: ["chisinau"] },
  { c: "mongolia", n: "Mongolia", ci: ["ulaanbaatar"] },
  { c: "montenegro", n: "Montenegro", ci: ["podgorica"] },
  { c: "morocco", n: "Morocco", ci: ["casablanca", "rabat", "marrakesh"] },
  { c: "mozambique", n: "Mozambique", ci: ["maputo"] },
  { c: "myanmar", n: "Myanmar", ci: ["yangon", "mandalay"] },
  { c: "namibia", n: "Namibia", ci: ["windhoek"] },
  { c: "nepal", n: "Nepal", ci: ["kathmandu", "pokhara"] },
  {
    c: "netherlands",
    n: "Netherlands",
    ci: ["amsterdam", "rotterdam", "utrecht"],
  },
  {
    c: "new-zealand",
    n: "New Zealand",
    ci: ["auckland", "wellington", "christchurch"],
  },
  { c: "nicaragua", n: "Nicaragua", ci: ["managua"] },
  { c: "nigeria", n: "Nigeria", ci: ["lagos", "abuja", "ibadan"] },
  { c: "norway", n: "Norway", ci: ["oslo", "bergen", "trondheim"] },
  { c: "oman", n: "Oman", ci: ["muscat"] },
  { c: "pakistan", n: "Pakistan", ci: ["islamabad", "karachi", "lahore"] },
  { c: "palestine", n: "Palestine", ci: ["gaza", "ramallah"] },
  { c: "panama", n: "Panama", ci: ["panama-city"] },
  { c: "paraguay", n: "Paraguay", ci: ["asuncion"] },
  { c: "peru", n: "Peru", ci: ["lima", "arequipa", "cusco"] },
  { c: "philippines", n: "Philippines", ci: ["manila", "cebu-city", "davao"] },
  { c: "poland", n: "Poland", ci: ["warsaw", "krakow", "wroclaw", "gdansk"] },
  { c: "portugal", n: "Portugal", ci: ["lisbon", "porto"] },
  { c: "qatar", n: "Qatar", ci: ["doha"] },
  { c: "romania", n: "Romania", ci: ["bucharest", "cluj-napoca"] },
  {
    c: "russia",
    n: "Russia",
    ci: ["moscow", "saint-petersburg", "novosibirsk"],
  },
  { c: "rwanda", n: "Rwanda", ci: ["kigali"] },
  { c: "saudi-arabia", n: "Saudi Arabia", ci: ["riyadh", "jeddah"] },
  { c: "senegal", n: "Senegal", ci: ["dakar"] },
  { c: "serbia", n: "Serbia", ci: ["belgrade", "novi-sad"] },
  { c: "singapore", n: "Singapore", ci: ["singapore"] },
  { c: "slovakia", n: "Slovakia", ci: ["bratislava", "kosice"] },
  { c: "slovenia", n: "Slovenia", ci: ["ljubljana", "maribor"] },
  {
    c: "south-africa",
    n: "South Africa",
    ci: ["cape-town", "johannesburg", "pretoria"],
  },
  { c: "south-korea", n: "South Korea", ci: ["seoul", "busan", "incheon"] },
  {
    c: "spain",
    n: "Spain",
    ci: ["madrid", "barcelona", "valencia", "seville"],
  },
  { c: "sri-lanka", n: "Sri Lanka", ci: ["colombo", "kandy"] },
  { c: "sudan", n: "Sudan", ci: ["khartoum"] },
  { c: "sweden", n: "Sweden", ci: ["stockholm", "gothenburg", "malmo"] },
  {
    c: "switzerland",
    n: "Switzerland",
    ci: ["zurich", "geneva", "bern", "basel"],
  },
  { c: "syria", n: "Syria", ci: ["damascus"] },
  { c: "tanzania", n: "Tanzania", ci: ["dar-es-salaam"] },
  { c: "thailand", n: "Thailand", ci: ["bangkok", "chiang-mai"] },
  { c: "tunisia", n: "Tunisia", ci: ["tunis"] },
  { c: "turkey", n: "Turkey", ci: ["istanbul", "ankara", "izmir"] },
  { c: "uganda", n: "Uganda", ci: ["kampala"] },
  { c: "ukraine", n: "Ukraine", ci: ["kyiv", "lviv", "kharkiv", "odesa"] },
  {
    c: "united-arab-emirates",
    n: "United Arab Emirates",
    ci: ["dubai", "abu-dhabi"],
  },
  {
    c: "united-kingdom",
    n: "United Kingdom",
    ci: ["london", "manchester", "edinburgh", "cambridge"],
  },
  {
    c: "united-states",
    n: "United States",
    ci: ["san-francisco", "new-york", "seattle", "austin", "los-angeles"],
  },
  { c: "uruguay", n: "Uruguay", ci: ["montevideo"] },
  { c: "uzbekistan", n: "Uzbekistan", ci: ["tashkent"] },
  { c: "venezuela", n: "Venezuela", ci: ["caracas"] },
  { c: "vietnam", n: "Vietnam", ci: ["ho-chi-minh-city", "hanoi", "da-nang"] },
  { c: "zambia", n: "Zambia", ci: ["lusaka"] },
  { c: "zimbabwe", n: "Zimbabwe", ci: ["harare", "bulawayo"] },
];

// Country code to flag emoji
const FLAG_MAP: Record<string, string> = {
  afghanistan: "🇦🇫",
  albania: "🇦🇱",
  algeria: "🇩🇿",
  andorra: "🇦🇩",
  angola: "🇦🇴",
  argentina: "🇦🇷",
  armenia: "🇦🇲",
  australia: "🇦🇺",
  austria: "🇦🇹",
  azerbaijan: "🇦🇿",
  bahrain: "🇧🇭",
  bangladesh: "🇧🇩",
  belarus: "🇧🇾",
  belgium: "🇧🇪",
  benin: "🇧🇯",
  bhutan: "🇧🇹",
  bolivia: "🇧🇴",
  "bosnia-and-herzegovina": "🇧🇦",
  botswana: "🇧🇼",
  brazil: "🇧🇷",
  bulgaria: "🇧🇬",
  "burkina-faso": "🇧🇫",
  burundi: "🇧🇮",
  cambodia: "🇰🇭",
  cameroon: "🇨🇲",
  canada: "🇨🇦",
  chad: "🇹🇩",
  chile: "🇨🇱",
  china: "🇨🇳",
  "hong-kong": "🇭🇰",
  taiwan: "🇹🇼",
  colombia: "🇨🇴",
  congo: "🇨🇬",
  croatia: "🇭🇷",
  cuba: "🇨🇺",
  cyprus: "🇨🇾",
  czechia: "🇨🇿",
  denmark: "🇩🇰",
  "dominican-republic": "🇩🇴",
  ecuador: "🇪🇨",
  egypt: "🇪🇬",
  "el-salvador": "🇸🇻",
  estonia: "🇪🇪",
  ethiopia: "🇪🇹",
  finland: "🇫🇮",
  france: "🇫🇷",
  georgia: "🇬🇪",
  germany: "🇩🇪",
  ghana: "🇬🇭",
  greece: "🇬🇷",
  guatemala: "🇬🇹",
  honduras: "🇭🇳",
  hungary: "🇭🇺",
  iceland: "🇮🇸",
  india: "🇮🇳",
  indonesia: "🇮🇩",
  iran: "🇮🇷",
  iraq: "🇮🇶",
  ireland: "🇮🇪",
  israel: "🇮🇱",
  italy: "🇮🇹",
  jamaica: "🇯🇲",
  japan: "🇯🇵",
  jordan: "🇯🇴",
  kazakhstan: "🇰🇿",
  kenya: "🇰🇪",
  kuwait: "🇰🇼",
  laos: "🇱🇦",
  latvia: "🇱🇻",
  lithuania: "🇱🇹",
  luxembourg: "🇱🇺",
  madagascar: "🇲🇬",
  malawi: "🇲🇼",
  malaysia: "🇲🇾",
  maldives: "🇲🇻",
  mali: "🇲🇱",
  malta: "🇲🇹",
  mauritius: "🇲🇺",
  mexico: "🇲🇽",
  moldova: "🇲🇩",
  mongolia: "🇲🇳",
  montenegro: "🇲🇪",
  morocco: "🇲🇦",
  mozambique: "🇲🇿",
  myanmar: "🇲🇲",
  namibia: "🇳🇦",
  nepal: "🇳🇵",
  netherlands: "🇳🇱",
  "new-zealand": "🇳🇿",
  nicaragua: "🇳🇮",
  nigeria: "🇳🇬",
  norway: "🇳🇴",
  oman: "🇴🇲",
  pakistan: "🇵🇰",
  palestine: "🇵🇸",
  panama: "🇵🇦",
  paraguay: "🇵🇾",
  peru: "🇵🇪",
  philippines: "🇵🇭",
  poland: "🇵🇱",
  portugal: "🇵🇹",
  qatar: "🇶🇦",
  romania: "🇷🇴",
  russia: "🇷🇺",
  rwanda: "🇷🇼",
  "saudi-arabia": "🇸🇦",
  senegal: "🇸🇳",
  serbia: "🇷🇸",
  singapore: "🇸🇬",
  slovakia: "🇸🇰",
  slovenia: "🇸🇮",
  "south-africa": "🇿🇦",
  "south-korea": "🇰🇷",
  spain: "🇪🇸",
  "sri-lanka": "🇱🇰",
  sudan: "🇸🇩",
  sweden: "🇸🇪",
  switzerland: "🇨🇭",
  syria: "🇸🇾",
  tanzania: "🇹🇿",
  thailand: "🇹🇭",
  tunisia: "🇹🇳",
  turkey: "🇹🇷",
  uganda: "🇺🇬",
  ukraine: "🇺🇦",
  "united-arab-emirates": "🇦🇪",
  "united-kingdom": "🇬🇧",
  "united-states": "🇺🇸",
  uruguay: "🇺🇾",
  uzbekistan: "🇺🇿",
  venezuela: "🇻🇪",
  vietnam: "🇻🇳",
  zambia: "🇿🇲",
  zimbabwe: "🇿🇼",
};

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
const COS = [
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

function rand(a: number, b: number) {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}
function pick<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
}

let total = 0;
for (let idx = 0; idx < RAW_COUNTRIES.length; idx++) {
  const { c: code, n: name, ci: cities } = RAW_COUNTRIES[idx];
  const flag = FLAG_MAP[code] || "🏳️";
  const locs = [
    name,
    ...cities.map(
      (c) => c.charAt(0).toUpperCase() + c.slice(1).replace(/-/g, " "),
    ),
  ];

  // Config
  fs.mkdirSync("config/countries", { recursive: true });
  fs.writeFileSync(
    `config/countries/${code}.json`,
    JSON.stringify({ code, name, flag, locations: locs }, null, 2),
  );

  // Users
  const users = [];
  for (let i = 0; i < 1000; i++) {
    const decay = Math.exp(-i * 0.04);
    const login = `${code.slice(0, 3)}-dev-${i + 1}`;
    const pub = Math.round(35000 * decay + rand(50, 200));
    const priv = rand(0, 500);
    const fol = Math.round(5000 * decay + rand(10, 50));
    const langs = pick(LANGS, rand(1, 4));
    const DESCS = [
      "A modern CLI tool",
      "Web framework for developers",
      "Data pipeline library",
      "Open source utilities",
      "API wrapper",
      null,
    ];
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
      company: COS[rand(0, COS.length - 1)],
      location: locs[rand(0, locs.length - 1)],
      bio: i < 30 ? `Developer from ${name}` : null,
      followers: fol,
      publicContributions: pub,
      privateContributions: priv,
      languages: langs,
      topRepos: repos,
      twitterUsername: i < 15 ? login : null,
      blog: i < 10 ? `https://${login}.dev` : null,
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

  fs.mkdirSync("data", { recursive: true });
  fs.writeFileSync(
    `data/${code}.json`,
    JSON.stringify(
      {
        countryCode: code,
        updatedAt: "2026-03-28T00:00:00.000Z",
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

  // Profile JSONs with contribution calendar (top 100)
  const profileDir = `data/${code}/profiles`;
  fs.mkdirSync(profileDir, { recursive: true });
  for (const user of byPub.slice(0, 100)) {
    const weeks = Array.from({ length: 52 }, (_, w) => ({
      contributionDays: Array.from({ length: 7 }, (_, d) => ({
        date: new Date(2025, 0, 6 + w * 7 + d).toISOString().slice(0, 10),
        count: Math.floor(
          Math.random() * Math.max(1, user.publicContributions / 365) * 2,
        ),
      })),
    }));
    fs.writeFileSync(
      `${profileDir}/${user.login}.json`,
      JSON.stringify({ login: user.login, calendar: { weeks } }, null, 2),
    );
  }

  total++;
  if (total % 20 === 0) console.log(`  ${total} countries...`);
}

console.log(`Done! Generated ${total} countries.`);
