import { afterEach, describe, expect, it, vi } from "vitest";
import { appGSAP } from "#/integrations/animations/gsap";
import {
	FULL_MOTION,
	matchFullMotion,
	matchMotion,
	REDUCED_MOTION,
} from "#/integrations/animations/motion";

type MatchMedia = ReturnType<typeof appGSAP.matchMedia>;

function stubMatchMedia() {
	const add = vi.fn();
	vi.spyOn(appGSAP, "matchMedia").mockReturnValue({
		add,
	} as unknown as MatchMedia);
	return add;
}

describe("matchMotion", () => {
	afterEach(() => vi.restoreAllMocks());

	it("registers both queries and passes the reduce condition to setup", () => {
		const add = stubMatchMedia();
		const setup = vi.fn();

		matchMotion(setup);

		expect(add).toHaveBeenCalledWith(
			{ motion: FULL_MOTION, reduce: REDUCED_MOTION },
			expect.any(Function),
		);
		const callback = add.mock.calls[0][1];
		callback({ conditions: { motion: false, reduce: true } });
		expect(setup).toHaveBeenLastCalledWith({ reduce: true });
		callback({ conditions: { motion: true, reduce: false } });
		expect(setup).toHaveBeenLastCalledWith({ reduce: false });
	});
});

describe("matchFullMotion", () => {
	afterEach(() => vi.restoreAllMocks());

	it("registers the full-motion query alone", () => {
		const add = stubMatchMedia();
		const setup = vi.fn();

		matchFullMotion(setup);

		expect(add).toHaveBeenCalledWith(FULL_MOTION, setup);
	});
});
