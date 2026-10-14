import PinnedText from "./PinnedText";

const paragraphs = [
	"I am a software engineer based in the Philippines. I create web applications and games, and random stuff. I spend some of my free time exploring new stacks and tools.",
	"With high experience in scrum, and agentic development, I ensure that I create software with good quality while still being able to continually learn new things.",
];

export default function DescriptionSection() {
	return (
		<PinnedText
			paragraphs={paragraphs}
			paragraphClassName="indent-span-4 md:col-start-5 md:indent-span-8"
		/>
	);
}
