/** Scroll distance in px past which the navbar stops being transparent. */
export const NAVBAR_SOLID_SCROLL = 8;

/** The page has scrolled far enough that content would show through a transparent bar. */
export function isNavbarSolid(scrollY: number) {
	return scrollY > NAVBAR_SOLID_SCROLL;
}
