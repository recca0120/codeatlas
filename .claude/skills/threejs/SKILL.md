---
name: threejs
description: Three.js 3D 視覺化最佳實踐指南（r183+）。當需要建立 3D 場景、設定 renderer/camera/lights、使用 OrbitControls、做 raycasting 互動、效能優化、或整合 Astro 時使用。
---

# Three.js Best Practices Guide (r183+)

## 版本資訊

- 最新穩定版：**r183**（2025-02-20）
- 月更新節奏，npm 週下載量 ~270 萬
- WebGPU 自 r171 起 production-ready，透過 `three/webgpu` 匯入自動 fallback WebGL2

## Import 策略

```typescript
// 核心（tree-shakeable）
import { Scene, PerspectiveCamera, WebGLRenderer } from 'three';

// WebGPU（含 WebGL2 自動 fallback）
import * as THREE from 'three/webgpu';

// Addons（controls、loaders 等）
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Timer } from 'three/addons/misc/Timer.js';
```

**注意**：盡量 import 個別 class 而非 `import * as THREE`，減少 bundle size。

## Scene 基本設定

```typescript
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,                                      // FOV
  container.clientWidth / container.clientHeight, // aspect
  0.1,                                     // near
  1000                                     // far
);
camera.position.set(0, 1.5, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // 上限 2
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
container.appendChild(renderer.domElement);
```

## Animation：使用 Timer（Clock 已棄用）

```typescript
import { Timer } from 'three/addons/misc/Timer.js';

const timer = new Timer();
timer.connect(document); // 自動處理 Page Visibility

function animate(timestamp: number) {
  requestAnimationFrame(animate);
  timer.update(timestamp);
  const delta = timer.getDelta();

  mesh.rotation.y += 1.0 * delta; // frame-rate independent
  controls.update(); // enableDamping 時必須
  renderer.render(scene, camera);
}
requestAnimationFrame(animate);
```

**為何用 Timer 而非 Clock**：
- `getDelta()` 同一 frame 多次呼叫回傳一致值（Clock 不會）
- 自動處理 Page Visibility（切 tab 回來不會有巨大 delta）
- 支援 `setTimescale()` 做慢動作/快轉

## OrbitControls

```typescript
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 2;
controls.maxDistance = 20;
controls.maxPolarAngle = Math.PI / 2; // 防止穿過地面
controls.target.set(0, 1, 0);
controls.update();
```

清除：`controls.dispose()` 會移除所有 event listeners。

## Raycasting（Hover / Click 互動）

```typescript
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let hoveredObject: THREE.Object3D | null = null;

function onPointerMove(event: PointerEvent) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function checkHover() {
  raycaster.setFromCamera(pointer, camera);
  // 只對互動物件做 raycast，不要整個 scene
  const intersects = raycaster.intersectObjects(interactiveObjects);

  if (intersects.length > 0) {
    const obj = intersects[0].object;
    if (hoveredObject !== obj) {
      // reset previous
      if (hoveredObject) (hoveredObject as THREE.Mesh).material.emissive?.setHex(0x000000);
      hoveredObject = obj;
      (obj as THREE.Mesh).material.emissive?.setHex(0x333333);
      renderer.domElement.style.cursor = 'pointer';
    }
  } else if (hoveredObject) {
    (hoveredObject as THREE.Mesh).material.emissive?.setHex(0x000000);
    hoveredObject = null;
    renderer.domElement.style.cursor = 'default';
  }
}

renderer.domElement.addEventListener('pointermove', onPointerMove);
```

**注意**：搭配 OrbitControls 時，區分 click vs drag — 比較 `pointerdown`/`pointerup` 的距離（閾值 ~3px）。

## Responsive Design

```typescript
const resizeObserver = new ResizeObserver(entries => {
  const { width, height } = entries[0].contentRect;
  camera.aspect = width / height;
  camera.updateProjectionMatrix(); // 必須！
  renderer.setSize(width, height, false);
});
resizeObserver.observe(container);
```

島嶼式元件用 `ResizeObserver`（非 `window.resize`）。

## Memory Management / Disposal

```typescript
function dispose(object: THREE.Object3D) {
  object.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      mesh.geometry.dispose();
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach(mat => {
        Object.values(mat).forEach(val => {
          if (val && typeof val === 'object' && 'dispose' in val) (val as any).dispose();
        });
        mat.dispose();
      });
    }
  });
}

// 也要 dispose：
renderer.dispose();
controls.dispose();
```

**規則**：JS GC 不會釋放 GPU 資源，必須手動 `.dispose()`。

## 效能優化

| 策略 | 說明 |
|------|------|
| Draw calls < 100 | 用 `InstancedMesh`（重複 geometry）或 `BatchedMesh`（不同 geometry） |
| Pixel ratio 上限 | Desktop: 2, Mobile: 1.5 |
| 關閉不需要的功能 | `{ stencil: false, depth: false, alpha: false }` |
| Tab 隱藏暫停渲染 | Timer 自動處理，或用 Page Visibility API |
| 使用 LOD | `THREE.LOD` 依距離切換細節 |
| 壓縮模型 | Draco 壓縮 geometry（減 90-95%）、KTX2 壓縮 texture（減 ~10x 記憶體） |
| 偏好 env map | 環境貼圖比動態光源效能好 |

檢查效能：`renderer.info.render.calls`、`stats-gl`

## WebGL 偵測與 Fallback

```typescript
import WebGL from 'three/addons/capabilities/WebGL.js';

if (WebGL.isWebGL2Available()) {
  initScene();
} else {
  const warning = WebGL.getWebGL2ErrorMessage();
  container.appendChild(warning);
}
```

WebGPURenderer 自帶 WebGL2 fallback，不需要額外偵測。

## Astro 整合

```astro
---
// src/components/ThreeScene.astro
---
<div id="three-canvas" class="w-full h-screen"></div>

<script>
  import { initScene } from '../lib/three/scene';

  const container = document.getElementById('three-canvas')!;
  const cleanup = initScene(container);

  // Astro View Transitions cleanup
  document.addEventListener('astro:before-swap', cleanup);
</script>
```

```typescript
// src/lib/three/scene.ts
export function initScene(container: HTMLElement): () => void {
  // ... setup scene, camera, renderer, controls ...

  let animationId: number;
  function animate() {
    animationId = requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();

  return () => {
    cancelAnimationFrame(animationId);
    renderer.dispose();
    controls.dispose();
    // dispose all geometries, materials, textures
  };
}
```

**要點**：
- 用 vanilla TS + `<script>` tag（Astro 處理為 module）
- Hook `astro:before-swap` 做 cleanup
- 用 `ResizeObserver` 而非 `window.resize`

## Mobile / Touch

- OrbitControls 原生支援觸控（一指旋轉、二指縮放/平移）
- 用 `pointer` events（統一 mouse + touch）
- CSS：canvas 加 `touch-action: none` 防止瀏覽器手勢
- DPR 上限 1.5
- 考慮降低 geometry/texture 品質

## 常見陷阱

1. 未 dispose GPU 資源 → 記憶體洩漏
2. 用 Clock 而非 Timer → 同 frame 多次 `getDelta()` 返回 ~0
3. 未 cap pixel ratio → Retina 裝置 4x 像素
4. 改 camera 屬性後忘記 `updateProjectionMatrix()`
5. Raycast 整個 scene → 只傳互動物件陣列
6. 未加 `touch-action: none` → 手機滑動卡頓
7. OrbitControls click/drag 混淆 → 追蹤 pointer 移動距離
