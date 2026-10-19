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

const { default: ProjectPreview } = await import(
	"#/features/projects/components/ProjectPreview"
);

const render = (tools: string[]) =>
	renderToStaticMarkup(
		<ProjectPreview
			project={
				{
					slug: "capycopy",
					title: "CapyCopy",
					description: "A copy.",
					status: "COMPLETED",
					startedAt: "2024-01-01",
					tools,
				} as unknown as Parameters<typeof ProjectPreview>[0]["project"]
			}
			index={0}
			total={1}
			shown
			onPick={() => {}}
			isFeatured={false}
		/>,
	);

/** The text of the tools line, which is muted and follows the meta line. */
const toolsLine = (markup: string) =>
	/<p class="type-meta mt-1 text-muted-foreground">(.*?)<\/p>/.exec(
		markup,
	)?.[1];

describe("ProjectPreview tools", () => {
	it("shows the first three tools and counts the rest", () => {
		const line = toolsLine(
			render(["React", "TypeScript", "Vite", "React Router", "Zod"]),
		);
		expect(line).toBe("React · TypeScript · Vite<span> +2</span>");
	});

	it("shows every tool, with no count, when there are three or fewer", () => {
		expect(toolsLine(render(["React", "TypeScript", "Vite"]))).toBe(
			"React · TypeScript · Vite",
		);
		expect(toolsLine(render(["Godot"]))).toBe("Godot");
	});

	it("leaves the tools line out when the project has none", () => {
		expect(toolsLine(render([]))).toBeUndefined();
	});
});
