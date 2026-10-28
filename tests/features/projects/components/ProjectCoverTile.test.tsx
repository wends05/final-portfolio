import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ProjectCoverTile from "#/features/projects/components/ProjectCoverTile";

const render = () =>
	renderToStaticMarkup(
		<ProjectCoverTile number="03" status="ongoing" year="2024" />,
	);

describe("ProjectCoverTile", () => {
	it("shows the project's number, status and year", () => {
		const markup = render();
		expect(markup).toContain(">03<");
		expect(markup).toContain(">ongoing<");
		expect(markup).toContain(">2024<");
	});

	it("is decoration: the page already names the project", () => {
		expect(render()).toMatch(/^<div[^>]*aria-hidden="true"/);
	});

	it("fills the box it sits in and measures its labels against its own width", () => {
		const classes = /class="([^"]*)"/.exec(render())?.[1].split(" ");
		expect(classes).toContain("absolute");
		expect(classes).toContain("inset-0");
		expect(classes).toContain("@container");
		expect(classes).toContain("tile-columns");
	});

	it("drops the status and year on tiles too narrow to hold them", () => {
		const markup = render();
		expect(markup.match(/@max-\[12\.5rem\]:hidden/g)).toHaveLength(2);
	});
});
