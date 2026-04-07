<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { createHttpClient } from "../lib/http";
  import { buildUrl } from "../lib/url";
  import { navigate } from "../lib/router";
  import { t } from "../i18n";
  import { isConfiguredCountry, getCountrySlug, getIsoCode } from "../lib/globe/country-mapping";
  import CountrySearch from "./CountrySearch.svelte";
  import CountryList from "./CountryList.svelte";
  import Link from "./Link.svelte";
  import { trackEvent } from "../lib/analytics";
  import { buildCountryUrl, buildLocalePrefix } from "../lib/locale-url";
  import { CountryInfoSchema, type CountryInfo } from "../lib/data-output";
  import { CountrySummarySchema, type CountrySummary } from "../lib/country-list";
  import { z } from "zod";
  import { toastZodError } from "../lib/toast";

  let { basePath = "/", locale = "en" }: { basePath?: string; locale?: string } = $props();

  let countries = $state<CountryInfo[]>([]);
  let countrySummaries = $state<CountrySummary[]>([]);
  let loading = $state(true);

  // Globe
  let globeContainer: HTMLDivElement;
  let globeInstance: any = null;
  let resizeHandler: (() => void) | null = null;

  onMount(async () => {
    try {
      const http = createHttpClient(basePath);
      const [rawCountries, rawSummary] = await Promise.all([
        http.get("data/countries.json").json(),
        http.get("data/countries-summary.json").json(),
      ]);
      countries = z.array(CountryInfoSchema).parse(rawCountries);
      countrySummaries = z.array(CountrySummarySchema).parse(rawSummary);
    } catch (e) {
      console.error("Failed to load homepage data:", e);
      toastZodError(e);
    }
    loading = false;

    initGlobe().catch((e) => console.warn("Globe initialization failed:", e));
  });

  onDestroy(() => {
    if (resizeHandler) window.removeEventListener("resize", resizeHandler);
    if (globeInstance) {
      globeInstance.pauseAnimation();
      globeInstance._destructor?.();
    }
  });

  const GLOBE_ASSETS = {
    image: "//cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg",
    bump: "//cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png",
    water: "//cdn.jsdelivr.net/npm/three-globe/example/img/earth-water.png",
  };

  function getPolygonColor(iso: string, configuredCodes: Set<string>) {
    const s = getCountrySlug(iso);
    return s && configuredCodes.has(s) ? "rgba(99,102,241,0.35)" : "rgba(63,63,70,0.3)";
  }

  function setupGlobeMaterial(w: any, THREE: any) {
    const mat = w.globeMaterial() as any;
    if (!mat) return;
    mat.bumpScale = 10;
    new THREE.TextureLoader().load(GLOBE_ASSETS.water, (texture: any) => {
      mat.specularMap = texture;
      mat.specular = new THREE.Color("grey");
      mat.shininess = 15;
    });
  }

  function setupGlobeControls(w: any) {
    const dirLight = w.lights().find((l: any) => l.type === "DirectionalLight") as any;
    if (dirLight) dirLight.position.set(1, 1, 1);
    const c = w.controls() as any;
    c.autoRotate = true;
    c.autoRotateSpeed = 0.8;
    c.enableZoom = false;
    c.minDistance = 220;
    c.maxDistance = 350;
  }

  function setupResizeHandler(w: any, el: HTMLDivElement) {
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
  }

  function setupPolygons(w: any, el: HTMLDivElement, geojson: any, configuredCodes: Set<string>) {
    w.polygonsData(geojson.features.filter((f: any) => getIsoCode(f.properties) !== "AQ"))
      .polygonAltitude((d: any) => isConfiguredCountry(getIsoCode(d.properties)) ? 0.006 : 0.001)
      .polygonCapColor((d: any) => getPolygonColor(getIsoCode(d.properties), configuredCodes))
      .polygonSideColor(() => "rgba(99,102,241,0.01)")
      .polygonStrokeColor(() => "rgba(99,102,241,0.04)")
      .polygonLabel((d: any) => {
        if (!isConfiguredCountry(getIsoCode(d.properties))) return "";
        return `<div style="background:rgba(9,9,11,.96);color:#fafafa;padding:10px 14px;border-radius:8px;font:14px Inter;border:1px solid rgba(63,63,70,.6)"><strong>${d.properties.NAME}</strong><br><span style="color:#a1a1aa;font-size:12px">${t("globe.clickToExplore", locale)}</span></div>`;
      })
      .onPolygonClick((d: any) => {
        const s = getCountrySlug(getIsoCode(d.properties));
        if (s) {
          trackEvent("globe_country_click", { country: d.properties.NAME, code: s });
          navigate(buildCountryUrl(s, locale, basePath));
        }
      })
      .onPolygonHover((d: any) => {
        el.style.cursor = d && isConfiguredCountry(getIsoCode(d.properties)) ? "pointer" : "default";
        w.polygonAltitude((f: any) => f === d && isConfiguredCountry(getIsoCode(f.properties)) ? 0.03 : isConfiguredCountry(getIsoCode(f.properties)) ? 0.006 : 0.001)
         .polygonCapColor((f: any) => f === d && isConfiguredCountry(getIsoCode(f.properties)) ? "rgba(129,140,248,0.85)" : getPolygonColor(getIsoCode(f.properties), configuredCodes));
      });
    el.style.opacity = "1";
  }

  async function initGlobe() {
    if (!globeContainer) return;
    const el = globeContainer;
    const configuredCodes = new Set(countries.map(c => c.code));

    const { default: Globe } = await import("globe.gl");
    const THREE = await import("three");

    const w = new Globe(el, { rendererConfig: { antialias: true, alpha: true }, animateIn: true })
      .backgroundColor("rgba(0,0,0,0)")
      .showAtmosphere(true).atmosphereColor("cyan").atmosphereAltitude(0.15)
      .globeImageUrl(GLOBE_ASSETS.image)
      .bumpImageUrl(GLOBE_ASSETS.bump);
    globeInstance = w;

    setupGlobeMaterial(w, THREE);
    setupGlobeControls(w);
    setupResizeHandler(w, el);

    const http = createHttpClient(basePath);
    const geojson = await http.get("data/countries.geojson").json();
    setupPolygons(w, el, geojson, configuredCodes);

    new IntersectionObserver(([e]) => { e.isIntersecting ? w.resumeAnimation() : w.pauseAnimation(); }, { threshold: 0.1 }).observe(el);
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
    <CountryList countries={countrySummaries} {basePath} {locale} />

    <footer class="py-12 border-t border-border">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-text-muted">
        <div class="flex items-center gap-2">
          <span class="font-display font-bold text-text">CodeAtlas</span>
          <span>·</span>
          <span>{t("footer.text", locale)}</span>
        </div>
        <div class="flex items-center gap-4">
          <Link href={buildUrl(buildLocalePrefix(locale) + "faq", basePath)} class="hover:text-accent transition-colors">{t("nav.faq", locale)}</Link>
          <a href="https://github.com/recca0120/codeatlas" target="_blank" rel="noopener" class="hover:text-accent transition-colors">GitHub</a>
        </div>
      </div>
    </footer>
  </div>
{/if}
