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
import type { SkillCategoryPageData } from "../skills.types";
import { filterProjectsBySkill, splitPicked } from "../skills.utils";
import SkillCategoryProjectList from "./SkillCategoryProjectList";
import SkillFilter from "./SkillFilter";

interface SkillCategoryPageProps {
	page: SkillCategoryPageData;
}

/**
 * /skills/<slug>: the category name in caps with its confidence beside it,
 * the skills on the left as a single-select filter, and the description with
 * the matching projects on the right.
 */
export default function SkillCategoryPage({ page }: SkillCategoryPageProps) {
	// null shows every project. The route keys this component by slug, so the
	// selection starts over on another category.
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const projects = filterProjectsBySkill(page.projects, selectedId);
	const selected = page.skills.find((skill) => skill.id === selectedId);

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
			router.navigate({ to: "/projects/$", params: { _splat: slug } }),
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
					variant="outline"
					className="type-label h-11 gap-2 rounded-none border-rule px-4 hover:bg-primary hover:text-primary-foreground max-md:px-3"
					render={
						<Link to="/skills">
							<ArrowLeftIcon aria-hidden />
							All skills
						</Link>
					}
				/>
				{page.topRank !== null && (
					<p className="type-label bg-primary px-1.5 py-1 text-primary-foreground">
						top skill
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
				{page.confidence !== null && (
					<Progress
						data-entrance
						value={page.confidence}
						className="w-full shrink-0 md:w-56"
					>
						<ProgressLabel className="sr-only">Confidence</ProgressLabel>
						{/* ProgressValue's own text-xs wins over type-meta's size, so
						    restate type-meta's 13px from md. */}
						<ProgressValue className="type-meta text-muted-foreground md:text-[0.8125rem]">
							{(formattedValue) => `${formattedValue} confidence`}
						</ProgressValue>
					</Progress>
				)}
			</div>

			<SkillFilter
				skills={page.skills}
				selectedId={selectedId}
				onSelect={setSelectedId}
			/>

			<div className="col-span-full mt-10 flex flex-col gap-12 md:col-span-7 md:col-start-6">
				{page.overview && (
					<p data-pick-fade data-entrance className="text-lead">
						{page.overview}
					</p>
				)}

				<SkillCategoryProjectList
					projects={projects}
					selected={selected}
					categoryName={page.name}
					onReset={() => setSelectedId(null)}
					onPick={setPicking}
				/>
			</div>
		</main>
	);
}
