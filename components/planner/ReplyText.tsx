import type { ReactNode } from "react";

/** **bold** → <strong>. Everything else stays plain text (no HTML is ever injected). */
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") && part.length > 4 ? <strong key={i}>{part.slice(2, -2)}</strong> : part,
  );
}

const bullet = /^\s*(?:[-•*]|\d+[.)])\s+/;

/** Renders an AI reply: blank lines split paragraphs, "- " / "1. " lines become lists. */
export function ReplyText({ text }: { text: string }) {
  const blocks = text.trim().split(/\n\s*\n/);
  return (
    <div className="space-y-3">
      {blocks.map((block, b) => {
        const lines = block.split("\n").filter((l) => l.trim());
        if (lines.length > 0 && lines.every((l) => bullet.test(l))) {
          return (
            <ul key={b} className="list-disc space-y-1 pl-5 marker:text-primary/60">
              {lines.map((l, i) => (
                <li key={i}>{inline(l.replace(bullet, ""))}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={b} className="whitespace-pre-line">
            {inline(lines.join("\n"))}
          </p>
        );
      })}
    </div>
  );
}
