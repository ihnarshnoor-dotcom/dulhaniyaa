import { testimonial } from "@/data/site";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

/** A single client quote. */
export function Testimonials() {
  return (
    <section className="border-t border-ink/10 py-24 sm:py-32">
      <Container>
        <Reveal>
          <figure className="mx-auto max-w-2xl text-center">
            <blockquote className="font-serif text-3xl leading-snug italic sm:text-4xl">
              “{testimonial.quote}”
            </blockquote>
            <figcaption className="mt-8 text-sm tracking-wide text-muted">{testimonial.couple}</figcaption>
          </figure>
        </Reveal>
      </Container>
    </section>
  );
}
