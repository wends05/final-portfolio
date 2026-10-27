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

const { default: ProjectCard } = await import(
	"#/features/projects/components/ProjectCard"
);

type CardProject = Parameters<typeof ProjectCard>[0]["project"];

const render = (overrides: Partial<CardProject>) =>
	renderToStaticMarkup(
		<ProjectCard
			project={
				{
					slug: "wishlist-app",
					title: "Wishlist App",
					status: "ONGOING",
					startedAt: "2024-09-01",
					...overrides,
				} as CardProject
			}
			index={2}
			shown={false}
			dim={false}
			layout="card"
			onPointerEnter={() => {}}
			onFocus={() => {}}
			onPick={() => {}}
		/>,
	);

describe("ProjectCard cover", () => {
	it("shows the cover image when the project has one", () => {
		const markup = render({
			cover: { src: "/static/cover.png" } as CardProject["cover"],
		});
		expect(markup).toContain('src="/static/cover.png"');
		expect(markup).not.toContain("tile-columns");
	});

	it("stands the no-cover tile in for a missing cover: number, status, year", () => {
		const markup = render({ cover: undefined });
		expect(markup).toContain("tile-columns");
		expect(markup).not.toContain("<img");
		expect(markup).toContain(">03<");
		expect(markup).toContain(">ongoing<");
		expect(markup).toContain(">2024<");
	});
});
