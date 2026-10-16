import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { whatsappLink } from "@/lib/whatsapp";

/** Final call-to-action. Used at the bottom of most pages. */
export function CtaBanner({
  title = "Let's plan your wedding",
  text = "Tell us your date. We'll call you back within 24 hours.",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <section className="border-t border-ink/10 py-24 sm:py-32">
      <Container className="text-center">
        <h2 className="text-4xl leading-tight sm:text-5xl">{title}</h2>
        <p className="mx-auto mt-4 max-w-md leading-relaxed text-muted">{text}</p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Button href="/contact">Get a Quote</Button>
          <Button href={whatsappLink()} variant="secondary">
            Chat on WhatsApp
          </Button>
        </div>
      </Container>
    </section>
  );
}
