import PinnedText from "./PinnedText";

const paragraphs = [
	"Software Engineering revolves on continuous learning, adapting to newer technologies.",
	"My curiosity and interest on related topics to technologies would help me survive this course and reach my goals in this field.",
];

export default function EndSection() {
	return <PinnedText paragraphs={paragraphs} className="gap-y-13" />;
}
