import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const { outlet } = vi.hoisted(() => ({
	outlet: { current: (() => null) as () => ReactNode },
}));

// The router needs a browser; the markup does not. The Outlet renders
// whatever page the test puts there.
vi.mock("@tanstack/react-router", () => ({
	Link: ({ to, children, ...rest }: { to: string; children?: ReactNode }) => (
		<a href={to} {...rest}>
			{children}
		</a>
	),
	Outlet: () => outlet.current(),
	useLocation: () => ({ pathname: "/nope" }),
	useRouterState: ({ select }: { select: (s: unknown) => unknown }) =>
		select({ location: { pathname: "/ai/nope" } }),
}));

const { default: ErrorPage } = await import(
	"#/features/site/components/ErrorPage"
);
const { default: AgentLayout } = await import(
	"#/features/agent/components/AgentLayout"
);

const mains = (html: string) => html.match(/<main[\s>]/g) ?? [];

/** The markup without the robots tag, which React hoists into <head>. */
const page = (html: string) => html.replace(/<meta [^>]*\/?>/, "");

describe("error page", () => {
	// A screen reader user jumps to the page's content through this landmark.
	it("renders exactly one main landmark on the 404", () => {
		expect(
			mains(renderToStaticMarkup(<ErrorPage errorKind="404" />)),
		).toHaveLength(1);
	});

	it("holds the heading and actions inside the main landmark", () => {
		const html = page(renderToStaticMarkup(<ErrorPage errorKind="404" />));
		expect(html).toMatch(/^<main[^>]*>.*<h1[^>]*>.*<\/h1>.*<\/main>$/s);
		expect(html).toContain('href="/"');
	});

	it("keeps the standalone wordmark header outside the main landmark", () => {
		const html = page(
			renderToStaticMarkup(<ErrorPage errorKind="error" standalone />),
		);
		expect(mains(html)).toHaveLength(1);
		expect(html).toMatch(/^<header[^>]*>.*<\/header><main[^>]*>.*<\/main>$/s);
	});

	it("adds no second main inside the agent layout, which draws its own", () => {
		outlet.current = () => <ErrorPage errorKind="404" />;
		const html = renderToStaticMarkup(<AgentLayout />);
		expect(mains(html)).toHaveLength(1);
		expect(html).toMatch(/<main[^>]*>.*<h1[^>]*>.*<\/h1>.*<\/main>/s);
	});
});
