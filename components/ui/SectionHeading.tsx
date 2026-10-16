export function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mx-auto mb-12 max-w-xl text-center sm:mb-16">
      <h2 className="text-4xl leading-tight sm:text-5xl">{title}</h2>
      {subtitle && <p className="mt-4 leading-relaxed text-muted">{subtitle}</p>}
    </div>
  );
}
