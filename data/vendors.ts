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
 *  Photos reuse the existing gallery for now.
 * ─────────────────────────────────────────────────────────────
 */

import blueCoupleBg from "@/app/assets/blue-couple-bg.webp";
import brideCloseUp2 from "@/app/assets/bride-close-up2.webp";
import brideCloseup from "@/app/assets/bride-closeup.webp";
import brideCloseup3 from "@/app/assets/bride-closeup3.webp";
import brideCloseup4 from "@/app/assets/bride-closeup4.webp";
import brideCloseup5 from "@/app/assets/bride-closeup5.webp";
import carAndCouple from "@/app/assets/carandcouple3.webp";
import couple1 from "@/app/assets/couple1.webp";
import couple2 from "@/app/assets/couple2.webp";
import couple4 from "@/app/assets/couple4.webp";
import fireworks from "@/app/assets/fireworks.webp";
import groomHaldiCloseUp from "@/app/assets/groom-haldi-close-up.webp";
import groomShot from "@/app/assets/groom-shot.webp";
import haldiPic1 from "@/app/assets/haldi-pic1.webp";
import haldiPrep from "@/app/assets/haldi-prep.webp";
import haldiShort4 from "@/app/assets/haldi-short4.webp";
import haldiShort5 from "@/app/assets/haldi-short5.webp";
import haldiShot3 from "@/app/assets/haldi-shot3.webp";
import haldiShort5b from "@/app/assets/haldishort5.webp";
import makeupClose from "@/app/assets/makeup-close.webp";
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
  couple2: photo(couple2, "Couple in pastel and blue outfits sitting together on a marigold-decorated swing"),
  blueCoupleBg: photo(blueCoupleBg, "Couple facing each other across carved blue arches lit by lanterns"),
  couple4: photo(couple4, "Couple in black and navy embracing under hanging wisteria"),
  couple1: photo(couple1, "Couple in white and yellow sitting on rocks by turquoise water"),
  haldiShort4: photo(haldiShort4, "Bride's hennaed hand lighting a diya on a brass haldi thali"),
  brideCloseup5: photo(brideCloseup5, "Three close-ups of a bride with floral jewellery in warm evening light"),
  brideCloseUp2: photo(brideCloseUp2, "Close-up of a bride adjusting her maang tikka, hands covered in mehendi"),
  groomShot: photo(groomShot, "Groom in a gold sherwani with close-ups of his watch, fragrance and shoes"),
  haldiPrep: photo(haldiPrep, "Bowl of fresh haldi paste beside a plate of rice and turmeric for the ceremony"),
  haldiShort5: photo(haldiShort5, "Family in yellow and sunglasses making heart signs around the couple at the haldi"),
  haldiShot3: photo(haldiShot3, "Family members dancing and laughing in yellow outfits at the haldi"),
  fireworks: photo(fireworks, "Friends holding up cold-fire sparklers for the couple's grand entrance"),
  makeupClose: photo(makeupClose, "Bride with glittering eye makeup and a delicate hair accessory"),
  brideCloseup: photo(brideCloseup, "Bride in red with a gold nath and maang tikka looking down"),
  brideCloseup3: photo(brideCloseup3, "Bride in a red dupatta hiding a smile behind her hennaed hands"),
  haldiShort5b: photo(haldiShort5b, "Bride's mehendi-covered feet and hands in a yellow lehenga during the haldi"),
  brideCloseup4: photo(brideCloseup4, "Bride in a red dupatta and embroidered lehenga peeking out from behind a door"),
  haldiPic1: photo(haldiPic1, "Groom smiling through a window frame and a bride's hand with floral haldi jewellery"),
  carAndCouple: photo(carAndCouple, "Couple posing with a vintage copper convertible under a pink sky"),
  groomHaldiCloseUp: photo(groomHaldiCloseUp, "Groom in sunglasses and a haldi-stained kurta looking over his shoulder"),
};

export const vendorPages: Record<string, VendorPage> = {
  venue: {
    work: [
      "Weddings at farmhouses, banquet halls and destination venues",
      "Layouts planned for every function at one venue",
      "Site visits and bookings matched to the couple's dates",
    ],
    gallery: [p.blueCoupleBg, p.couple1, p.brideCloseup4],
    lookingFor: ["Clear capacity and availability", "Flexibility with outside décor and catering partners"],
  },
  catering: {
    work: [
      "Wedding feasts planned around the couple's family favourites",
      "Live counters and chaat stations for mehendi and sangeet",
      "Menus coordinated with the bar, décor and timings of each event",
    ],
    gallery: [p.haldiPrep, p.haldiShort5, p.haldiShot3],
    lookingFor: ["FSSAI registration and hygiene standards", "Capacity for both intimate and large weddings"],
  },
  decor: {
    work: [
      "Marigold and floral haldi setups, from courtyards to rooftops",
      "Mandaps, stages and photo corners for every function",
      "Evening lighting with lanterns, fairy lights and statement backdrops",
    ],
    gallery: [p.couple2, p.blueCoupleBg, p.couple4, p.haldiShort4],
    lookingFor: ["In-house florals and fabrication", "A team that can set up and strike on tight timelines"],
  },
  entertainment: {
    work: [
      "DJs and anchors who keep every function on schedule",
      "Choreographers and performers for the sangeet",
      "Grand entries with cold-fire sparklers and live acts",
    ],
    gallery: [p.haldiShot3, p.fireworks, p.haldiShort5],
    lookingFor: ["Professional sound and lighting equipment", "Sound limits respected at every venue"],
  },
  photography: {
    work: [
      "Candid and traditional coverage across every function",
      "Bridal and groom portraits, getting-ready details included",
      "Pre-wedding shoots and cinematic wedding films",
    ],
    gallery: [p.brideCloseup5, p.brideCloseUp2, p.couple1, p.groomShot],
    lookingFor: ["A consistent editing style", "Delivery timelines for photos and films agreed up front"],
  },
  "invitation-cards": {
    work: [
      "Printed cards, gift boxes and itinerary booklets",
      "Digital invites and RSVPs for every function",
    ],
    gallery: [p.brideCloseup4, p.haldiShort4, p.haldiPic1],
    lookingFor: ["Proofing before print", "Reliable delivery across the city"],
  },
  makeup: {
    work: [
      "Bridal looks from traditional red-and-gold to soft and natural",
      "Party makeup for the family on the big day",
      "Touch-ups through rituals, photos and the reception",
    ],
    gallery: [p.makeupClose, p.brideCloseup, p.brideCloseup3, p.brideCloseUp2],
    lookingFor: ["A portfolio of bridal looks", "Artists available for early-morning starts"],
  },
  "liquor-bar": {
    work: [
      "Bars for cocktail nights, sangeets and receptions",
      "Signature drinks and mocktail menus for every guest",
      "Lounge and hookah corners planned around venue rules",
    ],
    gallery: [p.fireworks, p.couple4, p.groomShot],
    lookingFor: ["Experienced bartenders and trained attendants", "Help with event liquor licences"],
  },
  mehendi: {
    work: [
      "Intricate bridal mehendi, including personalised motifs",
      "Teams for quick guest designs at busy mehendi functions",
    ],
    gallery: [p.haldiShort5b, p.brideCloseup3, p.haldiShort4, p.brideCloseUp2],
    lookingFor: ["Natural, chemical-free henna", "A team that can scale for large guest lists"],
  },
  hospitality: {
    work: [
      "Hotel room blocks and check-ins for guests",
      "Welcome hampers and help desks at the hotel",
      "Itineraries so every guest knows where to be",
    ],
    gallery: [p.couple1, p.haldiShort5, p.blueCoupleBg],
    lookingFor: ["Hotels and staff experienced with wedding groups", "Clear room rates and block policies"],
  },
  "band-baaja": {
    work: [
      "Brass bands, dhol players and light carriers for the baraat",
      "Ghodi, buggies and decorated chhatris",
      "Baraat timings coordinated with the venue",
    ],
    gallery: [p.groomHaldiCloseUp, p.haldiShot3, p.fireworks],
    lookingFor: ["Well-cared-for horses and safe handling", "Punctual teams who respect noise limits"],
  },
  pandit: {
    work: [
      "Pandits for roka, haldi, the pheras and other rituals",
      "Puja samagri arranged for each ceremony",
      "Muhurat and timings shared in advance with the families",
    ],
    gallery: [p.haldiShort4, p.haldiPrep, p.brideCloseup3],
    lookingFor: ["Knowledge of different regional traditions", "Clear, warm explanations for the families"],
  },
  "luxury-cars": {
    work: [
      "Vintage and luxury cars for the couple's entry and vidaai",
      "Decorated cars for couple photo shoots",
    ],
    gallery: [p.carAndCouple, p.couple1],
    lookingFor: ["Well-kept, insured vehicles", "Punctual, uniformed chauffeurs"],
  },
  "wedding-favours": {
    work: [
      "Mithai boxes and personalised hampers",
      "Return gifts matched to each function",
    ],
    gallery: [p.haldiPic1, p.haldiShort4, p.brideCloseup5],
    lookingFor: ["Custom packaging and branding", "Reliable delivery to the venue"],
  },
  "cake-chocolate": {
    work: [
      "Designer wedding and reception cakes",
      "Chocolate and dessert counters",
    ],
    gallery: [p.haldiPrep, p.couple2, p.haldiShort5],
    lookingFor: ["Fresh, hygienically prepared desserts", "Designs matched to the wedding's theme"],
  },
  permissions: {
    work: [
      "Police NOC and DJ/sound permissions",
      "Event liquor licences",
      "Permissions checklists shared with every family",
    ],
    gallery: [p.groomShot, p.fireworks],
    lookingFor: ["Knowledge of local rules and timelines", "Paperwork filed well before the wedding"],
  },
  "additional-services": {
    work: [
      "Guest management and help desks",
      "Extra hands for setup and coordination on the day",
    ],
    gallery: [p.couple2, p.haldiShot3, p.haldiShort5],
    lookingFor: ["Flexible teams who can step in at short notice", "Clear rates for on-demand help"],
  },
  "security-valet": {
    work: [
      "Security staff for the venue and gift table",
      "Valet parking for guests at every function",
    ],
    gallery: [p.brideCloseup4, p.carAndCouple],
    lookingFor: ["Trained, uniformed staff", "Insurance and background-checked teams"],
  },
  transportation: {
    work: [
      "Airport and station pickups for guests",
      "Shuttles between the hotel and each venue",
      "Cars on call for the families",
    ],
    gallery: [p.carAndCouple, p.couple1],
    lookingFor: ["Clean, well-maintained vehicles", "Punctual drivers who know the city"],
  },
};
