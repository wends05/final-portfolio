import { CaretRightIcon } from "@phosphor-icons/react/dist/ssr";
import { Link } from "@tanstack/react-router";
import { Progress, ProgressValue } from "#/components/ui/progress";
import WashText from "#/features/public/components/landing/WashText";
import { isPlainClick } from "#/features/public/utils/pick";
import type { SkillsPageSkillCategory } from "../skills.types";
import { splitVisibleSkills } from "../skills.utils";

interface SkillCategoryItemProps {
	skillCategory: SkillsPageSkillCategory;
	active: boolean;
	onActivate: () => void;
	/** Starts the pick transition; the page navigates when it ends. */
	onPick: (slug: string) => void;
}

export default function SkillCategoryItem({
	skillCategory,
	active,
	onActivate,
	onPick,
}: SkillCategoryItemProps) {
	const { visible, hidden } = splitVisibleSkills(skillCategory.skills, 3);

	const hideClassName =
		"motion-safe:group-data-[active=false]:opacity-0 transition-opacity ease-swiss duration-300";
	return (
		<li
			data-skill-item
			className="group col-span-full md:col-span-8"
			data-slug={skillCategory.slug}
			data-active={active}
		>
			<Link
				to="/skills/$slug"
				params={{ slug: skillCategory.slug }}
				className="focus-ring flex h-full w-full items-start justify-between border-b"
				onFocus={(e) => {
					if (!e.currentTarget.matches(":focus-visible")) return;
					onActivate();
					// The browser only scrolls the item into view, which can leave a
					// neighbour on the middle line; centre it so its trigger agrees.
					e.currentTarget.scrollIntoView({ block: "center" });
				}}
				onClick={(e) => {
					if (!isPlainClick(e)) return;
					e.preventDefault();
					onPick(skillCategory.slug);
				}}
			>
				<div className="flex w-full flex-col gap-4 pt-6">
					{/* SkillsPage waits ACTIVATE_BEFORE_PICK_MS for this fade to ink before a pick. */}
					<h2
						data-pick-title
						className="text-display-l transition-colors duration-500 motion-safe:group-data-[active=false]:text-muted-foreground/50"
					>
						<WashText>{skillCategory.name}</WashText>
					</h2>
					<span data-pick-fade className={`type-index ${hideClassName}`}>
						{visible.map((s) => s.name).join(" · ")}
						{hidden > 0 && <span> +{hidden}</span>}
					</span>
					{skillCategory.confidence !== null && (
						<Progress
							data-pick-fade
							value={skillCategory.confidence}
							className={hideClassName}
						>
							<ProgressValue className="type-meta" />
						</Progress>
					)}
				</div>
				<span className="self-center">
					<CaretRightIcon />
				</span>
			</Link>
		</li>
	);
}
