/** biome-ignore-all lint/security/noDangerouslySetInnerHtml: reasons:
 * 1. The introHeadScript is set dynamically on the client and cannot be statically analyzed.
 * 2. Theme head script is set dynamically on the client and cannot be statically analyzed.
 */
import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { introHeadScript } from "#/features/public/utils/intro";
import { buildSeo, DEFAULT_DESCRIPTION } from "#/features/seo/seo.utils";
import TanStackQueryDevtools from "#/integrations/tanstack-query/devtools";
import { themeHeadScript } from "#/lib/theme";
import appCss from "#/styles.css?url";

interface MyRouterContext {
	queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => {
		// Defaults for pages that set nothing, such as the 404 page. Every public
		// route builds its own tags, which replace these.
		const seo = buildSeo({ description: DEFAULT_DESCRIPTION });
		return {
			meta: [
				{
					charSet: "utf-8",
				},
				{
					name: "viewport",
					content: "width=device-width, initial-scale=1",
				},
				...seo.meta,
			],
			links: [
				{
					rel: "stylesheet",
					href: appCss,
				},
			],
		};
	},
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<script dangerouslySetInnerHTML={{ __html: introHeadScript }} />
				<script dangerouslySetInnerHTML={{ __html: themeHeadScript }} />
				<HeadContent />
			</head>
			<body>
				{children}
				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
						TanStackQueryDevtools,
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}
