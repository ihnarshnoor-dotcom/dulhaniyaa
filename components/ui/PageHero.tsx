import { Container } from "./Container";

/** Simple title block at the top of inner pages. */
export function PageHero({
  title,
  subtitle,
  padding = "pt-16 pb-12 sm:pt-24 sm:pb-16",
}: {
  title: string;
  subtitle?: string;
  /** Replaces the default vertical padding classes. */
  padding?: string;
}) {
  return (
    <section className={padding}>
      <Container className="text-center">
        <h1 className="hero-fade mx-auto max-w-3xl text-5xl leading-[1.05] sm:text-6xl">{title}</h1>
        {subtitle && (
          <p className="hero-fade mx-auto mt-5 max-w-md leading-relaxed text-muted [animation-delay:150ms]">
            {subtitle}
          </p>
        )}
      </Container>
    </section>
  );
}
