// Every header nav item is a soft button level with the header; the selected one is raised (neumorphic
// outset shadows). All share one shape so selecting one doesn't shift its neighbours.
export const navPill = "rounded-xl px-4 py-2.5 transition-[color,box-shadow] duration-300";

export const navText = (active: boolean) => (active ? "text-ink" : "text-muted hover:text-ink");

export const navLinkClasses = (active: boolean) =>
  `${navPill} text-sm tracking-wide ${active ? "neu-raised" : ""} ${navText(active)}`;
