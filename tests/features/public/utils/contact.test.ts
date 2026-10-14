import { describe, expect, it, vi } from "vitest";
import {
	CONTACT_LINKS,
	copyText,
	DEFAULT_EMAIL_ID,
	EMAILS,
	findEmail,
	mailtoHref,
	RESUME_PATH,
} from "#/features/public/utils/contact";

describe("contact emails", () => {
	it("picks the main gmail address by default", () => {
		expect(findEmail(DEFAULT_EMAIL_ID).address).toBe("cxnner05@gmail.com");
	});

	it("finds the school address by id", () => {
		expect(findEmail("school").address).toBe(
			"wendellterence.dador-23@cpu.edu.ph",
		);
	});

	it("gives every address a unique id", () => {
		const ids = EMAILS.map((email) => email.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it("builds a mailto link", () => {
		expect(mailtoHref("cxnner05@gmail.com")).toBe("mailto:cxnner05@gmail.com");
	});
});

describe("contact links", () => {
	it("lists LinkedIn, GitHub and the résumé in that order", () => {
		expect(CONTACT_LINKS.map((link) => link.label)).toEqual([
			"LinkedIn",
			"GitHub",
			"Résumé",
		]);
	});

	it("points external links at https and the résumé at the static PDF", () => {
		for (const link of CONTACT_LINKS) {
			if (link.kind === "external") expect(link.href).toMatch(/^https:\/\//);
			else expect(link.href).toBe(RESUME_PATH);
		}
	});
});

describe("copyText", () => {
	it("writes the text and reports success", async () => {
		const writeText = vi.fn().mockResolvedValue(undefined);
		await expect(copyText("a@b.c", { writeText })).resolves.toBe(true);
		expect(writeText).toHaveBeenCalledWith("a@b.c");
	});

	it("reports failure when the browser refuses", async () => {
		const writeText = vi.fn().mockRejectedValue(new Error("denied"));
		await expect(copyText("a@b.c", { writeText })).resolves.toBe(false);
	});

	it("reports failure when there is no clipboard", async () => {
		await expect(copyText("a@b.c", undefined)).resolves.toBe(false);
	});
});
