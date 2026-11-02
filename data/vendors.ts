/**
 * ─────────────────────────────────────────────────────────────
 *  VENDOR PAGES (/vendors and /vendors/<service>)
 *
 *  These pages are for wedding businesses that want to partner
 *  with Dulhaniyaa. Each service page shows the kind of work we
 *  do in that service and what we look for in partners.
 *
 *  REPLACE the wording with real highlights (numbers, venues,
 *  standout weddings) whenever you have them. The keys must
 *  match the slugs in `b2b.services` (data/site.ts).
 * ─────────────────────────────────────────────────────────────
 */

import baaratOnWheels from "@/app/assets/baarat-on-wheels.webp";
import bandBajaDholHigh1 from "@/app/assets/band-baja-dhol-high-1.webp";
import bandBajaDholHigh2 from "@/app/assets/band-baja-dhol-high-2.webp";
import cake from "@/app/assets/cake.webp";
import carnivalHaldiTheme from "@/app/assets/carnival-haldi-theme.webp";
import catererMid3 from "@/app/assets/caterer-mid-3.webp";
import couplePhotographyMid7 from "@/app/assets/couple-photography-mid-7.webp";
import decor from "@/app/assets/decor.webp";
import decorHaldiMid5 from "@/app/assets/decor-haldi-mid-5.webp";
import decorHigh1 from "@/app/assets/decor-high-1.webp";
import decorHigh2 from "@/app/assets/decor-high-2.webp";
import decorHigh3 from "@/app/assets/decor-high-3.webp";
import decorMid4 from "@/app/assets/decor-mid-4.webp";
import decorMid5 from "@/app/assets/decor-mid-5.webp";
import haldiMid3 from "@/app/assets/haldi-mid-3.webp";
import makeupPhotographyMid4 from "@/app/assets/makeup-photography-mid-4.webp";
import mandapDecorMid5 from "@/app/assets/mandap-decor-mid-5.webp";
import mehendiMid4 from "@/app/assets/mehendi-mid-4.webp";
import photographyLow6 from "@/app/assets/photography-low-6.webp";
import photographyMakeupHigh2 from "@/app/assets/photography-makeup-high-2.webp";
import photographyMid5 from "@/app/assets/photography-mid-5.webp";
import photographyVenueHigh2 from "@/app/assets/photography-venue-high-2.webp";
import receptionDecorMid7 from "@/app/assets/reception-decor-mid-7.webp";
import sangriaBar from "@/app/assets/sangria-bar.webp";
import venuePhotographyHigh1 from "@/app/assets/venue-photography-high-1.webp";
import venuePhotographyHigh3 from "@/app/assets/venue-photography-high-3.webp";
import venuePhotographyMid from "@/app/assets/venue-photography-mid.webp";
import vintageCar from "@/app/assets/vintage-car.webp";
import vintageCarHigh1 from "@/app/assets/vintage-car-high-1.webp";
import vintageCarHigh2 from "@/app/assets/vintage-car-high-2.webp";
import weddingFavoursLow1 from "@/app/assets/wedding-favours-low-1.webp";
import weddingFavoursLow2 from "@/app/assets/wedding-favours-low-2.webp";
import { photo, type Photo } from "./site";

export type VendorPage = {
  /** What Dulhaniyaa does in this service, one point per line. */
  work: string[];
  gallery: Photo[];
  /** What we look for in partners for this service. */
  lookingFor: string[];
};

// Asked of every partner, whatever the service.
export const partnerBasics = [
  "Based in, or regularly working across, Delhi NCR",
  "A portfolio of recent weddings we can see",
  "Clear pricing and on-time delivery",
];

const p = {
  cake: photo(cake, "Tiered white wedding cake framed by glowing arches and flowers"),
  carnivalHaldiTheme: photo(carnivalHaldiTheme, "Carnival-style haldi entrance of gold and pink heart arches over a striped aisle"),
  decor: photo(decor, "Gold stage with a flower-crowned sculpted face, golden deer and lanterns"),
  sangriaBar: photo(sangriaBar, "Sangria bar with a floral-print counter set up on a garden lawn"),
  vintageCar: photo(vintageCar, "Groom and his brother in a flower-decked red vintage convertible"),
  baaratOnWheels: photo(baaratOnWheels, "Guests dancing to the dhol beside a lit-up Baraat on Wheels bus at night"),
  bandBajaDholHigh1: photo(bandBajaDholHigh1, "Friends playing the dhol and dancing around the bride"),
  bandBajaDholHigh2: photo(bandBajaDholHigh2, "Dhol players in maroon kurtas under a marigold canopy"),
  catererMid3: photo(catererMid3, "Chefs serving at a buffet laid out in a palace courtyard"),
  couplePhotographyMid7: photo(couplePhotographyMid7, "Couple posing between carved maroon arches and lanterns"),
  decorHaldiMid5: photo(decorHaldiMid5, "Couple seated in brass tubs at a haldi ceremony with tropical floral décor"),
  decorHigh1: photo(decorHigh1, "Carved wooden arches with white drapes, florals and brass lamps"),
  decorHigh2: photo(decorHigh2, "White wedding hall with a floral aisle leading to a flower arch"),
  decorHigh3: photo(decorHigh3, "Outdoor lounge with sofas under draped arches and floral columns"),
  decorMid4: photo(decorMid4, "Maroon and gold wedding stage with arched drapes and red florals"),
  decorMid5: photo(decorMid5, "Night-time aisle lined with flowers under hanging chandeliers"),
  haldiMid3: photo(haldiMid3, "Family in yellow dancing and cheering at the haldi"),
  makeupPhotographyMid4: photo(makeupPhotographyMid4, "Bride in a red lehenga and kundan jewellery posing beside roses"),
  mandapDecorMid5: photo(mandapDecorMid5, "Bride and groom exchanging varmalas under a floral mandap in a palace courtyard"),
  mehendiMid4: photo(mehendiMid4, "Mehendi artist applying an intricate bridal design to the bride's hand"),
  photographyLow6: photo(photographyLow6, "Bride in a peach lehenga seated among white flowers"),
  photographyMakeupHigh2: photo(photographyMakeupHigh2, "Smiling bride in a red dupatta and gold jewellery in warm light"),
  photographyMid5: photo(photographyMid5, "Couple and family walking along a palace corridor"),
  photographyVenueHigh2: photo(photographyVenueHigh2, "Bride and groom under a floral mandap with a lake behind them"),
  receptionDecorMid7: photo(receptionDecorMid7, "Reception hall with chandeliers, candlelit tables and a bar"),
  venuePhotographyHigh1: photo(venuePhotographyHigh1, "Bride in a maroon lehenga holding a bouquet on palace steps"),
  venuePhotographyHigh3: photo(venuePhotographyHigh3, "Bride and groom in a palace courtyard beside a reflecting pool"),
  venuePhotographyMid: photo(venuePhotographyMid, "Bride and groom between carved pillars in a palace courtyard"),
  vintageCarHigh1: photo(vintageCarHigh1, "Baraat walking beside a vintage maroon car by the lake"),
  vintageCarHigh2: photo(vintageCarHigh2, "Flower-decked white vintage car with a chauffeur outside a palace"),
  weddingFavoursLow1: photo(weddingFavoursLow1, "Table of pastel favour boxes laid out on a lawn"),
  weddingFavoursLow2: photo(weddingFavoursLow2, "Illustrated wedding cards and tags tied with ribbon"),
};

export const vendorPages: Record<string, VendorPage> = {
  makeup: {
    work: [
      "Bridal looks from traditional red-and-gold to soft and natural",
      "Party makeup for the family on the big day",
      "Touch-ups through rituals, photos and the reception",
    ],
    gallery: [p.makeupPhotographyMid4, p.photographyMakeupHigh2, p.photographyLow6, p.venuePhotographyHigh1],
    lookingFor: ["A portfolio of bridal looks", "Artists available for early-morning starts"],
  },
  decor: {
    work: [
      "Marigold and floral haldi setups, from courtyards to rooftops",
      "Mandaps, stages and photo corners for every function",
      "Evening lighting with lanterns, fairy lights and statement backdrops",
    ],
    gallery: [p.decorHigh2, p.decor, p.carnivalHaldiTheme, p.decorHigh1, p.decorHigh3, p.decorMid4, p.decorMid5],
    lookingFor: ["In-house florals and fabrication", "A team that can set up and strike on tight timelines"],
  },
  "liquor-bar": {
    work: [
      "Bars for cocktail nights, sangeets and receptions",
      "Signature drinks and mocktail menus for every guest",
      "Lounge and hookah corners planned around venue rules",
    ],
    gallery: [p.sangriaBar, p.receptionDecorMid7, p.decorMid5],
    lookingFor: ["Experienced bartenders and trained attendants", "Help with event liquor licences"],
  },
  photography: {
    work: [
      "Candid and traditional coverage across every function",
      "Bridal and groom portraits, getting-ready details included",
      "Pre-wedding shoots and cinematic wedding films",
    ],
    gallery: [p.couplePhotographyMid7, p.photographyMid5, p.photographyMakeupHigh2, p.photographyVenueHigh2, p.venuePhotographyHigh1],
    lookingFor: ["A consistent editing style", "Delivery timelines for photos and films agreed up front"],
  },
  "security-valet": {
    work: [
      "Security staff for the venue and gift table",
      "Valet parking for guests at every function",
    ],
    gallery: [p.vintageCarHigh2, p.venuePhotographyMid, p.venuePhotographyHigh3],
    lookingFor: ["Trained, uniformed staff", "Insurance and background-checked teams"],
  },
};
