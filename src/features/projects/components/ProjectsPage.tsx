import { useRouter } from "@tanstack/react-router";
import { type ReactNode, useRef, useState } from "react";
import { usePageEntrance } from "#/features/public/hooks/usePageEntrance";
import { usePickTransition } from "#/features/public/hooks/usePickTransition";
import type { Project } from "#content";
import { useShownProject } from "../hooks/useShownProject";
import { padIndex } from "../projects.utils";
import ProjectCard from "./ProjectCard";
import ProjectPreview from "./ProjectPreview";

interface ProjectsPageProps {
	/** Published projects in the /projects order: featured first. */
	projects: Project[];
	featured: string[];
}

export default function ProjectsPage({
	projects,
	featured,
}: ProjectsPageProps) {
	const page = useRef<HTMLElement>(null);
	const router = useRouter();
	const {
		list,
		panel,
		shown,
		dimOthers,
		tileProps,
		listProps,
		freeze,
		unfreeze,
	} = useShownProject(projects.length);
	// Slug of the project being picked.
	const [picking, setPicking] = useState<string | null>(null);

	const featuredProjects = projects.filter((p) => featured.includes(p.slug));
	const rest = projects.filter((p) => !featured.includes(p.slug));

	const pick = (slug: string) => {
		// Freeze in the click itself: stopping Lenis fires one more scroll.
		freeze(projects.findIndex((p) => p.slug === slug));
		setPicking(slug);
	};

	usePageEntrance(page);

	usePickTransition({
		scope: page,
		picking,
		// The wash runs on the panel's title, not on the tile that was clicked.
		getTargets: (slug, q) => {
			const preview = q("[data-preview]").find(
				(el) => el.dataset.slug === slug,
			);
			const title = preview?.querySelector<HTMLElement>("[data-pick-title]");
			const wash = title?.querySelector("[data-pick-wash]");
			if (!title || !wash) return null;
			return { others: q("[data-pick-fade]"), wash, title };
		},
		navigate: (slug) =>
			router.navigate({ to: "/projects/$slug", params: { slug } }),
		onCancel: () => {
			unfreeze();
			setPicking(null);
		},
	});

	const card = (project: Project, index: number, layout: "card" | "row") => (
		<ProjectCard
			key={project.slug}
			project={project}
			index={index}
			shown={index === shown}
			dim={dimOthers}
			layout={layout}
			onPick={pick}
			{...tileProps(index)}
		/>
	);

	return (
		<main
			ref={page}
			className="page-grid items-start gap-y-8 pt-32 pb-24 md:gap-y-12"
		>
			<header
				data-pick-fade
				className="col-span-full space-y-6 border-rule border-b pb-4"
			>
				<h1 data-entrance-title className="text-display-xl">
					projects
				</h1>
				<div
					data-entrance
					className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between"
				>
					<p className="max-w-xl py-3">
						apps, games, experiments, including random stuff made with different
						programming languages.
					</p>
					<p className="type-index shrink-0">{projects.length} projects</p>
				</div>
			</header>

			{projects.length === 0 ? (
				<p data-entrance className="col-span-full text-muted-foreground">
					Nothing published yet.
				</p>
			) : (
				<>
					{/* Phones: the navbar has no background of its own, so this fills the
					    space behind it and the tiles scroll under the strip, not the bar. */}
					<div
						aria-hidden
						className="fixed inset-x-0 top-0 z-10 h-(--navbar-height) bg-background md:hidden"
					/>

					{/* Sticky beside the grid from md; a strip under the navbar on phones. */}
					<aside
						ref={panel}
						data-entrance
						aria-label="Selected project"
						className="sticky top-(--navbar-height) z-10 col-span-full -mx-4 border-rule border-b bg-background px-4 pt-3 pb-4 md:col-span-5 md:mx-0 md:border-0 md:p-0"
					>
						<div className="grid">
							{projects.map((project, index) => (
								<ProjectPreview
									key={project.slug}
									project={project}
									index={index}
									total={projects.length}
									shown={index === shown}
									onPick={pick}
									isFeatured={featured.includes(project.slug)}
								/>
							))}
						</div>
					</aside>

					<div
						ref={list}
						className="col-span-full md:col-span-7 md:col-start-6"
						{...listProps}
					>
						{featured.length > 0 && (
							<section aria-labelledby="projects-featured">
								<ListLabel id="projects-featured" label="featured">
									01 — {padIndex(featured.length)}
								</ListLabel>
								<ul className="grid grid-cols-1 gap-x-4 gap-y-6 pt-4 md:grid-cols-2 lg:grid-cols-3">
									{featuredProjects.map((project, i) =>
										card(project, i, "card"),
									)}
								</ul>
							</section>
						)}
						{rest.length > 0 && (
							<section
								aria-labelledby="projects-rest"
								className={featured.length > 0 ? "mt-12" : undefined}
							>
								<ListLabel id="projects-rest" label="everything else">
									{padIndex(rest.length)}
								</ListLabel>
								<ul className="grid grid-cols-1 gap-x-4 md:grid-cols-2 md:gap-y-6 md:pt-4 lg:grid-cols-3">
									{rest.map((project, i) =>
										card(project, featured.length + i, "row"),
									)}
								</ul>
							</section>
						)}
					</div>
				</>
			)}
		</main>
	);
}

interface ListLabelProps {
	id: string;
	label: string;
	children: ReactNode;
}

/** A list's heading row: its name on the left, its count on the right. */
function ListLabel({ id, label, children }: ListLabelProps) {
	return (
		<div
			data-pick-fade
			data-entrance
			className="type-label flex items-baseline justify-between gap-4 border-rule border-b pb-3"
		>
			<h2 id={id} className="type-label">
				{label}
			</h2>
			<p>{children}</p>
		</div>
	);
}
