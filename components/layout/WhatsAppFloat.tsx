import { WhatsAppIcon } from "@/components/ui/Icons";
import { whatsappLink } from "@/lib/whatsapp";

/** Floating WhatsApp button shown bottom-right on every page. */
export function WhatsAppFloat() {
  return (
    <a
      href={whatsappLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed right-4 bottom-4 z-30 grid size-12 place-items-center rounded-full bg-primary text-white transition-colors hover:bg-primary-dark sm:right-6 sm:bottom-6"
    >
      <WhatsAppIcon width={24} height={24} />
    </a>
  );
}
