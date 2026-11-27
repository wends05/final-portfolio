import { createContext } from "react";

/**
 * True inside a layout that draws the page's `<main>` itself (the agent
 * view). A page that can render there, such as the error page, checks it so
 * the document never has a second, nested `<main>`.
 */
export const InsideMainContext = createContext(false);
