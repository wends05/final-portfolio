import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-router", () => ({
	Link: ({ to, children, ...rest }: { to: string; children?: ReactNode }) => (
		<a href={to} data-router-link="" {...rest}>
			{children}
		</a>
	),
}));

const { markdownTable } = await import("#/features/agent/utils/agent-copy");
const { default: AgentMarkdown } = await import(
	"#/features/agent/components/AgentMarkdown"
);

const ORIGIN = "https://portfolio.wends.dev";

const render = (markdown: string) =>
	renderToStaticMarkup(<AgentMarkdown markdown={markdown} origin={ORIGIN} />);

describe("AgentMarkdown", () => {
	it("renders headings with their marks dimmed and hidden from screen readers", () => {
		const markup = render("# Projects\n\n## Agent files");
		expect(markup).toMatch(
			/<h1[^>]*><span aria-hidden="true"[^>]*># <\/span>Projects<\/h1>/,
		);
		expect(markup).toMatch(
			/<h2[^>]*><span aria-hidden="true"[^>]*>## <\/span>Agent files<\/h2>/,
		);
	});

	it("renders GFM tables in a scrolling box", () => {
		const markup = render(
			"| Field | Value |\n| --- | --- |\n| Tools | React |",
		);
		expect(markup).toMatch(/<div class="[^"]*overflow-x-auto[^"]*"><table/);
		expect(markup).toContain(">Field</th>");
		expect(markup).toContain(">React</td>");
	});

	it("keeps a cell whole when its text has a backslash before a pipe", () => {
		const markup = render(markdownTable(["A", "B"], [["x\\|y", "z"]]));
		expect(markup).toContain(">x\\|y</td>");
		expect(markup).toContain(">z</td>");
	});

	it("keeps links to site pages in the agent view", () => {
		const markup = render(`[Foo](${ORIGIN}/projects/foo)`);
		expect(markup).toContain('href="/ai/projects/foo" data-router-link=""');
	});

	it("keeps a bare URL's address, such as the human page line", () => {
		const markup = render(`Human page: ${ORIGIN}/projects`);
		expect(markup).toContain(`href="${ORIGIN}/projects"`);
		expect(markup).not.toContain("data-router-link");
	});

	it("leaves links to files and other sites as they are", () => {
		const markup = render(
			`[foo.md](${ORIGIN}/projects/foo.md) [gh](https://github.com/wends05)`,
		);
		expect(markup).toContain(`href="${ORIGIN}/projects/foo.md"`);
		expect(markup).toContain('href="https://github.com/wends05"');
		expect(markup).not.toContain("data-router-link");
	});
});
