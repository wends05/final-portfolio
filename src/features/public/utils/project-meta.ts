import { format, parseISO } from "date-fns";
import type { ProjectWithCoverImageUrl } from "#/features/projects/projects.types";

type ProjectDates = Pick<
	ProjectWithCoverImageUrl,
	"status" | "startedAt" | "endedAt"
>;

// parseISO reads a date-only string as local midnight, so the month never
// slips back a day in timezones behind UTC (unlike `new Date("2026-03-01")`).
const month = (date: string) => format(parseISO(date), "MMM yyyy");

/**
 * When the project happened: "Mar 2026 – now" while ongoing, otherwise the
 * month it ended (or started, if it has no end date). Null when it has no dates.
 */
export function getProjectPeriodLabel(project: ProjectDates): string | null {
	if (project.status === "ONGOING") {
		return project.startedAt ? `${month(project.startedAt)} – now` : "ongoing";
	}
	const date = project.endedAt ?? project.startedAt;
	return date ? month(date) : null;
}

/** The project's meta line: its period and team, each only when present. */
export function getProjectMetaLine(
	project: ProjectDates & Pick<ProjectWithCoverImageUrl, "teamName">,
): string {
	return [getProjectPeriodLabel(project), project.teamName]
		.filter(Boolean)
		.join(" | ");
}
