import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Custom --text-* sizes from src/styles/portfolio.css; without them
// tailwind-merge reads `text-display-l` as a color and drops one of the pair.
const twMerge = extendTailwindMerge({
	extend: {
		classGroups: {
			"font-size": [
				{
					text: [
						"display-xl",
						"display-l",
						"display-m",
						"heading-l",
						"heading-m",
						"heading-s",
						"lead",
						"body",
						"body-s",
					],
				},
			],
		},
	},
});

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
