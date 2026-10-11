import { createSerializationAdapter } from "@tanstack/react-router";
import { createMiddleware, createStart } from "@tanstack/react-start";
import {
	PUBLIC_ERROR_MESSAGE,
	shouldHideError,
} from "#/features/site/site.utils";

// In production, errors leave the server as a generic message, so database
// and storage messages never reach the page source or the browser.
const hideErrorDetails = createSerializationAdapter({
	key: "public-error",
	test: (value): value is Error => shouldHideError(value),
	toSerializable: () => PUBLIC_ERROR_MESSAGE,
	fromSerializable: (message) => new Error(message),
});

// Logs server function errors on the server (Vercel function logs) before
// they are serialized for the browser.
const logServerErrors = createMiddleware({ type: "function" }).server(
	async ({ next }) => {
		try {
			return await next();
		} catch (error) {
			if (error instanceof Error) console.error(error);
			throw error;
		}
	},
);

export const startInstance = createStart(() => ({
	serializationAdapters: [hideErrorDetails],
	functionMiddleware: [logServerErrors],
}));
