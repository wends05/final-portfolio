import { ArrowRightIcon, ArrowUpRightIcon } from "@phosphor-icons/react/ssr";
import { Link } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";
import type { LandingProject } from "#/features/projects/projects.types";
import { isPlainClick } from "#/features/public/utils/pick";
import { getProjectMetaLine } from "#/features/public/utils/project-meta";
import { cn } from "#/lib/utils";
import WashText from "./WashText";

interface LandingProjectCardProps {
	project: LandingProject;
	active: boolean;
	/** Starts the pick animation; the section navigates when it ends. */
	onPick: (slug: string) => void;
}

const transitionClassnames =
	"transition-[opacity,translate] duration-300 ease-swiss group-data-[active=false]:translate-y-4 group-data-[active=false]:opacity-0 motion-reduce:translate-y-0";

export default function LandingProjectCard({
	project,
	active,
	onPick,
}: LandingProjectCardProps) {
	const meta = getProjectMetaLine(project);
	const stack = project.tools.join(" · ");
	const links = [
		{ label: "github", href: project.githubUrl },
		{ label: "live", href: project.liveUrl },
	].filter((link): link is { label: string; href: string } => !!link.href);

	return (
		<article
			inert={!active}
			data-active={active}
			data-slug={project.slug}
			className="group col-span-full row-span-2 row-start-2 flex min-h-0 flex-col gap-4 md:grid md:grid-cols-subgrid md:grid-rows-subgrid md:gap-y-6"
		>
			<h3
				data-pick-title
				className={cn("col-span-full text-display-l", transitionClassnames)}
			>
				<WashText>{project.title}</WashText>
			</h3>

			{/* Top of the left column: what it is, and what it was built with. */}
			<div
				data-pick-fade
				className={cn(
					"flex flex-col gap-3 font-label md:col-span-5 md:col-start-1 md:row-start-2 md:self-start",
					transitionClassnames,
				)}
			>
				<p className="line-clamp-3 md:line-clamp-none">{project.description}</p>
				{stack && (
					<p className="type-meta pt-5 text-muted-foreground">{stack}</p>
				)}
			</div>

			<div
				data-pick-fade
				className="relative aspect-16/10 w-full overflow-hidden bg-muted group-data-[active=false]:invisible md:col-span-6 md:col-start-6 md:row-start-2 md:max-h-full md:self-end"
			>
				{project.cover && (
					<img
						src={project.cover.src}
						alt={`Screenshot of ${project.title}`}
						className="absolute inset-0 size-full object-cover"
					/>
				)}
			</div>

			{/* Bottom of the left column, level with the image's bottom edge. */}
			<div
				data-pick-fade
				className={cn(
					"flex flex-col gap-3 md:col-span-5 md:col-start-1 md:row-start-2 md:self-end",
					transitionClassnames,
				)}
			>
				{meta && <p className="type-meta">{meta}</p>}
				<div className="flex flex-wrap items-center gap-x-2 gap-y-1">
					<Button
						nativeButton={false}
						className="type-label h-11 gap-2 rounded-none px-4"
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
					{links.map((link) => (
						<a
							key={link.label}
							href={link.href}
							target="_blank"
							rel="noreferrer"
							className="type-label inline-flex min-h-11 items-center gap-1 px-2 underline-offset-4 hover:underline"
						>
							{link.label}
							<ArrowUpRightIcon aria-hidden />
							<span className="sr-only">(opens in a new tab)</span>
						</a>
					))}
				</div>
			</div>
		</article>
	);
}
