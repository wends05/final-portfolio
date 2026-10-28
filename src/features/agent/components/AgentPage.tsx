import type { AgentCopy } from "../agent.types";
import AgentMarkdown from "./AgentMarkdown";

interface AgentPageProps {
	copy: AgentCopy;
	origin: string;
}

/** One agent view: the page's agent copy, rendered. */
export default function AgentPage({ copy, origin }: AgentPageProps) {
	return (
		<article>
			<AgentMarkdown markdown={copy.markdown} origin={origin} />
		</article>
	);
}
