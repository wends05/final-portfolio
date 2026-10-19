import { CaretRightIcon } from "@phosphor-icons/react/dist/ssr";
import { Link } from "@tanstack/react-router";
import { Progress, ProgressValue } from "#/components/ui/progress";
import WashText from "#/features/public/components/landing/WashText";
import { isPlainClick } from "#/features/public/utils/pick";
import { splitVisibleTools } from "#/lib/tools";
import type { SkillOverview } from "../skills.types";

interface SkillItemProps {
	skill: SkillOverview;
	active: boolean;
	onActivate: () => void;
	/** Starts the pick transition; the page navigates when it ends. */
	onPick: (slug: string) => void;
}

export default function SkillItem({
	skill,
	active,
	onActivate,
	onPick,
}: SkillItemProps) {
	const { visible, hidden } = splitVisibleTools(skill.tools, 3);

	const hideClassName =
		"motion-safe:group-data-[active=false]:opacity-0 transition-opacity ease-swiss duration-300";
	return (
		<li
			data-skill-item
			data-entrance
			className="group col-span-full md:col-span-8"
			data-slug={skill.slug}
			data-active={active}
		>
			<Link
				to="/skills/$slug"
				params={{ slug: skill.slug }}
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
					onPick(skill.slug);
				}}
			>
				<div className="flex w-full flex-col gap-4 pt-6">
					{/* SkillsPage waits ACTIVATE_BEFORE_PICK_MS for this fade to ink before a pick. */}
					<h2
						data-pick-title
						className="text-display-l transition-colors duration-500 motion-safe:group-data-[active=false]:text-muted-foreground/50"
					>
						<WashText>{skill.name}</WashText>
					</h2>
					<span data-pick-fade className={`type-index ${hideClassName}`}>
						{visible.join(" · ")}
						{hidden > 0 && <span> +{hidden}</span>}
					</span>
					<div data-pick-fade className={hideClassName}>
						<Progress value={skill.confidence}>
							<ProgressValue variant="meta" />
						</Progress>
					</div>
				</div>
				<span className="self-center">
					<CaretRightIcon />
				</span>
			</Link>
		</li>
	);
}
