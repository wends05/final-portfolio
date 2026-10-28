export const CV_PATH = "/cv.pdf";
export const CV_FILENAME = "wendell-dador-cv.pdf";

export const CONTACT_LINKS = [
	{
		kicker: "01 · profile",
		label: "LinkedIn",
		meta: "linkedin.com/in/rencee05",
		href: "https://linkedin.com/in/rencee05",
		kind: "external",
	},
	{
		kicker: "02 · code",
		label: "GitHub",
		meta: "github.com/wends05",
		href: "https://github.com/wends05",
		kind: "external",
	},
	{
		kicker: "03 · pdf",
		label: "CV",
		meta: "Download",
		href: CV_PATH,
		kind: "download",
	},
] as const;

export type ContactLink = (typeof CONTACT_LINKS)[number];

// The main address comes first and is the one picked by default.
export const EMAILS = [
	{ id: "main", label: "Main", address: "cxnner05@gmail.com" },
	{
		id: "school",
		label: "School",
		address: "wendellterence.dador-23@cpu.edu.ph",
	},
] as const;

export type EmailId = (typeof EMAILS)[number]["id"];

export const DEFAULT_EMAIL_ID: EmailId = "main";

// Milliseconds the copy button reads "Copied" before it resets.
export const COPY_FEEDBACK_MS = 2000;

export function findEmail(id: EmailId) {
	return EMAILS.find((email) => email.id === id) ?? EMAILS[0];
}

export function mailtoHref(address: string) {
	return `mailto:${address}`;
}

type ClipboardWriter = Pick<Clipboard, "writeText">;

/** Copies `text`; false when there is no clipboard or the browser refuses. */
export async function copyText(
	text: string,
	clipboard: ClipboardWriter | undefined = globalThis.navigator?.clipboard,
): Promise<boolean> {
	if (!clipboard) return false;
	try {
		await clipboard.writeText(text);
		return true;
	} catch {
		return false;
	}
}
