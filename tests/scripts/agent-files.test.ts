import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
	removeAgentFiles,
	writeAgentFiles,
} from "../../scripts/agent-files.utils";

let dir: string;

beforeEach(() => {
	dir = mkdtempSync(join(tmpdir(), "agent-files-"));
	writeFileSync(join(dir, "cv.pdf"), "pdf");
});

afterEach(() => {
	rmSync(dir, { recursive: true, force: true });
});

const files = [
	{ file: "/index.md", text: "# Home\n" },
	{ file: "/projects/foo.md", text: "# Foo\n" },
	{ file: "/llms.txt", text: "# Site\n" },
];

describe("writeAgentFiles", () => {
	it("writes each file at its path", () => {
		expect(writeAgentFiles(dir, files, false)).toEqual([
			"/index.md",
			"/projects/foo.md",
			"/llms.txt",
		]);
		expect(readFileSync(join(dir, "projects/foo.md"), "utf8")).toBe("# Foo\n");
		expect(readFileSync(join(dir, "llms.txt"), "utf8")).toBe("# Site\n");
	});

	it("writes nothing while the site is gated, and removes the last build's", () => {
		writeAgentFiles(dir, files, false);
		expect(writeAgentFiles(dir, files, true)).toEqual([]);
		expect(existsSync(join(dir, "index.md"))).toBe(false);
		expect(existsSync(join(dir, "projects"))).toBe(false);
		expect(existsSync(join(dir, "cv.pdf"))).toBe(true);
	});

	it("drops a copy whose page is gone", () => {
		writeAgentFiles(dir, files, false);
		writeAgentFiles(dir, [files[0]], false);
		expect(existsSync(join(dir, "projects/foo.md"))).toBe(false);
	});

	it("refuses a path outside the public folder", () => {
		for (const file of [
			"/../escape.md",
			"/a//b.md",
			"/x.html",
			"relative.md",
		]) {
			expect(() => writeAgentFiles(dir, [{ file, text: "" }], false)).toThrow(
				/Refusing/,
			);
		}
	});
});

describe("removeAgentFiles", () => {
	it("keeps files it did not write", () => {
		mkdirSync(join(dir, "projects"));
		writeFileSync(join(dir, "projects/keep.png"), "png");
		writeFileSync(join(dir, "projects/old.md"), "# Old\n");
		removeAgentFiles(dir);
		expect(existsSync(join(dir, "projects/keep.png"))).toBe(true);
		expect(existsSync(join(dir, "projects/old.md"))).toBe(false);
	});
});
