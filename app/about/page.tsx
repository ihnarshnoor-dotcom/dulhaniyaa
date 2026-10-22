import { permanentRedirect } from "next/navigation";

// The About Us page has been removed. Old links and search results land on the home page.
export default function AboutPage() {
  permanentRedirect("/");
}
