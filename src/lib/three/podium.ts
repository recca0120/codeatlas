import * as THREE from "three";
import type { GitHubUser } from "../github-client";

export interface PodiumConfig {
  first: GitHubUser;
  second: GitHubUser;
  third: GitHubUser;
}

const PODIUM_HEIGHTS = [8, 6, 5]; // #1, #2, #3
const PODIUM_WIDTH = 3;
const PODIUM_DEPTH = 2;
const PODIUM_GAP = 0.5;

const MATERIALS = {
  gold: new THREE.MeshStandardMaterial({
    color: 0xffd700,
    metalness: 0.8,
    roughness: 0.2,
    emissive: 0xffd700,
    emissiveIntensity: 0.1,
  }),
  silver: new THREE.MeshStandardMaterial({
    color: 0xc0c0c0,
    metalness: 0.9,
    roughness: 0.15,
    emissive: 0xc0c0c0,
    emissiveIntensity: 0.05,
  }),
  bronze: new THREE.MeshStandardMaterial({
    color: 0xcd7f32,
    metalness: 0.7,
    roughness: 0.25,
    emissive: 0xcd7f32,
    emissiveIntensity: 0.05,
  }),
};

export function createPodium(config: PodiumConfig): THREE.Group {
  const group = new THREE.Group();
  const users = [config.second, config.first, config.third]; // layout: #2, #1, #3
  const materials = [MATERIALS.silver, MATERIALS.gold, MATERIALS.bronze];
  const heights = [PODIUM_HEIGHTS[1], PODIUM_HEIGHTS[0], PODIUM_HEIGHTS[2]];

  for (let i = 0; i < 3; i++) {
    const height = heights[i];
    const geometry = new THREE.BoxGeometry(PODIUM_WIDTH, height, PODIUM_DEPTH);
    const mesh = new THREE.Mesh(geometry, materials[i]);

    const x = (i - 1) * (PODIUM_WIDTH + PODIUM_GAP);
    mesh.position.set(x, height / 2, 0);
    mesh.userData = { user: users[i], rank: i === 1 ? 1 : i === 0 ? 2 : 3 };

    group.add(mesh);

    // Rank label (only in browser)
    if (typeof document !== "undefined") {
      addRankLabel(group, i === 1 ? 1 : i === 0 ? 2 : 3, x, height + 0.5);
    }
  }

  return group;
}

function addRankLabel(
  group: THREE.Group,
  rank: number,
  x: number,
  y: number,
): void {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = "transparent";
  ctx.fillRect(0, 0, 128, 128);
  ctx.fillStyle = rank === 1 ? "#ffd700" : rank === 2 ? "#c0c0c0" : "#cd7f32";
  ctx.font = "bold 80px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`#${rank}`, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  const spriteMaterial = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
  });
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.position.set(x, y + 1, 0);
  sprite.scale.set(2, 2, 1);
  group.add(sprite);
}

export function animatePodiumRise(group: THREE.Group, progress: number): void {
  const meshes = group.children.filter(
    (c): c is THREE.Mesh => (c as THREE.Mesh).isMesh,
  );

  for (const mesh of meshes) {
    const targetY = mesh.position.y;
    const startY = -10;
    const eased = easeOutCubic(Math.min(progress, 1));
    mesh.position.y = startY + (targetY - startY) * eased;
  }
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}
