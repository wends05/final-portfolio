import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import ScrollTrigger from "gsap/ScrollTrigger";
import SplitText from "gsap/SplitText";
import { EASES } from "./eases";

// register the plugins here
gsap.registerPlugin(useGSAP, CustomEase, ScrollTrigger, SplitText);
// include all of the needed plugin configurations here
for (const [name, points] of Object.entries(EASES)) {
	CustomEase.create(name, points);
}

export const appGSAP = gsap;
export const useAppGSAP = useGSAP;
