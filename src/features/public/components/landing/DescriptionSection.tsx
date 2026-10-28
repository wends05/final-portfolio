import { ABOUT_PARAGRAPHS } from "#/features/public/utils/about";
import PinnedText from "./PinnedText";

export default function DescriptionSection() {
	return (
		<PinnedText
			paragraphs={ABOUT_PARAGRAPHS}
			paragraphClassName="indent-span-4 md:col-start-5 md:indent-span-8"
		/>
	);
}
