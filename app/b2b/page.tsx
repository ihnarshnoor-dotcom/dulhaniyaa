import { permanentRedirect } from "next/navigation";

// The B2B overview now lives on the vendors page. Old links land there.
export default function B2BPage() {
  permanentRedirect("/vendors");
}
