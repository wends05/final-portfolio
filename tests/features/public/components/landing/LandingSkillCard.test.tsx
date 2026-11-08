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

const { default: LandingSkillCard } = await import(
	"#/features/public/components/landing/LandingSkillCard"
);

describe("LandingSkillCard", () => {
	it("shows the confidence as a percentage, with no progress bar", () => {
		const markup = renderToStaticMarkup(
			<LandingSkillCard
				skill={{
					slug: "frontend-development",
					name: "Frontend Development",
					tools: ["React"],
					confidence: 85,
				}}
				onPick={() => {}}
			/>,
		);

		expect(markup).toContain('85%<span class="sr-only"> confidence</span>');
		expect(markup).not.toContain('role="progressbar"');
	});
});
