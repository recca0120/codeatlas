import { z } from "zod";

export const ContributionDaySchema = z.object({
  date: z.string(),
  count: z.number(),
});
export type ContributionDay = z.infer<typeof ContributionDaySchema>;

export const ContributionWeekSchema = z.object({
  contributionDays: z.array(ContributionDaySchema),
});
export type ContributionWeek = z.infer<typeof ContributionWeekSchema>;

export const ContributionCalendarSchema = z.object({
  weeks: z.array(ContributionWeekSchema),
});
export type ContributionCalendar = z.infer<typeof ContributionCalendarSchema>;

/**
 * Returns 0-4 level for heatmap coloring.
 * 0 = no contributions, 4 = max contributions.
 */
export function getContributionLevel(count: number, maxCount: number): number {
  if (maxCount === 0 || count === 0) return 0;
  const ratio = count / maxCount;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

export function getTotalContributions(calendar: ContributionCalendar): number {
  return calendar.weeks.reduce(
    (sum, week) =>
      sum +
      week.contributionDays.reduce((daySum, day) => daySum + day.count, 0),
    0,
  );
}
