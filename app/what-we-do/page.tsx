import { permanentRedirect } from "next/navigation";

// What We Do is now the home page. Old links and search results land there.
export default function WhatWeDoPage() {
  permanentRedirect("/");
}
