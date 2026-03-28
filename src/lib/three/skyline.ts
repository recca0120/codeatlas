import * as THREE from "three";
import type { GitHubUser } from "../github-client";
import type { RankingDimension } from "../ranking";

export interface BarUserData {
  user: GitHubUser;
  rank: number;
}

const TOP_COLORS = [
  0xfbbf24, // gold - #1
  0x94a3b8, // silver - #2
  0xb45309, // bronze - #3
];
const DEFAULT_COLOR = 0x3b82f6; // blue

function getBarColor(rank: number): number {
  return rank < TOP_COLORS.length ? TOP_COLORS[rank] : DEFAULT_COLOR;
}

export function getBarHeight(value: number, maxValue: number): number {
  if (maxValue === 0) return 0.1;
  return Math.max(0.1, (value / maxValue) * 20);
}

export function getValue(
  user: GitHubUser,
  dimension: RankingDimension,
): number {
  switch (dimension) {
    case "public_contributions":
      return user.publicContributions;
    case "total_contributions":
      return user.publicContributions + user.privateContributions;
    case "followers":
      return user.followers;
  }
}

export function createSkyline(
  users: GitHubUser[],
  dimension: RankingDimension,
): THREE.Group {
  const group = new THREE.Group();
  if (users.length === 0) return group;

  const maxValue = Math.max(...users.map((u) => getValue(u, dimension)));
  const barWidth = 0.8;
  const gap = 0.3;
  const totalWidth = users.length * (barWidth + gap);

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const value = getValue(user, dimension);
    const height = getBarHeight(value, maxValue);

    const geometry = new THREE.BoxGeometry(barWidth, height, barWidth);
    const material = new THREE.MeshStandardMaterial({
      color: getBarColor(i),
      roughness: 0.4,
      metalness: 0.3,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(i * (barWidth + gap) - totalWidth / 2, height / 2, 0);
    mesh.userData = { user, rank: i } satisfies BarUserData;

    group.add(mesh);
  }

  return group;
}
