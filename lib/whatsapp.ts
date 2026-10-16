import { business } from "@/data/site";

const defaultWhatsAppMessage =
  "Hi Dulhaniyaa! I'm planning a wedding and would love to know more about your services.";

/** Builds a wa.me link that opens WhatsApp with a prefilled message. */
export function whatsappLink(message: string = defaultWhatsAppMessage) {
  return `https://wa.me/${business.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
