import type { StaticImageData } from "next/image";
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

/**
 * ─────────────────────────────────────────────────────────────
 *  DULHANIYAA — ALL EDITABLE WEBSITE CONTENT LIVES IN THIS FILE
 * ─────────────────────────────────────────────────────────────
 *  Change text, prices, photos and contact details here and the
 *  whole site updates. You never need to touch the page files.
 *
 *  Anything marked  // REPLACE  is a placeholder that must be
 *  swapped for real information before launch.
 *
 *  PHOTOS: all photos live in /app/assets as .webp files and are
 *  imported below. To change one, drop the new .webp into /app/assets,
 *  import it here and pass it to photo(). Width, height and the blurred
 *  loading preview are picked up from the file automatically.
 * ─────────────────────────────────────────────────────────────
 */

export type Photo = {
  src: string;
  alt: string;
  width: number;
  height: number;
  blurDataURL?: string;
  /** Which part of the photo to keep when it is cropped, e.g. "right" or "50% 20%". */
  position?: string;
};

const photo = (img: StaticImageData, alt: string, position?: string): Photo => ({
  src: img.src,
  width: img.width,
  height: img.height,
  blurDataURL: img.blurDataURL,
  alt,
  position,
});

/* ───────────────────────── BUSINESS DETAILS ───────────────────────── */

export const business = {
  name: "Dulhaniyaa",
  tagline: "Your dream wedding awaits",
  shortDescription:
    "Wedding planning, decor, photography and bridal couture under one roof, from a studio in West Delhi serving all of Delhi NCR.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://dulhaniyaa.com",

  // Contact — REPLACE all of these
  phoneDisplay: "+91 98100 00000", // REPLACE
  phoneHref: "+919810000000", // REPLACE (digits only, with country code)
  // WhatsApp number: digits only with country code, no "+" or spaces.
  // Can also be set with NEXT_PUBLIC_WHATSAPP_NUMBER in .env
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "919810000000", // REPLACE
  email: "hello@dulhaniyaa.com", // REPLACE
  hours: "Open daily, 10:00 am – 8:00 pm",

  address: {
    line1: "Plot No. 00, Ground Floor, J-Block", // REPLACE
    line2: "Rajouri Garden", // REPLACE
    city: "New Delhi",
    state: "Delhi",
    postalCode: "110027", // REPLACE
    country: "IN",
  },
  // Used by Google / the JSON-LD schema. Find yours by right-clicking your
  // studio in Google Maps.
  geo: { latitude: 28.6415, longitude: 77.1209 }, // REPLACE
  // Google Maps → Share → Embed a map → copy only the src="…" URL. REPLACE
  mapEmbedUrl:
    "https://www.google.com/maps?q=Rajouri+Garden,+New+Delhi&output=embed",
  mapLink: "https://maps.google.com/?q=Rajouri+Garden,+New+Delhi", // REPLACE

  gstNumber: "07ABCDE1234F1Z5", // REPLACE with your real GSTIN

  social: {
    instagram: "https://www.instagram.com/dulhaniyaa", // REPLACE
    instagramHandle: "@dulhaniyaa", // REPLACE
    // Leave as "" to hide the link until your profile is live.
    wedMeGood: "", // e.g. "https://www.wedmegood.com/profile/dulhaniyaa-123456"
    weddingWire: "", // e.g. "https://www.weddingwire.in/wedding-planners/dulhaniyaa--e123456"
  },

  areaServed: [
    "Delhi",
    "Gurugram",
    "Noida",
    "Faridabad",
    "Ghaziabad",
    "Greater Noida",
  ],
};

/* ───────────────────────── NAVIGATION ───────────────────────── */

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/what-we-do", label: "What We Do" },
  { href: "/about", label: "About Us" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/budget-calculator", label: "Budget Calc" },
  { href: "/photogram", label: "Photogram" },
];

/* ───────────────────────── HOME PHOTO ───────────────────────── */

export const images = {
  hero: photo(couple2, "Couple in pastel and blue outfits sitting together on a marigold-decorated swing"),
};

/* ───────────────────────── SERVICES ───────────────────────── */

export const services = [
  {
    slug: "planning",
    title: "Wedding Planning",
    short: "Venues, vendors, budgets and timelines, handled by one calm team.",
    image: photo(fireworks, "Groom's friends holding up cold-fire sparklers as the couple make their entrance at night"),
  },
  {
    slug: "decor",
    title: "Decor & Design",
    short: "Mandaps, stages and entrances designed around your story.",
    image: photo(haldiShort4, "Bride's hennaed hand lighting a diya on a brass haldi thali"),
  },
  {
    slug: "photography",
    title: "Photography & Films",
    short: "Candid and traditional coverage of every moment that matters.",
    image: photo(brideCloseUp2, "Close-up of a bride adjusting her maang tikka, hands covered in mehendi"),
  },
  {
    slug: "bridal-wear",
    title: "Bridal Couture",
    short: "Lehengas and outfits for every function, styled and fitted for you.",
    image: photo(brideCloseup4, "Bride in a red dupatta and embroidered lehenga peeking out from behind a door"),
  },
];

/* ───────────────────────── WHAT WE DO PAGE ───────────────────────── */
// Groups → categories → items. Add, remove or reword items freely.

export type ServiceGroup = {
  id: string;
  title: string;
  intro: string;
  image: Photo;
  categories: { name: string; items: string[] }[];
};

export const whatWeDoHero = photo(haldiShot3, "Family members dancing and laughing in yellow outfits at the haldi");

export const serviceGroups: ServiceGroup[] = [
  {
    id: "venue-decor",
    title: "Venue & décor",
    intro: "From the first step on the red carpet to the last petal on the mandap, every space designed around your story.",
    image: photo(blueCoupleBg, "Couple facing each other across carved blue arches lit by lanterns"),
    categories: [
      {
        name: "Venue",
        items: [
          "Catering, décor & entertainment layout",
          "Extra décor",
          "Extra signage",
          "Red carpet entry",
          "Vedi",
          "Bar",
          "Ice bar",
          "Molecule bar",
          "Ambient lighting",
          "Element lighting",
          "Chair covers & drapes",
          "Table overlays",
          "Table runners",
          "Ceiling décor",
          "Wall treatments & fabric drapery",
          "Centrepieces",
          "Floral arrangements",
          "Bridal & wedding party bouquets",
          "Exclusive furniture & décor fabrication",
          "Custom backdrops",
        ],
      },
      {
        name: "Décor",
        items: [
          "Entrance décor",
          "Passage décor",
          "Stage",
          "Chandeliers",
          "Console setups",
          "Corner setups",
          "Floral installations",
          "Photo booth",
          "Props",
        ],
      },
      {
        name: "Function themes",
        items: [
          "Mehendi meena bazaar: parandi",
          "Bangles",
          "Astrologer",
          "Tarot reader",
          "Parrot fortune teller",
          "Jutti wala",
          "Pagdi wala",
          "Theme singer & dance troupe",
          "Chura ceremony",
          "Cocktail",
          "Haldi",
        ],
      },
    ],
  },
  {
    id: "food-bar-stay",
    title: "Food, bar & stay",
    intro: "Menus your guests will talk about, a bar that never runs dry, and rooms, rides and care for everyone who travels in.",
    image: photo(haldiPrep, "Bowl of fresh haldi paste beside a plate of rice and turmeric for the ceremony"),
    categories: [
      {
        name: "Catering",
        items: [
          "Menu options",
          "Contract promises explained",
          "Baraat trolley",
          "Chaat menu",
          "Phera menu",
          "Baraat welcome special sweets",
        ],
      },
      {
        name: "Liquor & bar",
        items: [
          "Hard drinks (room service)",
          "Cocktails",
          "International liquor",
          "Molecule bar",
          "LED bar",
          "Ice bar",
          "Bartender",
          "Bar accessories",
          "Liquor licence",
          "Russian waitresses",
        ],
      },
      {
        name: "Stay & hospitality",
        items: [
          "Hotel contract detailing: menu, mini bar, food, hi-tea",
          "Complimentary cake, wine & room upgrades",
          "Car rental pick & drop",
          "Guest check-in",
          "24-hour control room",
          "Savoury trays",
          "Wedding stationery",
          "Control room for liquor, room service, savouries & bookings",
          "Manpower: control room & travel desk",
          "Driver & staff food and stay",
          "Massage room",
          "Beauty parlour for 40–50 female guests",
          "Games room: roulette tokens & playing cards",
          "Event-wise SMS alerts",
          "Return gifts to suit your budget & taste",
        ],
      },
      { name: "Cake & chocolate", items: ["Wedding cake", "Designer cake", "Chocolate counter"] },
      { name: "Wedding favours", items: ["Standard favours", "Customised favours", "Premium hampers"] },
    ],
  },
  {
    id: "entertainment-baraat",
    title: "Entertainment & baraat",
    intro: "The dhol that starts the baraat, the band that fills the dance floor and the entry nobody forgets.",
    image: photo(fireworks, "Friends holding up cold-fire sparklers for the couple's grand entrance"),
    categories: [
      {
        name: "Entertainment",
        items: [
          "DJ",
          "Female DJ",
          "Live bands",
          "Celebrity performers",
          "Celebrity management",
          "International acts",
          "Dance troupes",
          "Singers",
          "Anchors & emcees",
          "Dhol & percussionists",
          "Acoustic performers",
          "Pianists",
          "Salsa bands",
          "Solo performers",
          "Group dance",
          "Comedian (breakfast / hi-tea)",
          "Military band",
          "Harpists",
          "Bride & groom entry",
          "Jaimala concepts",
          "Choreography",
          "Folk dances",
          "Sound, light & trussing",
          "LED walls",
          "LED bar",
          "LED dance floor",
          "Wooden dance floor",
          "Flex dance floor",
          "Sharpees",
          "LED lights",
          "Linear & speakers",
          "Base",
          "LED dhol",
          "Stage platform",
        ],
      },
      {
        name: "Band baaja & ghodiwala",
        items: [
          "Band baaja",
          "Ghodi",
          "Dhol",
          "Lights & chhatar",
          "Theme entry",
          "Shehnai",
          "Taasha & naperi",
          "Baggi with horses",
          "Palki",
          "Phoolon ki chadar",
          "Mobile DJ",
        ],
      },
      {
        name: "Baraat welcome",
        items: [
          "Pataka",
          "Pearl mala",
          "Flower garlands",
          "Brooch",
          "Floral jewellery",
          "Pagdi / safa assembly",
          "Cold fireworks",
        ],
      },
      { name: "Luxury car rental", items: ["Vintage car", "Limousine"] },
      { name: "Transportation", items: ["Guest shuttles"] },
    ],
  },
  {
    id: "bride-memories-paperwork",
    title: "Bride, memories & paperwork",
    intro: "Your look, your photographs and every permission in place, so the only thing on your mind is the day itself.",
    image: photo(brideCloseup4, "Bride in a red dupatta and embroidered lehenga peeking out from behind a door"),
    categories: [
      {
        name: "Makeup",
        items: [
          "Bridal",
          "Party",
          "Family",
          "Pre-wedding shoot",
          "Basic, HD & airbrush makeovers",
          "Hairstyling",
          "Nail art",
          "Parlour in hotel",
        ],
      },
      { name: "Mehendi", items: ["Bridal", "Family (40–50 people)", "Groom"] },
      {
        name: "Photography",
        items: [
          "Pre-wedding shoot",
          "Wedding day photography",
          "Pre-function photography",
          "Photo booth",
          "Personal assistant",
          "Frame canvas",
          "Wedding website",
          "Pre-wedding shoot makeup",
        ],
      },
      {
        name: "Invitation cards",
        items: ["Video invites", "Invite cards & boxes", "Silver invite for samdhi", "Wedding itinerary", "Theme milni envelopes"],
      },
      { name: "Pandit / priest", items: ["Pandit ji", "Puja samagri kit"] },
      { name: "Permissions & licence", items: ["Police NOC", "DJ / sound permission", "Liquor licence"] },
      { name: "Security & valet", items: ["Security", "Valet parking"] },
    ],
  },
];

/* ───────────────────────── PACKAGES ───────────────────────── */
// Prices are "starting from". Write them exactly as you want them shown.

export const packages = [
  {
    name: "Silver",
    price: "₹4,00,000",
    idealFor: "Up to 150 guests",
    popular: false,
    includes: [
      "Planning for 2 functions",
      "Decor for the wedding + 1 event",
      "Photography (1 day) + highlight film",
      "Dedicated coordinator",
    ],
  },
  {
    name: "Gold",
    price: "₹8,00,000",
    idealFor: "Up to 400 guests",
    popular: true,
    includes: [
      "Planning for 4 functions",
      "Themed decor for every function",
      "Photo & film (2 days) + pre-wedding shoot",
      "Bridal styling + 1 custom outfit",
    ],
  },
  {
    name: "Royal",
    price: "₹15,00,000",
    idealFor: "400+ guests",
    popular: false,
    includes: [
      "End-to-end planning",
      "Luxury custom decor with 3D previews",
      "Full photo & film team (3 days)",
      "Bespoke couture + guest logistics",
    ],
  },
];

export const packagesNote = "Prices exclude venue, catering and GST.";

/* ───────────────────────── PORTFOLIO ───────────────────────── */

export const galleryCategories = ["All", "Bride", "Groom", "Haldi", "Couples", "Celebrations"] as const;

type GalleryCategory = Exclude<(typeof galleryCategories)[number], "All">;

export const gallery: (Photo & { category: GalleryCategory })[] = [
  { category: "Couples", ...photo(couple2, "Couple in pastel and blue outfits sitting together on a marigold-decorated swing") },
  { category: "Bride", ...photo(brideCloseup3, "Bride in a red dupatta hiding a smile behind her hennaed hands") },
  { category: "Haldi", ...photo(haldiPic1, "Groom smiling through a window frame and a bride's hand with floral haldi jewellery") },
  { category: "Celebrations", ...photo(fireworks, "Friends holding up cold-fire sparklers for the couple's grand entrance") },
  { category: "Bride", ...photo(brideCloseUp2, "Close-up of a bride adjusting her maang tikka, hands covered in mehendi") },
  { category: "Groom", ...photo(groomShot, "Groom in a gold sherwani with close-ups of his watch, fragrance and shoes") },
  { category: "Couples", ...photo(couple4, "Couple in black and navy embracing under hanging wisteria") },
  { category: "Haldi", ...photo(haldiShort5, "Family in yellow and sunglasses making heart signs around the couple at the haldi") },
  { category: "Bride", ...photo(makeupClose, "Bride with glittering eye makeup and a delicate hair accessory") },
  { category: "Couples", ...photo(carAndCouple, "Couple posing with a vintage copper convertible under a pink sky") },
  { category: "Haldi", ...photo(haldiPrep, "Bowl of fresh haldi paste beside a plate of rice and turmeric for the ceremony") },
  { category: "Bride", ...photo(brideCloseup, "Bride in red with a gold nath and maang tikka looking down") },
  { category: "Groom", ...photo(groomHaldiCloseUp, "Groom in sunglasses and a haldi-stained kurta looking over his shoulder") },
  { category: "Couples", ...photo(blueCoupleBg, "Couple facing each other across carved blue arches lit by lanterns") },
  { category: "Haldi", ...photo(haldiShot3, "Family members dancing and laughing in yellow outfits at the haldi") },
  { category: "Bride", ...photo(brideCloseup4, "Bride in a red dupatta and embroidered lehenga peeking out from behind a door") },
  { category: "Haldi", ...photo(haldiShort4, "Bride's hennaed hand lighting a diya on a brass haldi thali") },
  { category: "Couples", ...photo(couple1, "Couple in white and yellow sitting on rocks by turquoise water") },
  { category: "Bride", ...photo(brideCloseup5, "Three close-ups of a bride with floral jewellery in warm evening light") },
  { category: "Haldi", ...photo(haldiShort5b, "Bride's mehendi-covered feet and hands in a yellow lehenga during the haldi") },
];

/* ───────────────────────── FEATURED WEDDINGS ───────────────────────── */

export const featuredWeddings = [
  // REPLACE the couple names with your real weddings
  {
    couple: "Simran & Harjot",
    image: photo(carAndCouple, "Couple posing with a vintage copper convertible under a pink sky"),
  },
  {
    couple: "Aditi & Karan",
    image: photo(blueCoupleBg, "Couple facing each other across carved blue arches lit by lanterns"),
  },
  {
    couple: "Neha & Rohit",
    image: photo(couple1, "Couple in white and yellow sitting on rocks by turquoise water", "80% 50%"),
  },
];

/* ───────────────────────── TESTIMONIALS ───────────────────────── */

// REPLACE with a real review (with the couple's permission)
export const testimonial = {
  quote: "They handled everything so smoothly that my mother actually danced at the sangeet.",
  couple: "Simran & Harjot",
};

/* ───────────────────────── ABOUT ───────────────────────── */

export const story = [
  // REPLACE with your own story
  "Dulhaniyaa began at a family wedding in Rajouri Garden, watching our aunts juggle vendors instead of enjoying the day.",
  "Today we plan, design, capture and dress weddings across Delhi NCR, and take on only a few each season.",
];

export const team: { name: string; role: string; photo?: Photo }[] = [
  // REPLACE with real names and roles. To add a photo, import it at the top
  // of this file and add  photo: photo(myImport, "Portrait of …"),
  {
    name: "Arjun Malhotra",
    role: "Founder & Lead Planner",
  },
  {
    name: "Riya Kapoor",
    role: "Decor & Design",
  },
  {
    name: "Kabir Sethi",
    role: "Photography",
  },
  {
    name: "Ananya Gupta",
    role: "Bridal Styling",
  },
];

/* ───────────────────────── ENQUIRY FORM OPTIONS ───────────────────────── */

export const budgetRanges = [
  "Under ₹5 Lakh",
  "₹5 – 10 Lakh",
  "₹10 – 20 Lakh",
  "₹20 – 40 Lakh",
  "₹40 Lakh+",
  "Not sure yet",
];

export const guestRanges = [
  "Under 100",
  "100 – 250",
  "250 – 500",
  "500 – 1,000",
  "1,000+",
];
