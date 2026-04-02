<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { createHttpClient } from "../lib/http";
  import { buildUrl } from "../lib/url";
  import { navigate } from "../lib/router";
  import { t } from "../i18n";
  import { isConfiguredCountry, getCountrySlug, getIsoCode } from "../lib/globe/country-mapping";
  import CountrySearch from "./CountrySearch.svelte";
  import Link from "./Link.svelte";

  let { basePath = "/", locale = "en" }: { basePath?: string; locale?: string } = $props();

  const CONT: Record<string, string> = {afghanistan:"Asia",albania:"Europe",algeria:"Africa",andorra:"Europe",angola:"Africa",argentina:"Americas",armenia:"Asia",australia:"Oceania",austria:"Europe",azerbaijan:"Asia",bahrain:"Asia",bangladesh:"Asia",belarus:"Europe",belgium:"Europe",benin:"Africa",bhutan:"Asia",bolivia:"Americas","bosnia-and-herzegovina":"Europe",botswana:"Africa",brazil:"Americas",bulgaria:"Europe","burkina-faso":"Africa",burundi:"Africa",cambodia:"Asia",cameroon:"Africa",canada:"Americas",chad:"Africa",chile:"Americas",china:"Asia","hong-kong":"Asia",taiwan:"Asia",colombia:"Americas",congo:"Africa",croatia:"Europe",cuba:"Americas",cyprus:"Europe",czechia:"Europe",denmark:"Europe","dominican-republic":"Americas",ecuador:"Americas",egypt:"Africa","el-salvador":"Americas",estonia:"Europe",ethiopia:"Africa",finland:"Europe",france:"Europe",georgia:"Asia",germany:"Europe",ghana:"Africa",greece:"Europe",guatemala:"Americas",honduras:"Americas",hungary:"Europe",iceland:"Europe",india:"Asia",indonesia:"Asia",iran:"Asia",iraq:"Asia",ireland:"Europe",israel:"Asia",italy:"Europe",jamaica:"Americas",japan:"Asia",jordan:"Asia",kazakhstan:"Asia",kenya:"Africa",kuwait:"Asia",laos:"Asia",latvia:"Europe",lithuania:"Europe",luxembourg:"Europe",madagascar:"Africa",malawi:"Africa",malaysia:"Asia",maldives:"Asia",mali:"Africa",malta:"Europe",mauritius:"Africa",mexico:"Americas",moldova:"Europe",mongolia:"Asia",montenegro:"Europe",morocco:"Africa",mozambique:"Africa",myanmar:"Asia",namibia:"Africa",nepal:"Asia",netherlands:"Europe","new-zealand":"Oceania",nicaragua:"Americas",nigeria:"Africa",norway:"Europe",oman:"Asia",pakistan:"Asia",palestine:"Asia",panama:"Americas",paraguay:"Americas",peru:"Americas",philippines:"Asia",poland:"Europe",portugal:"Europe",qatar:"Asia",romania:"Europe",russia:"Europe",rwanda:"Africa","saudi-arabia":"Asia",senegal:"Africa",serbia:"Europe",singapore:"Asia",slovakia:"Europe",slovenia:"Europe","south-africa":"Africa","south-korea":"Asia",spain:"Europe","sri-lanka":"Asia",sudan:"Africa",sweden:"Europe",switzerland:"Europe",syria:"Asia",tanzania:"Africa",thailand:"Asia",tunisia:"Africa",turkey:"Europe",uganda:"Africa",ukraine:"Europe","united-arab-emirates":"Asia","united-kingdom":"Europe","united-states":"Americas",uruguay:"Americas",uzbekistan:"Asia",venezuela:"Americas",vietnam:"Asia",zambia:"Africa",zimbabwe:"Africa"};
  const CONT_KEYS: Record<string, string> = { Asia: "continent.asia", Europe: "continent.europe", Americas: "continent.americas", Africa: "continent.africa", Oceania: "continent.oceania" };

  interface CItem { code: string; name: string; flag: string; continent: string; }

  let countries = $state<CItem[]>([]);
  let byContinent = $state<Record<string, CItem[]>>({});
  let loading = $state(true);

  // Globe
  let globeContainer: HTMLDivElement;
  let globeInstance: any = null;
  let resizeHandler: (() => void) | null = null;

  onMount(async () => {
    const http = createHttpClient(basePath);
    const raw = await http.get("data/countries.json").json<any[]>();
    countries = raw.map((c: any) => ({ code: c.code, name: c.name, flag: c.flag, continent: CONT[c.code] || "Other" }));
    const grouped: Record<string, CItem[]> = {};
    for (const c of countries) { (grouped[c.continent] ??= []).push(c); }
    byContinent = grouped;
    loading = false;

    initGlobe();
  });

  onDestroy(() => {
    if (resizeHandler) window.removeEventListener("resize", resizeHandler);
    if (globeInstance) {
      globeInstance.pauseAnimation();
      globeInstance._destructor?.();
    }
  });

  function initGlobe() {
    if (!globeContainer) return;
    const el = globeContainer;
    const configuredCodes = new Set(countries.map(c => c.code));

    function hc(iso: string) {
      const s = getCountrySlug(iso);
      if (!s || !configuredCodes.has(s)) return "rgba(63,63,70,0.3)";
      return "rgba(99,102,241,0.35)";
    }

    import("globe.gl").then(({ default: Globe }) => {
      import("three").then((THREE) => {
        const w = new Globe(el, { rendererConfig: { antialias: true, alpha: true }, animateIn: true })
          .backgroundColor("rgba(0,0,0,0)")
          .showAtmosphere(true).atmosphereColor("cyan").atmosphereAltitude(0.15)
          .globeImageUrl("//cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg")
          .bumpImageUrl("//cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png");
        globeInstance = w;

        const mat = w.globeMaterial() as any;
        if (mat) {
          mat.bumpScale = 10;
          new THREE.TextureLoader().load("//cdn.jsdelivr.net/npm/three-globe/example/img/earth-water.png", (texture: any) => {
            mat.specularMap = texture; mat.specular = new THREE.Color("grey"); mat.shininess = 15;
          });
        }
        const dirLight = w.lights().find((l: any) => l.type === "DirectionalLight") as any;
        if (dirLight) dirLight.position.set(1, 1, 1);
        const c = w.controls() as any;
        c.autoRotate = true; c.autoRotateSpeed = 0.8; c.enableZoom = false;
        c.minDistance = 220; c.maxDistance = 350;

        resizeHandler = () => {
          const cw = el.clientWidth;
          const ch = el.clientHeight;
          const isLg = window.matchMedia("(min-width: 1024px)").matches;
          if (isLg && ch > cw) {
            const size = Math.min(cw, ch);
            w.width(size).height(size);
            el.style.display = "flex";
            el.style.alignItems = "center";
            el.style.justifyContent = "center";
          } else {
            w.width(cw).height(ch);
            el.style.display = "";
            el.style.alignItems = "";
            el.style.justifyContent = "";
          }
        };
        window.addEventListener("resize", resizeHandler);
        resizeHandler();

        const http = createHttpClient(basePath);
        http.get("data/countries.geojson").json().then((g: any) => {
          w.polygonsData(g.features.filter((f: any) => getIsoCode(f.properties) !== "AQ"))
            .polygonAltitude((d: any) => isConfiguredCountry(getIsoCode(d.properties)) ? 0.006 : 0.001)
            .polygonCapColor((d: any) => hc(getIsoCode(d.properties)))
            .polygonSideColor(() => "rgba(99,102,241,0.01)")
            .polygonStrokeColor(() => "rgba(99,102,241,0.04)")
            .polygonLabel((d: any) => {
              if (!isConfiguredCountry(getIsoCode(d.properties))) return "";
              return `<div style="background:rgba(9,9,11,.96);color:#fafafa;padding:10px 14px;border-radius:8px;font:14px Inter;border:1px solid rgba(63,63,70,.6)"><strong>${d.properties.NAME}</strong><br><span style="color:#a1a1aa;font-size:12px">${t("globe.clickToExplore", locale)}</span></div>`;
            })
            .onPolygonClick((d: any) => {
              const s = getCountrySlug(getIsoCode(d.properties));
              if (s) {
                const localePrefix = locale !== "en" ? locale + "/" : "";
                navigate(buildUrl(`${localePrefix}${s}/`, basePath));
              }
            })
            .onPolygonHover((d: any) => {
              el.style.cursor = d && isConfiguredCountry(getIsoCode(d.properties)) ? "pointer" : "default";
              w.polygonAltitude((f: any) => f === d && isConfiguredCountry(getIsoCode(f.properties)) ? 0.03 : isConfiguredCountry(getIsoCode(f.properties)) ? 0.006 : 0.001)
               .polygonCapColor((f: any) => f === d && isConfiguredCountry(getIsoCode(f.properties)) ? "rgba(129,140,248,0.85)" : hc(getIsoCode(f.properties)));
            });
          el.style.opacity = "1";
        });

        new IntersectionObserver(([e]) => { e.isIntersecting ? w.resumeAnimation() : w.pauseAnimation(); }, { threshold: 0.1 }).observe(el);
      });
    });
  }
</script>

<div class="w-full dark:bg-[url('//cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png')] dark:bg-cover dark:bg-center">
  <div class="max-w-6xl mx-auto px-6 sm:px-8">
    <section class="relative min-h-[calc(100vh-56px)] flex items-center justify-center lg:justify-start py-16">
      <div bind:this={globeContainer} class="globe-container absolute inset-0 opacity-0 transition-opacity duration-[2s] lg:left-[35%] lg:right-0"></div>

      <div class="relative z-10 max-w-lg text-center lg:text-left">
        <div class="rounded-2xl bg-bg/80 backdrop-blur-sm p-6 sm:p-8 lg:bg-transparent lg:backdrop-blur-none lg:p-0">
          <h1 class="text-4xl sm:text-5xl font-display font-bold leading-tight tracking-tight">
            {t("hero.title", locale)}
          </h1>
          <p class="text-text-secondary mt-5 text-lg leading-relaxed mx-auto lg:mx-0">
            {@html t("hero.description", locale).replace("{count}", `<span class="text-text font-semibold">${countries.length}</span>`)}
          </p>
          {#if !loading}
            <div class="mt-8 max-w-sm mx-auto lg:mx-0">
              <CountrySearch countries={countries.map(c => ({ code: c.code, name: c.name, flag: c.flag }))} {basePath} {locale} />
            </div>
          {/if}
        </div>
      </div>
    </section>
  </div>
</div>

{#if !loading}
  <div class="max-w-6xl mx-auto px-6 sm:px-8">
    <section class="py-16 border-t border-border">
      <h2 class="text-xl font-display font-bold mb-10">{t("hero.countries", locale).replace("{count}", String(countries.length))}</h2>

      {#each ["Asia", "Europe", "Americas", "Africa", "Oceania"].filter(c => byContinent[c]) as cont}
        <div class="mb-10">
          <div class="text-xs font-data text-text-muted tracking-widest uppercase mb-3 pb-2 border-b border-border">
            {t(CONT_KEYS[cont], locale)} <span class="text-text-muted/60">· {byContinent[cont].length}</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {#each byContinent[cont] as c}
              <Link href={buildUrl(`${locale === "zh-TW" ? "zh-TW/" : ""}${c.code}/`, basePath)}
                class="flex items-center gap-3 px-4 py-3 rounded-xl border border-border hover:border-accent/40 hover:bg-surface-hover transition-all group">
                <span class="text-2xl shrink-0">{c.flag}</span>
                <span class="truncate group-hover:text-accent transition-colors">{c.name}</span>
              </Link>
            {/each}
          </div>
        </div>
      {/each}
    </section>

    <footer class="py-8 border-t border-border text-center text-sm text-text-muted">
      {t("footer.text", locale)}<Link href={buildUrl(locale === "zh-TW" ? "zh-TW/faq" : "faq", basePath)} class="hover:text-accent transition-colors">{t("nav.faq", locale)}</Link>
    </footer>
  </div>
{/if}
