import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="flex min-h-[70svh] items-center py-16 text-center">
      <Container>
        <p className="font-serif text-7xl text-primary">404</p>
        <h1 className="mt-4 text-4xl sm:text-5xl">This page has wandered off</h1>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Button href="/">Back to home</Button>
          <Button href="/contact" variant="secondary">
            Get a Quote
          </Button>
        </div>
      </Container>
    </section>
  );
}
