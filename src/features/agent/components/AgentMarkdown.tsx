import { Link } from "@tanstack/react-router";
import type { ComponentProps, ReactNode } from "react";
import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { agentViewLink } from "../utils/view-paths";

interface AgentMarkdownProps {
	/** The agent copy, exactly as its `.md` file holds it. */
	markdown: string;
	/** The origin the copy's links use, so they can stay in the agent view. */
	origin: string;
}

/** A heading with its Markdown marks shown, dimmed: `# Projects`. */
function heading(level: 1 | 2 | 3, className: string) {
	const Tag = `h${level}` as const;
	return ({ children }: { children?: ReactNode }) => (
		<Tag className={className}>
			<span aria-hidden className="font-normal text-muted-foreground">
				{"#".repeat(level)}{" "}
			</span>
			{children}
		</Tag>
	);
}

const link = "underline underline-offset-2 focus-ring";

/**
 * An agent copy rendered as formatted Markdown (GFM tables included), in
 * mono type. Named links to the site's pages open their agent views; bare
 * URLs, files and other sites keep their addresses.
 */
export default function AgentMarkdown({
	markdown,
	origin,
}: AgentMarkdownProps) {
	const components: Components = {
		h1: heading(1, "mb-4 font-semibold text-heading-l"),
		h2: heading(2, "mt-10 mb-3 font-semibold text-heading-s"),
		h3: heading(3, "mt-8 mb-2 font-semibold"),
		p: ({ children }) => <p className="mt-4 first:mt-0">{children}</p>,
		ul: ({ children }) => <ul className="mt-4 list-disc pl-5">{children}</ul>,
		ol: ({ children }) => (
			<ol className="mt-4 list-decimal pl-5">{children}</ol>
		),
		li: ({ children }) => <li className="mt-1">{children}</li>,
		blockquote: ({ children }) => (
			<blockquote className="mt-4 border-rule-soft border-l-2 pl-4 text-muted-foreground">
				{children}
			</blockquote>
		),
		hr: () => <hr className="mt-8 border-rule-soft" />,
		code: ({ children }) => <code className="bg-muted px-1">{children}</code>,
		pre: ({ children }) => (
			<pre className="mt-4 overflow-x-auto bg-muted p-3">{children}</pre>
		),
		// Wide tables scroll inside their own box, never the page.
		table: ({ children }) => (
			<div className="mt-6 overflow-x-auto">
				<table className="w-full border-collapse text-left">{children}</table>
			</div>
		),
		th: ({ children }) => (
			<th className="whitespace-nowrap border-rule border-b py-2 pr-4 align-bottom font-semibold">
				{children}
			</th>
		),
		td: ({ children }) => (
			<td className="border-rule-soft border-b py-2 pr-4 align-top">
				{children}
			</td>
		),
		a: ({ href = "", children }: ComponentProps<"a">) => {
			// A bare URL ("Human page: https://…") means that address, so only
			// named links stay in the agent view.
			const to = children === href ? null : agentViewLink(href, origin);
			if (to) {
				return (
					<Link to={to} className={link}>
						{children}
					</Link>
				);
			}
			return (
				<a href={href} className={link}>
					{children}
				</a>
			);
		},
	};

	return (
		<Markdown remarkPlugins={[remarkGfm]} components={components}>
			{markdown}
		</Markdown>
	);
}
