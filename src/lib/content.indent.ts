// Content Markdown is indented with spaces. Tabs in the leading whitespace of a
// line are turned into spaces before Velite reads the file, so both the build
// and `dev` see the same text whatever the editor inserted.

const TAB_WIDTH = 2;

/**
 * Replaces tabs in each line's leading whitespace with spaces, using tab stops
 * every `TAB_WIDTH` columns. Tabs after the first non-space character are kept.
 */
export function tabsToSpaces(text: string): string {
	return text
		.split("\n")
		.map((line) => {
			const indent = line.match(/^[ \t]*/)?.[0] ?? "";
			if (!indent.includes("\t")) return line;
			let column = 0;
			for (const char of indent) {
				column += char === "\t" ? TAB_WIDTH - (column % TAB_WIDTH) : 1;
			}
			return " ".repeat(column) + line.slice(indent.length);
		})
		.join("\n");
}
