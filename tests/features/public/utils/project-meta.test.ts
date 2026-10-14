import { describe, expect, it } from "vitest";
import {
	getProjectMetaLine,
	getProjectPeriodLabel,
} from "#/features/public/utils/project-meta";

const completed = {
	status: "COMPLETED" as const,
	startedAt: null,
	endedAt: null,
};
const ongoing = { ...completed, status: "ONGOING" as const };

describe("getProjectPeriodLabel", () => {
	it("shows the end month of a completed project", () => {
		expect(
			getProjectPeriodLabel({
				...completed,
				startedAt: "2024-09-01",
				endedAt: "2025-01-20",
			}),
		).toBe("Jan 2025");
	});

	it("falls back to the start month when there is no end date", () => {
		expect(
			getProjectPeriodLabel({ ...completed, startedAt: "2025-06-01" }),
		).toBe("Jun 2025");
	});

	it("shows an ongoing project as running until now", () => {
		expect(getProjectPeriodLabel({ ...ongoing, startedAt: "2026-03-01" })).toBe(
			"Mar 2026 – now",
		);
		expect(getProjectPeriodLabel(ongoing)).toBe("ongoing");
	});

	it("keeps the first of the month in its own month", () => {
		expect(getProjectPeriodLabel({ ...completed, endedAt: "2026-03-01" })).toBe(
			"Mar 2026",
		);
	});

	it("is null without dates", () => {
		expect(getProjectPeriodLabel(completed)).toBeNull();
	});
});

describe("getProjectMetaLine", () => {
	it("joins the period and team", () => {
		expect(
			getProjectMetaLine({
				...completed,
				endedAt: "2025-01-20",
				teamName: "Dev Tools Club",
			}),
		).toBe("Jan 2025 | Dev Tools Club");
	});

	it("leaves out whatever is missing", () => {
		expect(
			getProjectMetaLine({
				...completed,
				endedAt: "2025-01-20",
				teamName: null,
			}),
		).toBe("Jan 2025");
		expect(getProjectMetaLine({ ...completed, teamName: "Club" })).toBe("Club");
		expect(getProjectMetaLine({ ...completed, teamName: null })).toBe("");
	});
});
