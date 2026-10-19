import { ArrowLeftIcon } from "@phosphor-icons/react/ssr";
import { Link, useRouter } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Button } from "#/components/ui/button";
import {
	Progress,
	ProgressLabel,
	ProgressValue,
} from "#/components/ui/progress";
import { usePageEntrance } from "#/features/public/hooks/usePageEntrance";
import { usePickTransition } from "#/features/public/hooks/usePickTransition";
import type { SkillPageData } from "../skills.types";
import { filterProjectsByTool, splitPicked } from "../skills.utils";
import SkillProjectList from "./SkillProjectList";
import ToolFilter from "./ToolFilter";

interface SkillPageProps {
	page: SkillPageData;
}

/**
 * /skills/<slug>: the skill name in caps with its confidence beside it,
 * the tools on the left as a single-select filter, and the description with
 * the matching projects on the right.
 */
export default function SkillPage({ page }: SkillPageProps) {
	// null shows every project. The route keys this component by slug, so the
	// selection starts over on another skill.
	const [selected, setSelected] = useState<string | null>(null);
	const projects = filterProjectsByTool(page.projects, selected);

	const root = useRef<HTMLElement>(null);
	const router = useRouter();
	// Slug of the project being picked.
	const [picking, setPicking] = useState<string | null>(null);

	// The same entrance as /projects: the title rises, then the rest fades up.
	usePageEntrance(root);

	// The same pick as /projects: everything else fades, the ink wash crosses the
	// picked card's title, then the project page opens.
	usePickTransition({
		scope: root,
		picking,
		getTargets: (slug, q) => {
			const { picked, rest } = splitPicked(q("li[data-project]"), slug);
			const title = picked?.querySelector<HTMLElement>("[data-pick-title]");
			const wash = title?.querySelector("[data-pick-wash]");
			if (!title || !wash) return null;
			return { others: [...rest, ...q("[data-pick-fade]")], wash, title };
		},
		navigate: (slug) =>
			router.navigate({ to: "/projects/$slug", params: { slug } }),
		onCancel: () => setPicking(null),
	});

	return (
		<main ref={root} className="page-grid items-start pt-32 pb-24">
			<div
				data-pick-fade
				data-entrance
				className="col-span-full flex items-center justify-between gap-4"
			>
				<Button
					nativeButton={false}
					variant="outline-rule"
					size="page-compact"
					render={
						<Link to="/skills">
							<ArrowLeftIcon aria-hidden />
							All tools
						</Link>
					}
				/>
				{page.isTop && (
					<p className="type-label bg-primary px-1.5 py-1 text-primary-foreground">
						top tool
					</p>
				)}
			</div>

			<div
				data-pick-fade
				className="col-span-full mt-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-8"
			>
				<h1 data-entrance-title className="min-w-0 text-display-l uppercase">
					{page.name}
				</h1>
				<Progress
					data-entrance
					value={page.confidence}
					className="w-full shrink-0 md:w-56"
				>
					<ProgressLabel className="sr-only">Confidence</ProgressLabel>
					<ProgressValue variant="meta">
						{(formattedValue) => `${formattedValue} confidence`}
					</ProgressValue>
				</Progress>
			</div>

			<ToolFilter
				tools={page.tools}
				selected={selected}
				onSelect={setSelected}
			/>

			<div className="col-span-full mt-10 flex flex-col gap-12 md:col-span-7 md:col-start-6">
				{/* The Markdown overview, already HTML from Velite. It comes only from
				    the repository's content files, so injecting it is safe. */}
				<div
					data-pick-fade
					data-entrance
					className="text-lead [&_a]:underline [&_a]:underline-offset-2 [&_p+p]:mt-3"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: trusted content from the repository, rendered by Velite
					dangerouslySetInnerHTML={{ __html: page.overview }}
				/>

				<SkillProjectList
					projects={projects}
					selected={selected}
					skillName={page.name}
					onReset={() => setSelected(null)}
					onPick={setPicking}
				/>
			</div>
		</main>
	);
}
