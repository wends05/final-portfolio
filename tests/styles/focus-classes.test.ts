import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function sourceFiles(dir: string): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) return sourceFiles(path);
		return /\.tsx?$/.test(entry.name) ? [path] : [];
	});
}

describe("focus classes in src", () => {
	it("never pair outline-none with focus-visible:outline-2, which draws no ring", () => {
		const offenders = sourceFiles("src").filter((file) =>
			readFileSync(file, "utf8")
				.split("\n")
				.some(
					(line) =>
						/\boutline-none\b/.test(line) &&
						line.includes("focus-visible:outline-2"),
				),
		);

		expect(offenders).toEqual([]);
	});
});
