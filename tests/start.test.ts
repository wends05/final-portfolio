import { describe, expect, it, vi } from "vitest";
import { csrfMiddleware, startInstance } from "#/start";

type Handler = (ctx: {
	request: Request;
	handlerType: "serverFn" | "router";
	next: () => Promise<unknown>;
}) => Promise<unknown>;

const run = async (
	handlerType: "serverFn" | "router",
	headers: Record<string, string>,
) => {
	const next = vi.fn(async () => "passed");
	const handler = csrfMiddleware.options.server as unknown as Handler;
	const result = await handler({
		request: new Request("https://portfolio.wends.dev/_serverFn/abc", {
			method: "POST",
			headers,
		}),
		handlerType,
		next,
	});
	return { result, next };
};

describe("CSRF middleware", () => {
	it("runs on every request", async () => {
		const options = await startInstance.getOptions();
		expect(options.requestMiddleware).toContain(csrfMiddleware);
	});

	it("lets same-origin server function calls through", async () => {
		const { next } = await run("serverFn", {
			"Sec-Fetch-Site": "same-origin",
		});
		expect(next).toHaveBeenCalled();
	});

	it("refuses cross-site server function calls with a 403", async () => {
		const { result, next } = await run("serverFn", {
			"Sec-Fetch-Site": "cross-site",
		});
		expect(next).not.toHaveBeenCalled();
		expect((result as Response).status).toBe(403);
	});

	it("checks Origin when Sec-Fetch-Site is missing", async () => {
		const { next } = await run("serverFn", {
			Origin: "https://evil.example",
		});
		expect(next).not.toHaveBeenCalled();
	});

	it("leaves page requests alone", async () => {
		const { next } = await run("router", { "Sec-Fetch-Site": "cross-site" });
		expect(next).toHaveBeenCalled();
	});
});
