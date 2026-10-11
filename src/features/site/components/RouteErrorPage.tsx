import { type ErrorComponentProps, useRouter } from "@tanstack/react-router";
import ErrorPage from "./ErrorPage";

/**
 * Error boundary for a route. During server rendering the response becomes a
 * 500; in the browser it shows after a failed navigation. Both use the same
 * copy, so the server and client render the same markup.
 */
export default function RouteErrorPage({
	error,
	standalone,
}: ErrorComponentProps & { standalone?: boolean }) {
	const router = useRouter();

	// Effects don't run on the server, so log while rendering there; this is
	// what shows in the Vercel function logs.
	if (typeof window === "undefined") console.error(error);

	// invalidate() re-runs the loaders and resets the error boundary.
	const retry = () => router.invalidate();

	return (
		<ErrorPage
			errorKind="error"
			error={error}
			onRetry={retry}
			standalone={standalone}
		/>
	);
}
