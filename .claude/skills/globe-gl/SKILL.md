---
name: globe-gl
description: Globe.GL 3D 地球視覺化指南。當需要建立互動式 3D 地球、國家熱力圖、點擊導航、或整合 Astro 時使用。
---

# Globe.GL Guide

## 安裝

```bash
npm install globe.gl
```

TypeScript types 已內建，不需額外安裝。

## Astro 整合

在 Astro component 的 `<script>` 中直接使用（client-side module）：

```astro
<div id="globe-container" class="w-full h-[600px]"></div>
<script>
  import Globe from "globe.gl";
  // ...
</script>
```

## 基本設定（Dark Theme）

```typescript
import Globe from "globe.gl";
import * as THREE from "three";

const container = document.getElementById("globe-container")!;
const world = new Globe(container, {
  rendererConfig: { antialias: true, alpha: true },
  animateIn: true,
})
  .backgroundColor("rgba(0,0,0,0)")
  .showAtmosphere(true)
  .atmosphereColor("#3a228a")
  .atmosphereAltitude(0.25)
  .globeImageUrl("//cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg")
  .bumpImageUrl("//cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png");

// Dark material
const mat = world.globeMaterial() as THREE.MeshPhongMaterial;
mat.color = new THREE.Color("#1a1a2e");
mat.emissive = new THREE.Color("#090920");
mat.emissiveIntensity = 0.1;
mat.shininess = 5;
```

## 國家熱力圖 + Click 導航

```typescript
// GeoJSON 來源（110m 解析度，較小）
const res = await fetch("/data/countries.geojson");
const countries = await res.json();

world
  .polygonsData(countries.features.filter(f => f.properties.ISO_A2 !== "AQ"))
  .polygonAltitude(0.01)
  .polygonCapColor(d => getCountryColor(d))
  .polygonSideColor(() => "rgba(100, 100, 200, 0.15)")
  .polygonStrokeColor(() => "#44ffaa33")
  .polygonLabel(d => `<div>...</div>`)
  .onPolygonClick((polygon) => {
    const code = polygon.properties.ISO_A2.toLowerCase();
    window.location.href = `/${countryCodeMap[code]}/`;
  })
  .onPolygonHover((hoverD) => {
    container.style.cursor = hoverD ? "pointer" : "default";
    world.polygonAltitude(d => d === hoverD ? 0.04 : 0.01);
  });
```

## Auto-Rotate + Fly-To

```typescript
const controls = world.controls();
controls.autoRotate = true;
controls.autoRotateSpeed = 0.4;
controls.minDistance = 120;
controls.maxDistance = 500;

// 停止旋轉 on interaction，idle 5s 後恢復
container.addEventListener("mousedown", () => controls.autoRotate = false);
container.addEventListener("mouseup", () => {
  setTimeout(() => controls.autoRotate = true, 5000);
});

// Fly to country
world.pointOfView({ lat: 25.0, lng: 121.5, altitude: 1.5 }, 1000);
```

## Responsive + Off-screen Pause

```typescript
function handleResize() {
  world.width(container.clientWidth).height(container.clientHeight);
}
window.addEventListener("resize", handleResize);
handleResize();

// Pause when off-screen
const observer = new IntersectionObserver(([entry]) => {
  entry.isIntersecting ? world.resumeAnimation() : world.pauseAnimation();
}, { threshold: 0.1 });
observer.observe(container);
```

## 效能建議

1. 用 `ne_110m`（110m 解析度）而非 50m/10m
2. `pointsMerge(true)` — 大量 points 時合併 draw call
3. `IntersectionObserver` — off-screen 暫停
4. 過濾 Antarctica 和小島國
5. Dynamic import 懶載入 globe.gl（~200KB）

## CDN 貼圖

```
earth-night.jpg    — 夜間地球（適合 dark theme）
earth-dark.jpg     — 純深色
earth-topology.png — 地形凹凸
earth-water.png    — 海洋 specular
```

## 常見 API

| 用途 | API |
|------|-----|
| 國家上色 | `polygonCapColor(feat => color)` |
| 國家 click | `onPolygonClick(feat => ...)` |
| Hover 浮起 | `onPolygonHover` + `polygonAltitude` |
| 開發者 points | `pointsData([...]).pointAltitude(d => ...)` |
| Atmosphere | `atmosphereColor("#3a228a")` |
| Auto-rotate | `controls().autoRotate = true` |
| Fly-to | `pointOfView({ lat, lng, altitude }, ms)` |
| Responsive | `world.width(w).height(h)` |
