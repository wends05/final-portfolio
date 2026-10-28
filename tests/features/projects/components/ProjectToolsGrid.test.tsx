import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ProjectToolsGrid from "#/features/projects/components/ProjectToolsGrid";

const render = (tools: string[]) =>
	renderToStaticMarkup(<ProjectToolsGrid tools={tools} />);

describe("ProjectToolsGrid", () => {
	it("lists every tool in the project's order", () => {
		const tools = Array.from({ length: 20 }, (_, i) => `Tool ${i + 1}`);
		const names = [
			...render(tools).matchAll(/<span data-tool-name="true">([^<]*)<\/span>/g),
		].map((match) => match[1]);
		expect(names).toEqual(tools);
	});

	it("gives each tool a rule for the dialog to draw", () => {
		const markup = render(["React", "Vite"]);
		expect(markup.match(/data-tool-rule/g)).toHaveLength(2);
	});

	it("keeps Lenis off its scroll area", () => {
		expect(render(["React"])).toMatch(/<ul[^>]*data-lenis-prevent/);
	});
});
