import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primary-dark",
  secondary: "bg-secondary text-primary hover:bg-secondary-dark",
};

export function buttonClasses(variant: Variant = "primary", className = "") {
  return `inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-medium tracking-wide transition-colors duration-200 ${variants[variant]} ${className}`;
}

type Props = {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
};

/** Link styled as a button. External links (http, wa.me, tel:) open correctly. */
export function Button({ href, children, variant = "primary", className = "" }: Props) {
  const classes = buttonClasses(variant, className);

  if (href.startsWith("http")) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
      </a>
    );
  }
  if (href.startsWith("tel:") || href.startsWith("mailto:")) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
