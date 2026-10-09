import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import ScrollTrigger from "gsap/ScrollTrigger";
import SplitText from "gsap/SplitText";

// register the plugins here
gsap.registerPlugin(useGSAP, CustomEase, ScrollTrigger, SplitText);
// include all of the needed plugin configurations here
CustomEase.create("swiss", "0.2,0,0,1");
CustomEase.create("curtain", "0.76,0,0.24,1");

export const appGSAP = gsap;
export const useAppGSAP = useGSAP;
