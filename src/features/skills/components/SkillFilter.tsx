import type { SkillPreview } from "../skills.types";

interface SkillFilterProps {
	skills: SkillPreview[];
	/** The selected skill, or null for all of them. */
	selectedId: string | null;
	onSelect: (skillId: string | null) => void;
}

/**
 * The skill category page's single-select filter: "All tools", then every
 * skill in the category. Pressing the selected skill again goes
 * back to all.
 */
export default function SkillFilter({
	skills,
	selectedId,
	onSelect,
}: SkillFilterProps) {
	return (
		<fieldset
			data-pick-fade
			data-entrance
			className="col-span-full m-0 mt-10 flex min-w-0 flex-wrap items-start gap-x-4 gap-y-1 border-0 p-0 md:sticky md:top-32 md:col-span-4 md:flex-col md:gap-0.5"
		>
			<legend className="sr-only">Filter projects by skill</legend>
			<SkillFilterButton
				label="All tools"
				pressed={selectedId === null}
				onPress={() => onSelect(null)}
			/>
			{skills.map((skill) => (
				<SkillFilterButton
					key={skill.id}
					label={skill.name}
					pressed={selectedId === skill.id}
					onPress={() => onSelect(selectedId === skill.id ? null : skill.id)}
				/>
			))}
		</fieldset>
	);
}

interface SkillFilterButtonProps {
	label: string;
	pressed: boolean;
	onPress: () => void;
}

function SkillFilterButton({
	label,
	pressed,
	onPress,
}: SkillFilterButtonProps) {
	return (
		<button
			type="button"
			aria-pressed={pressed}
			onClick={onPress}
			className="focus-ring origin-left text-left font-light text-heading-m transition-[scale] duration-150 ease-swiss active:scale-98 aria-pressed:font-bold md:text-heading-l"
		>
			{label}
		</button>
	);
}
