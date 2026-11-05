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

const markup = () =>
	renderToStaticMarkup(
		<SkillItem
			skill={{
				slug: "frontend-development",
				name: "Frontend Development",
				confidence: 85,
				tools: [],
			}}
			active
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
