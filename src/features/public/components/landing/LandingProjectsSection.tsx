import { CaretRightIcon } from "@phosphor-icons/react/dist/ssr";
import { Link } from "@tanstack/react-router";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, useState } from "react";
import { Button } from "#/components/ui/button";
import type { ProjectWithCoverImageUrl } from "#/features/projects/projects.types";
import { getPresentationState } from "#/features/public/utils/presentation";
import { appGSAP, useAppGSAP } from "#/integrations/animations/gsap";
import LandingProjectCard from "./LandingProjectCard";

interface LandingProjectsSectionProps {
	projects: ProjectWithCoverImageUrl[];
}

const mockProject = (
	project: Pick<
		ProjectWithCoverImageUrl,
		"id" | "slug" | "title" | "description"
	> &
		Partial<ProjectWithCoverImageUrl>,
): ProjectWithCoverImageUrl => ({
	coverImageKey: null,
	coverImageUrl: null,
	createdAt: "2026-01-01T00:00:00.000Z",
	endedAt: null,
	featuredRank: null,
	githubUrl: null,
	liveUrl: null,
	metadata: {},
	published: true,
	startedAt: null,
	status: "COMPLETED",
	teamName: null,
	updatedAt: "2026-01-01T00:00:00.000Z",
	...project,
});

// Hardcoded while the card is built; render the `projects` prop again after.
const MOCK_PROJECTS: ProjectWithCoverImageUrl[] = [
	mockProject({
		id: "00000000-0000-4000-8000-000000000001",
		slug: "taskflow",
		title: "Taskflow",
		description:
			"A kanban board with real-time sync, keyboard-first navigation, and offline support.",
		status: "ONGOING",
		featuredRank: 1,
		startedAt: "2026-03-01",
		githubUrl: "https://github.com/example/taskflow",
		liveUrl: "https://taskflow.example.com",
	}),
	mockProject({
		id: "00000000-0000-4000-8000-000000000002",
		slug: "trailnotes",
		title: "Trailnotes",
		description:
			"A hiking journal that maps routes, logs conditions, and exports GPX files.",
		featuredRank: 2,
		startedAt: "2025-06-01",
		endedAt: "2025-11-15",
		githubUrl: "https://github.com/example/trailnotes",
	}),
	mockProject({
		id: "00000000-0000-4000-8000-000000000003",
		slug: "scaffold-cli",
		title: "Scaffold CLI",
		description:
			"A command line tool that generates project boilerplate and wires up the config files.",
		featuredRank: 3,
		teamName: "Dev Tools Club",
		startedAt: "2024-09-01",
		endedAt: "2025-01-20",
		githubUrl: "https://github.com/example/scaffold-cli",
	}),
];

export default function LandingProjectsSection(
	_props: LandingProjectsSectionProps,
) {
	// TODO: read `props.projects` instead of the mocks after the card is built
	const items = MOCK_PROJECTS;
	const [active, setActive] = useState(0);
	const lastActive = useRef(0);
	const track = useRef(null);
	const bar = useRef(null);

	useAppGSAP(
		() => {
			ScrollTrigger.create({
				trigger: track.current,
				start: "top top",
				end: "bottom bottom",
				onUpdate: (self) => {
					const next = getPresentationState(self.progress, items.length);

					if (next.active !== lastActive.current) {
						lastActive.current = next.active;
						setActive(next.active);
					}
					appGSAP.set(bar.current, { "--bar": next.barProgress });
				},
			});
		},
		{
			scope: track,
			dependencies: [items.length],
		},
	);
	return (
		<section aria-labelledby="landing-projects-title page-grid grid-cols-subgrid gap-y-6 py-32 pt-10 md:pt-20">
			<h1
				id="landing-projects-title"
				className="cols-span-full px-4 text-center"
			>
				My top projects
			</h1>
			<div
				className="relative"
				ref={track}
				style={{
					height: `${(items.length + 0.5) * 100}svh`,
				}}
			>
				<div className="page-grid sticky top-0 h-svh grid-rows-[auto_auto_minmax(0,1fr)] gap-y-6 overflow-hidden py-32 pb-10">
					<div
						role="progressbar"
						aria-label="Progress through this project"
						className="col-span-full h-0.5 w-1/3 md:absolute md:top-1/2 md:right-6 md:h-[33svh] md:w-0.5 md:-translate-y-1/2"
					>
						<span className="block size-full bg-border">
							<span
								ref={bar}
								className="block size-full origin-top-left scale-x-(--bar) bg-foreground md:scale-x-100 md:scale-y-(--bar)"
							/>
						</span>
					</div>
					{items.map((project, i) => (
						<LandingProjectCard
							key={project.id}
							project={project}
							active={i === active}
						/>
					))}
				</div>
			</div>
			<Button
				nativeButton={false}
				render={
					<Link
						to={"/projects"}
						className="col-start-9 row-start-3 flex w-min items-center gap-1 px-2 py-1 pt-10"
					>
						<span>
							<CaretRightIcon />
						</span>
						<span className="text-xl">More here</span>
					</Link>
				}
				variant={"link"}
			/>
		</section>
	);
}
