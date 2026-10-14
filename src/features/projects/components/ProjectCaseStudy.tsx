import {
	ArrowLeftIcon,
	ArrowRightIcon,
	ArrowUpRightIcon,
} from "@phosphor-icons/react/ssr";
import { Link } from "@tanstack/react-router";
import { useRef } from "react";
import { Button } from "#/components/ui/button";
import { usePageEntrance } from "#/features/public/hooks/usePageEntrance";
import type { ProjectPageData } from "../projects.types";
import {
	getMetadataRows,
	getProjectDateLine,
	getProjectLinks,
	padIndex,
} from "../projects.utils";
import ProjectGallery from "./ProjectGallery";
import ProjectLinkButtons from "./ProjectLinkButtons";

interface ProjectCaseStudyProps {
	page: ProjectPageData;
}

/**
 * /projects/<slug>, the canvas's ★ A5 board: the number in the margin, the
 * title with "by <team>" at the end of its row, the links as buttons, then
 * the cover on the left with the metadata and credits under it and the
 * write-up beside it. The gallery carousel, the links again and the next
 * project close the page.
 */
export default function ProjectCaseStudy({ page }: ProjectCaseStudyProps) {
	const { project, gallery, credits, position, total, next } = page;
	const links = getProjectLinks(project);
	const rows = getMetadataRows(project.metadata);
	const dateLine = getProjectDateLine(project);
	const hasDetails = rows.length > 0 || credits.length > 0;
	const root = useRef<HTMLElement>(null);
	// The next-project link reuses this route, so key the entrance by slug.
	usePageEntrance(root, project.slug);

	return (
		<main ref={root} className="page-grid items-start pt-32 pb-24">
			<div
				data-entrance
				className="col-span-full flex items-center justify-between gap-4"
			>
				<Button
					nativeButton={false}
					variant="outline"
					className="type-label h-11 gap-2 rounded-none border-rule px-4 hover:bg-primary hover:text-primary-foreground max-md:px-3"
					render={
						<Link to="/projects">
							<ArrowLeftIcon aria-hidden />
							All projects
						</Link>
					}
				/>
				{project.featuredRank != null && (
					<p className="type-label bg-primary px-1.5 py-1 text-primary-foreground">
						featured
					</p>
				)}
			</div>

			{/* Number in the margin column, title across 8, byline on the rest. */}
			<div className="col-span-full mt-12 grid grid-cols-subgrid gap-y-3">
				<p
					data-entrance
					className="type-index col-span-full md:col-span-1 md:mt-[calc(var(--text-display-l)*0.12)]"
				>
					<span aria-hidden>{padIndex(position)}</span>
					<span className="sr-only">
						Project {position} of {total}
					</span>
				</p>
				<h1
					data-entrance-title
					className="col-span-full text-display-l md:col-span-8"
				>
					{project.title}
				</h1>
				{project.teamName && (
					<p
						data-entrance
						className="md:self-baseline-last col-span-full text-heading-s md:col-span-3 md:justify-self-end md:text-right"
					>
						by {project.teamName}
					</p>
				)}
			</div>

			<ProjectLinkButtons
				entrance
				links={links}
				className="col-span-full mt-7 md:col-span-11 md:col-start-2"
			/>

			{/* The cover stands alone, apart from the gallery. Explicit rows from
			    md put the write-up beside the cover and the details under it;
			    on phones they stack in source order. */}
			<figure
				data-entrance
				className="col-span-full -mx-4 mt-10 md:col-span-6 md:row-start-4 md:mx-0 md:mt-14"
			>
				<div className="relative aspect-4/3 overflow-hidden bg-muted">
					{project.coverImageUrl && (
						<img
							src={project.coverImageUrl}
							alt={`Cover of ${project.title}`}
							className="absolute inset-0 size-full object-cover"
						/>
					)}
				</div>
			</figure>

			<section
				data-entrance
				aria-labelledby="project-about"
				className="col-span-full mt-8 md:col-span-5 md:col-start-8 md:row-span-2 md:row-start-4 md:mt-14"
			>
				<div className="flex items-baseline justify-between gap-4 border-rule border-b pb-3">
					<h2 id="project-about" className="type-label">
						about
					</h2>
					{dateLine && <p className="type-label">{dateLine}</p>}
				</div>
				<p className="mt-4 text-lead">{project.description}</p>
			</section>

			{hasDetails && (
				<div
					data-entrance
					className="col-span-full mt-10 grid grid-cols-subgrid content-start gap-y-10 md:col-span-6 md:row-start-5"
				>
					{/* Only the `metadata` column, on the page columns: 1 + 3, 2 + 4 from md. */}
					{rows.length > 0 && (
						<dl className="col-span-full grid grid-cols-subgrid gap-y-3">
							{rows.map((row) => (
								<div
									key={row.label}
									className="col-span-full grid grid-cols-subgrid"
								>
									<dt className="type-label pt-0.5 text-muted-foreground md:col-span-2">
										{row.label}
									</dt>
									<dd className="type-meta col-span-3 md:col-span-4">
										{row.value}
									</dd>
								</div>
							))}
						</dl>
					)}

					{credits.length > 0 && (
						<section
							aria-labelledby="project-credits"
							className="col-span-full"
						>
							<h2
								id="project-credits"
								className="type-label border-rule border-b pb-2.5"
							>
								credits
							</h2>
							<ul>
								{credits.map((credit) => {
									const row =
										"type-meta flex min-h-11 items-center justify-between gap-4 border-rule-soft border-b";
									const role = credit.role && (
										<span className="text-right text-muted-foreground">
											{credit.role}
										</span>
									);
									return (
										<li key={`${credit.name}-${credit.role}`}>
											{credit.profileUrl ? (
												<a
													href={credit.profileUrl}
													target="_blank"
													rel="noreferrer"
													className={`${row} group outline-none focus-visible:outline-2 focus-visible:outline-ring`}
												>
													<span className="inline-flex items-center gap-1 underline-offset-4 group-hover:underline">
														{credit.name}
														<ArrowUpRightIcon aria-hidden />
														<span className="sr-only">
															(opens in a new tab)
														</span>
													</span>
													{role}
												</a>
											) : (
												<div className={row}>
													<span>{credit.name}</span>
													{role}
												</div>
											)}
										</li>
									);
								})}
							</ul>
						</section>
					)}
				</div>
			)}

			<ProjectGallery
				entrance
				key={project.slug}
				title={project.title}
				images={gallery}
				className="col-span-full mt-16 md:mt-24"
			/>

			<div
				data-entrance
				className="col-span-full mt-16 grid grid-cols-subgrid gap-y-8 border-rule border-t pt-4 md:mt-24"
			>
				<ProjectLinkButtons
					links={links}
					className="col-span-full md:col-span-6"
				/>
				{next && (
					<div className="col-span-full md:col-span-5 md:col-start-8">
						<p className="type-label mb-2.5">next project</p>
						<Link
							to="/projects/$"
							params={{ _splat: next.slug }}
							className="group inline-flex items-center gap-3 outline-none focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
						>
							<span className="text-display-m underline-offset-8 group-hover:underline">
								{next.title}
							</span>
							<ArrowRightIcon aria-hidden className="size-8 shrink-0" />
						</Link>
					</div>
				)}
			</div>
		</main>
	);
}
