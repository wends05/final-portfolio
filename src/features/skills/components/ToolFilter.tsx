import type { Tool } from "#content";

interface ToolFilterProps {
	tools: Tool[];
	/** The selected tool's name, or null for all of them. */
	selected: Tool | null;
	onSelect: (tool: Tool | null) => void;
}

/**
 * A skill page's single-select tool filter: "All tools", then every
 * tool under the skill. Pressing the selected tool again goes
 * back to all.
 */
export default function ToolFilter({
	tools,
	selected,
	onSelect,
}: ToolFilterProps) {
	return (
		<fieldset
			data-pick-fade
			data-entrance
			className="col-span-full m-0 mt-10 flex min-w-0 flex-wrap items-start gap-x-4 gap-y-1 border-0 p-0 md:sticky md:top-32 md:col-span-4 md:flex-col md:gap-0.5"
		>
			<legend className="sr-only">Filter projects by tool</legend>
			<ToolFilterButton
				label="All tools"
				pressed={selected === null}
				onPress={() => onSelect(null)}
			/>
			{tools.map((tool) => (
				<ToolFilterButton
					key={tool}
					label={tool}
					pressed={selected === tool}
					onPress={() => onSelect(selected === tool ? null : tool)}
				/>
			))}
		</fieldset>
	);
}

interface ToolFilterButtonProps {
	label: string;
	pressed: boolean;
	onPress: () => void;
}

function ToolFilterButton({ label, pressed, onPress }: ToolFilterButtonProps) {
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
