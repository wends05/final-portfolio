export interface PresentationState {
	active: number;
	barProgress: number;
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/**
 * Maps scroll progress through the pinned projects section to the project on
 * stage and how full its progress bar is.
 *
 * Every project gets an equal share of the pinned scroll, and the bar fills
 * across that share only, then starts again empty for the next project.
 *
 * @param progress ScrollTrigger progress over the section, 0 to 1.
 * @param count Number of projects on stage.
 */
export function getPresentationState(
	progress: number,
	count: number,
): PresentationState {
	if (count <= 0) return { active: 0, barProgress: 0 };

	// How many projects' worth of scroll has passed, from 0 to `count`.
	const position = clamp01(progress) * count;
	const active = Math.min(Math.floor(position), count - 1);

	return {
		active,
		barProgress: clamp01(position - active),
	};
}
