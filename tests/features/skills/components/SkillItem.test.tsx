import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-router", () => ({
	Link: ({ to, children, ...rest }: { to: string; children?: ReactNode }) => (
		<a href={to} {...rest}>
			{children}
		</a>
	),
}));

const { default: SkillItem } = await import(
	"#/features/skills/components/SkillItem"
);

const markup = (active = true) =>
	renderToStaticMarkup(
		<SkillItem
			skill={{
				slug: "frontend-development",
				name: "Frontend Development",
				confidence: 85,
				tools: [],
			}}
			active={active}
			onActivate={() => {}}
			onPick={() => {}}
		/>,
	);

describe("SkillItem confidence bar", () => {
	it("gives the progress bar a name that includes the skill", () => {
		// The name must be in the server markup, before Base UI hydrates.
		expect(markup()).toMatch(
			/role="progressbar"[^>]*aria-label="Frontend Development confidence"|aria-label="Frontend Development confidence"[^>]*role="progressbar"/,
		);
	});
});

describe("SkillItem inactive title", () => {
	// Inactive rows dim on purpose, but the title must stay readable: the
	// subtle text color holds 3:1 for display type; muted at 50% did not.
	it("dims inactive titles to the subtle text color", () => {
		const title = markup(false).match(/<h2[^>]*class="([^"]+)"/)?.[1] ?? "";
		expect(title.split(" ")).toContain(
			"motion-safe:group-data-[active=false]:text-subtle",
		);
		expect(title).not.toContain("/50");
	});
});
