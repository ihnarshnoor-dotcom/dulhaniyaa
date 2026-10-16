import Link from "next/link";
import { business } from "@/data/site";

/**
 * Text logo. REPLACE with your real logo when ready, e.g.
 * <Image src="/images/logo.svg" alt="Dulhaniyaa" width={160} height={40} />
 */
export function Logo({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      href="/"
      onNavigate={onNavigate}
      className="font-serif text-3xl font-medium tracking-wide text-primary"
    >
      {business.name}
    </Link>
  );
}
