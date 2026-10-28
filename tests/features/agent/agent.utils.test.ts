import { describe, expect, it } from "vitest";
import { agentViewHead } from "#/features/agent/agent.utils";

describe("agentViewHead", () => {
	const head = agentViewHead({
		path: "/projects/foo",
		file: "/projects/foo.md",
		title: "Foo",
		description: "A foo.",
		markdown: "# Foo\n",
	});

	it("keeps the agent view out of search", () => {
		expect(head.meta).toContainEqual({ name: "robots", content: "noindex" });
		expect(head.meta).toContainEqual({ title: "Foo (agent view) · wends.dev" });
	});

	it("points at the human page and the .md file", () => {
		expect(head.links).toEqual([
			{ rel: "canonical", href: "https://portfolio.wends.dev/projects/foo" },
			{
				rel: "alternate",
				type: "text/markdown",
				href: "https://portfolio.wends.dev/projects/foo.md",
			},
		]);
	});
});
