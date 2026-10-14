import { createCn } from "cn/config";

// Custom --text-* sizes from src/styles/portfolio.css; without them
// the merger reads `text-display-l` as a color and drops one of the pair.
export const cn = createCn({
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
