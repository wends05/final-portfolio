interface ProjectToolsGridProps {
	tools: string[];
}

/**
 * Every tool in the project's order, four to a row from md and two on phones.
 * Each cell has its own rule under the name, so the tools dialog can draw the
 * rules and then the names. It is the dialog's scroll area, so Lenis leaves
 * its wheel events alone.
 */
export default function ProjectToolsGrid({ tools }: ProjectToolsGridProps) {
	return (
		<ul
			data-lenis-prevent
			className="grid min-h-0 flex-1 grid-cols-2 content-start gap-x-4 overflow-y-auto overscroll-contain px-4 pb-6 md:grid-cols-4 md:gap-x-6 md:px-6"
		>
			{tools.map((tool) => (
				<li
					key={tool}
					data-tool
					className="type-meta relative flex min-h-11 items-center"
				>
					<span
						data-tool-rule
						aria-hidden
						className="absolute inset-x-0 bottom-0 h-px origin-left bg-rule-soft"
					/>
					<span data-tool-name>{tool}</span>
				</li>
			))}
		</ul>
	);
}
