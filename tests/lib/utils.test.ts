import { describe, expect, it } from "vitest";
import { cn } from "#/lib/utils";

const SIZES = [
	"2xs",
	"display-xl",
	"display-l",
	"display-m",
	"heading-l",
	"heading-m",
	"heading-s",
	"lead",
	"body",
	"body-s",
];

describe("cn", () => {
	it("joins conditional, array, and object inputs like clsx", () => {
		expect(
			cn("px-2", false, null, undefined, [
				"py-1",
				{ underline: true, italic: false },
			]),
		).toBe("px-2 py-1 underline");
	});

	it("keeps the last of conflicting Tailwind utilities", () => {
		expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
		expect(cn("bg-primary", "bg-background")).toBe("bg-background");
	});

	it.each(SIZES)("keeps text-%s beside a text colour", (size) => {
		expect(cn(`text-${size}`, "text-muted-foreground")).toBe(
			`text-${size} text-muted-foreground`,
		);
	});

	it("merges custom text sizes with each other and with default sizes", () => {
		expect(cn("text-display-l", "text-heading-m")).toBe("text-heading-m");
		expect(cn("text-sm", "text-body")).toBe("text-body");
	});
});
