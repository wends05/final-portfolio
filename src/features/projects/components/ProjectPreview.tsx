import { ArrowRightIcon } from "@phosphor-icons/react/ssr";
import { Link } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";
import WashText from "#/features/public/components/landing/WashText";
import { isPlainClick } from "#/features/public/utils/pick";
import { getProjectMetaLine } from "#/features/public/utils/project-meta";
import type { Project } from "#content";
import { padIndex } from "../projects.utils";

interface ProjectPreviewProps {
	project: Project;
	/** Position in the /projects order, from 0. */
	index: number;
	total: number;
	/** The panel is showing this project. */
	shown: boolean;
	/** Starts the pick animation; the page navigates when it ends. */
	onPick: (slug: string) => void;
	isFeatured: boolean;
}

/**
 * One project's details in the /projects panel. Every project renders one,
 * stacked in the same grid cell; only the shown one is visible, so the panel
 * keeps the height of the tallest and doesn't jump.
 */
export default function ProjectPreview({
	project,
	index,
	total,
	shown,
	onPick,
	isFeatured,
}: ProjectPreviewProps) {
	const meta = getProjectMetaLine(project);
	const stack = project.tools.join(" · ");

	return (
		<article
			data-preview
			data-slug={project.slug}
			data-active={shown}
			inert={!shown}
			className="col-start-1 row-start-1 transition-reveal duration-300 ease-swiss data-[active=false]:invisible data-[active=false]:translate-y-4 data-[active=false]:opacity-0 motion-reduce:translate-y-0"
		>
			<p data-pick-fade className="type-label flex items-baseline gap-3">
				<span>
					{padIndex(index + 1)} / {padIndex(total)}
				</span>
				{isFeatured && (
					<span className="bg-primary px-1.5 py-1 text-primary-foreground">
						featured
					</span>
				)}
			</p>
			<h2
				data-pick-title
				className="mt-2 text-heading-l md:mt-4 md:text-display-m"
			>
				<WashText>{project.title}</WashText>
			</h2>
			<div data-pick-fade>
				<p className="mt-2 line-clamp-2 max-w-xl md:mt-4 md:line-clamp-none">
					{project.description}
				</p>
				{/* Phones show the strip only: number, title, two lines. */}
				<div className="max-md:hidden">
					{meta && <p className="type-meta mt-4">{meta}</p>}
					{stack && (
						<p className="type-meta mt-1 text-muted-foreground">{stack}</p>
					)}
					<Button
						nativeButton={false}
						size="page"
						className="mt-6"
						render={
							<Link
								to="/projects/$slug"
								params={{ slug: project.slug }}
								onClick={(e) => {
									if (!isPlainClick(e)) return;
									e.preventDefault();
									onPick(project.slug);
								}}
							>
								Read more
								<ArrowRightIcon />
							</Link>
						}
					/>
				</div>
			</div>
		</article>
	);
}
