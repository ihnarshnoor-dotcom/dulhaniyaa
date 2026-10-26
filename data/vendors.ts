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
import catererMid3 from "@/app/assets/caterer-mid-3.webp";
import couplePhotographyMid7 from "@/app/assets/couple-photography-mid-7.webp";
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
import venuePhotographyHigh1 from "@/app/assets/venue-photography-high-1.webp";
import venuePhotographyHigh3 from "@/app/assets/venue-photography-high-3.webp";
import venuePhotographyMid from "@/app/assets/venue-photography-mid.webp";
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
  venue: {
    work: [
      "Weddings at farmhouses, banquet halls and destination venues",
      "Layouts planned for every function at one venue",
      "Site visits and bookings matched to the couple's dates",
    ],
    gallery: [p.venuePhotographyMid, p.venuePhotographyHigh3, p.venuePhotographyHigh1, p.photographyVenueHigh2],
    lookingFor: ["Clear capacity and availability", "Flexibility with outside décor and catering partners"],
  },
  catering: {
    work: [
      "Wedding feasts planned around the couple's family favourites",
      "Live counters and chaat stations for mehendi and sangeet",
      "Menus coordinated with the bar, décor and timings of each event",
    ],
    gallery: [p.catererMid3, p.receptionDecorMid7],
    lookingFor: ["FSSAI registration and hygiene standards", "Capacity for both intimate and large weddings"],
  },
  decor: {
    work: [
      "Marigold and floral haldi setups, from courtyards to rooftops",
      "Mandaps, stages and photo corners for every function",
      "Evening lighting with lanterns, fairy lights and statement backdrops",
    ],
    gallery: [p.decorHigh2, p.decorHigh1, p.decorHigh3, p.decorMid4, p.decorMid5],
    lookingFor: ["In-house florals and fabrication", "A team that can set up and strike on tight timelines"],
  },
  entertainment: {
    work: [
      "DJs and anchors who keep every function on schedule",
      "Choreographers and performers for the sangeet",
      "Grand entries with cold-fire sparklers and live acts",
    ],
    gallery: [p.bandBajaDholHigh1, p.haldiMid3, p.receptionDecorMid7, p.decorMid4],
    lookingFor: ["Professional sound and lighting equipment", "Sound limits respected at every venue"],
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
  "invitation-cards": {
    work: [
      "Printed cards, gift boxes and itinerary booklets",
      "Digital invites and RSVPs for every function",
    ],
    gallery: [p.weddingFavoursLow2, p.photographyLow6, p.makeupPhotographyMid4],
    lookingFor: ["Proofing before print", "Reliable delivery across the city"],
  },
  makeup: {
    work: [
      "Bridal looks from traditional red-and-gold to soft and natural",
      "Party makeup for the family on the big day",
      "Touch-ups through rituals, photos and the reception",
    ],
    gallery: [p.makeupPhotographyMid4, p.photographyMakeupHigh2, p.photographyLow6, p.venuePhotographyHigh1],
    lookingFor: ["A portfolio of bridal looks", "Artists available for early-morning starts"],
  },
  "liquor-bar": {
    work: [
      "Bars for cocktail nights, sangeets and receptions",
      "Signature drinks and mocktail menus for every guest",
      "Lounge and hookah corners planned around venue rules",
    ],
    gallery: [p.receptionDecorMid7, p.decorMid5],
    lookingFor: ["Experienced bartenders and trained attendants", "Help with event liquor licences"],
  },
  mehendi: {
    work: [
      "Intricate bridal mehendi, including personalised motifs",
      "Teams for quick guest designs at busy mehendi functions",
    ],
    gallery: [p.mehendiMid4, p.makeupPhotographyMid4],
    lookingFor: ["Natural, chemical-free henna", "A team that can scale for large guest lists"],
  },
  hospitality: {
    work: [
      "Hotel room blocks and check-ins for guests",
      "Welcome hampers and help desks at the hotel",
      "Itineraries so every guest knows where to be",
    ],
    gallery: [p.photographyMid5, p.vintageCarHigh2, p.venuePhotographyHigh3],
    lookingFor: ["Hotels and staff experienced with wedding groups", "Clear room rates and block policies"],
  },
  "band-baaja": {
    work: [
      "Brass bands, dhol players and light carriers for the baraat",
      "Ghodi, buggies and decorated chhatris",
      "Baraat timings coordinated with the venue",
    ],
    gallery: [p.bandBajaDholHigh2, p.bandBajaDholHigh1, p.baaratOnWheels, p.vintageCarHigh1],
    lookingFor: ["Well-cared-for horses and safe handling", "Punctual teams who respect noise limits"],
  },
  pandit: {
    work: [
      "Pandits for roka, haldi, the pheras and other rituals",
      "Puja samagri arranged for each ceremony",
      "Muhurat and timings shared in advance with the families",
    ],
    gallery: [p.mandapDecorMid5, p.photographyVenueHigh2, p.decorHaldiMid5],
    lookingFor: ["Knowledge of different regional traditions", "Clear, warm explanations for the families"],
  },
  "luxury-cars": {
    work: [
      "Vintage and luxury cars for the couple's entry and vidaai",
      "Decorated cars for couple photo shoots",
    ],
    gallery: [p.vintageCarHigh1, p.vintageCarHigh2],
    lookingFor: ["Well-kept, insured vehicles", "Punctual, uniformed chauffeurs"],
  },
  "wedding-favours": {
    work: [
      "Mithai boxes and personalised hampers",
      "Return gifts matched to each function",
    ],
    gallery: [p.weddingFavoursLow1, p.weddingFavoursLow2],
    lookingFor: ["Custom packaging and branding", "Reliable delivery to the venue"],
  },
  "cake-chocolate": {
    work: [
      "Designer wedding and reception cakes",
      "Chocolate and dessert counters",
    ],
    gallery: [p.catererMid3, p.receptionDecorMid7],
    lookingFor: ["Fresh, hygienically prepared desserts", "Designs matched to the wedding's theme"],
  },
  permissions: {
    work: [
      "Police NOC and DJ/sound permissions",
      "Event liquor licences",
      "Permissions checklists shared with every family",
    ],
    gallery: [p.venuePhotographyHigh3, p.venuePhotographyMid],
    lookingFor: ["Knowledge of local rules and timelines", "Paperwork filed well before the wedding"],
  },
  "additional-services": {
    work: [
      "Guest management and help desks",
      "Extra hands for setup and coordination on the day",
    ],
    gallery: [p.decorHigh3, p.photographyMid5, p.decorHaldiMid5],
    lookingFor: ["Flexible teams who can step in at short notice", "Clear rates for on-demand help"],
  },
  "security-valet": {
    work: [
      "Security staff for the venue and gift table",
      "Valet parking for guests at every function",
    ],
    gallery: [p.vintageCarHigh2, p.venuePhotographyMid, p.venuePhotographyHigh3],
    lookingFor: ["Trained, uniformed staff", "Insurance and background-checked teams"],
  },
  transportation: {
    work: [
      "Airport and station pickups for guests",
      "Shuttles between the hotel and each venue",
      "Cars on call for the families",
    ],
    gallery: [p.baaratOnWheels, p.vintageCarHigh2, p.vintageCarHigh1],
    lookingFor: ["Clean, well-maintained vehicles", "Punctual drivers who know the city"],
  },
};
