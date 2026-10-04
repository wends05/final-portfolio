import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(useGSAP, CustomEase);
// Same curve as --ease-swiss in src/styles/portfolio.css

// include all of the needed plugins in here.
CustomEase.create("swiss", "0.2,0,0,1");

export { gsap, useGSAP };
