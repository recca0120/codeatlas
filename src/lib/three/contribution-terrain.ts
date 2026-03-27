import * as THREE from "three";

export interface ContributionDay {
  date: string;
  count: number;
}

export interface ContributionWeek {
  contributionDays: ContributionDay[];
}

const COLOR_LEVELS = [
  0x161b22, // 0 contributions - dark
  0x0e4429, // low - dark green
  0x006d32, // medium - green
  0x26a641, // high - bright green
  0xffd700, // very high - gold
];

export function getContributionColor(count: number, maxCount: number): number {
  if (count === 0) return COLOR_LEVELS[0];
  if (maxCount === 0) return COLOR_LEVELS[0];
  const ratio = count / maxCount;
  if (ratio < 0.25) return COLOR_LEVELS[1];
  if (ratio < 0.5) return COLOR_LEVELS[2];
  if (ratio < 0.75) return COLOR_LEVELS[3];
  return COLOR_LEVELS[4];
}

export function getContributionHeight(count: number, maxCount: number): number {
  if (maxCount === 0 || count === 0) return 0.1;
  return Math.max(0.1, (count / maxCount) * 5);
}

export function createContributionTerrain(
  weeks: ContributionWeek[],
): THREE.Group {
  const group = new THREE.Group();
  if (weeks.length === 0) return group;

  const allCounts = weeks.flatMap((w) =>
    w.contributionDays.map((d) => d.count),
  );
  const maxCount = Math.max(...allCounts, 1);

  const barSize = 0.8;
  const gap = 0.15;
  const step = barSize + gap;

  for (let weekIdx = 0; weekIdx < weeks.length; weekIdx++) {
    const week = weeks[weekIdx];
    for (let dayIdx = 0; dayIdx < week.contributionDays.length; dayIdx++) {
      const day = week.contributionDays[dayIdx];
      const height = getContributionHeight(day.count, maxCount);
      const color = getContributionColor(day.count, maxCount);

      const geometry = new THREE.BoxGeometry(barSize, height, barSize);
      const material = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.6,
        metalness: 0.2,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(
        weekIdx * step - (weeks.length * step) / 2,
        height / 2,
        dayIdx * step - (7 * step) / 2,
      );
      mesh.userData = { date: day.date, count: day.count };
      group.add(mesh);
    }
  }

  return group;
}
