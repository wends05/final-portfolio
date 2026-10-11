// Custom GSAP eases, registered in gsap.ts. The swiss ease also lives in CSS as
// --ease-swiss in src/styles/portfolio.css; eases.test.ts keeps the two equal.
export const EASES = {
	swiss: "0.2,0,0,1",
	curtain: "0.76,0,0.24,1",
} as const;
