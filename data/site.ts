import type { StaticImageData } from "next/image";
import baaratOnWheels from "@/app/assets/new/baarat-on-wheels.webp";
import bandBajaDholHigh1 from "@/app/assets/new/band-baja-dhol-high-1.webp";
import bandBajaDholHigh2 from "@/app/assets/new/band-baja-dhol-high-2.webp";
import catererMid3 from "@/app/assets/new/caterer-mid-3.webp";
import couplePhotographyMid7 from "@/app/assets/new/couple-photography-mid-7.webp";
import decorHaldiMid5 from "@/app/assets/new/decor-haldi-mid-5.webp";
import decorHigh1 from "@/app/assets/new/decor-high-1.webp";
import decorHigh2 from "@/app/assets/new/decor-high-2.webp";
import decorHigh3 from "@/app/assets/new/decor-high-3.webp";
import decorMid4 from "@/app/assets/new/decor-mid-4.webp";
import decorMid5 from "@/app/assets/new/decor-mid-5.webp";
import groomAccessoriesLow7 from "@/app/assets/new/groom-accessories-low-7.webp";
import groomHigh1 from "@/app/assets/new/groom-high-1.webp";
import groomHigh2 from "@/app/assets/new/groom-high-2.webp";
import haldiMid2 from "@/app/assets/new/haldi-mid-2.webp";
import haldiMid3 from "@/app/assets/new/haldi-mid-3.webp";
import haldiMid4 from "@/app/assets/new/haldi-mid-4.webp";
import makeupPhotographyMid4 from "@/app/assets/new/makeup-photography-mid-4.webp";
import mandapDecorMid5 from "@/app/assets/new/mandap-decor-mid-5.webp";
import mehendiMid4 from "@/app/assets/new/mehendi-mid-4.webp";
import photographyLow6 from "@/app/assets/new/photography-low-6.webp";
import photographyMakeupHigh2 from "@/app/assets/new/photography-makeup-high-2.webp";
import photographyMid5 from "@/app/assets/new/photography-mid-5.webp";
import photographyVenueHigh2 from "@/app/assets/new/photography-venue-high-2.webp";
import receptionDecorMid7 from "@/app/assets/new/reception-decor-mid-7.webp";
import venuePhotographyHigh1 from "@/app/assets/new/venue-photography-high-1.webp";
import venuePhotographyHigh3 from "@/app/assets/new/venue-photography-high-3.webp";
import venuePhotographyMid from "@/app/assets/new/venue-photography-mid.webp";
import vintageCarHigh1 from "@/app/assets/new/vintage-car-high-1.webp";
import vintageCarHigh2 from "@/app/assets/new/vintage-car-high-2.webp";
import weddingFavoursLow1 from "@/app/assets/new/wedding-favours-low-1.webp";
import weddingFavoursLow2 from "@/app/assets/new/wedding-favours-low-2.webp";

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
 *  PHOTOS: all photos live in /app/assets/new as .webp files and are
 *  imported below. To change one, drop the new .webp into /app/assets/new,
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
  /** Serve the file as-is (photos from the photos API, whose host isn't in next.config.ts). */
  unoptimized?: boolean;
};

export const photo = (
  img: StaticImageData,
  alt: string,
  position?: string,
): Photo => ({
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
  url: process.env.SITE_URL ?? "https://dulhaniyaa.com",

  // Contact — REPLACE all of these
  phoneDisplay: "+91 98100 44015",
  phoneHref: "+919810044015", // digits only, with country code
  // WhatsApp number: digits only with country code, no "+" or spaces.
  // Can also be set with WHATSAPP_NUMBER in .env.local
  whatsappNumber: process.env.WHATSAPP_NUMBER ?? "919810044015",
  email: "dulhaniyaa@gmail.com", // REPLACE
  hours: "Open daily, 10:00 am – 8:00 pm",

  address: {
    line1: "Plot No. 27/2, Ground Floor, West Punjabi Bagh", // REPLACE
    line2: " West Punjabi Bagh", // REPLACE
    city: "New Delhi",
    state: "Delhi",
    postalCode: "110026", // REPLACE
    country: "IN",
  },
  // Used by Google / the JSON-LD schema. Find yours by right-clicking your
  // studio in Google Maps.
  geo: { latitude: 28.6415, longitude: 77.1209 }, // REPLACE
  // Google Maps → Share → Embed a map → copy only the src="…" URL.
  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d218.80221423673072!2d77.1200767956495!3d28.66464593989553!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1792559311600!5m2!1sen!2sin",
  mapLink: "https://maps.google.com/?q=Punjabi+bagh,+New+Delhi", // REPLACE

  gstNumber: "07AALFI4416K1Z6", // REPLACE with your real GSTIN

  social: {
    instagram: "https://www.instagram.com/dulhaniyaaweddingstories",
    instagramHandle: "@dulhaniyaaweddingstories",
    youtube: "https://www.youtube.com/@dulhaniyaaweddingstories",
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
  { href: "/testimonials", label: "Testimonials" },
  { href: "/budget-calculator", label: "Budget Calcy" },
  { href: "/photogram", label: "Photogram" },
];

/** Links in the header and mobile menu. The rest of navLinks still appear in the footer and the sitemap. */
const hiddenFromHeader = ["/testimonials"];
export const headerLinks = navLinks.filter(
  (link) => !hiddenFromHeader.includes(link.href),
);

/**
 * "Dulhaniyaa B2B": the header tab and its dropdown, and the vendor pages, read this list.
 * The tab opens /vendors; each service has its own page at /vendors/<slug>.
 * Images are placeholders from the existing gallery; swap in real ones the same way as the other photos.
 */
export const b2b = {
  label: "Dulhaniyaa B2B",
  href: "/vendors",
  intro:
    "The partners behind every great wedding: venues, caterers, decorators, photographers and more, brought together in one place.",
  services: [
    {
      slug: "venue",
      name: "Venue",
      text: "The venue decides almost everything else: guest count, décor, catering and the date itself. Farmhouses, banquet halls, palaces and destination resorts each set a different tone.",
      image: photo(
        venuePhotographyMid,
        "Bride and groom between carved pillars in a palace courtyard",
      ),
    },
    {
      slug: "catering",
      name: "Catering",
      text: "Guests remember the food. From chaat counters at the mehendi to a full wedding feast, catering shapes the energy of every event and is often the biggest single part of the budget.",
      image: photo(
        catererMid3,
        "Chefs serving at a buffet laid out in a palace courtyard",
      ),
    },
    {
      slug: "decor",
      name: "Décor",
      text: "Décor sets the mood before a single word is spoken. Florals, lighting, mandaps and stages turn an empty venue into a story, and each function needs its own look.",
      image: photo(
        decorHigh2,
        "White wedding hall with a floral aisle leading to a flower arch",
      ),
    },
    {
      slug: "entertainment",
      name: "Entertainment",
      text: "Music carries the celebration from the dholki to the last dance. DJs, anchors, live acts and performers keep every function moving and every generation on the floor.",
      image: photo(
        bandBajaDholHigh1,
        "Friends playing the dhol and dancing around the bride",
      ),
    },
    {
      slug: "photography",
      name: "Photography",
      text: "Long after the last guest leaves, the photos and films are what remain. Candid moments, family portraits and cinematic edits are the memories couples share for a lifetime.",
      image: photo(
        couplePhotographyMid7,
        "Couple posing between carved maroon arches and lanterns",
      ),
    },
    {
      slug: "invitation-cards",
      name: "Invitation Cards",
      text: "The invitation is the first glimpse of the wedding guests receive. Printed cards, gift boxes and digital invites set the tone and carry the itinerary for every function.",
      image: photo(
        weddingFavoursLow2,
        "Illustrated wedding cards and tags tied with ribbon",
      ),
    },
    {
      slug: "makeup",
      name: "Makeup",
      text: "The bride's look is one of the most anticipated moments of the day. A skilled makeup artist makes sure she feels like herself, only more radiant, through hours of rituals and photos.",
      image: photo(
        makeupPhotographyMid4,
        "Bride in a red lehenga and kundan jewellery posing beside roses",
      ),
    },
    {
      slug: "liquor-bar",
      name: "Liquor & Bar",
      text: "The bar is where the party gathers. Skilled bartenders, signature cocktails, lounge corners and smooth licensing turn sangeet and reception nights into celebrations everyone talks about.",
      image: photo(
        receptionDecorMid7,
        "Reception hall with chandeliers, candlelit tables and a bar",
      ),
    },
    {
      slug: "mehendi",
      name: "Mehendi",
      text: "Mehendi is one of the most loved traditions: intricate designs for the bride, quick patterns for the guests, and an afternoon of music and laughter while the colour deepens.",
      image: photo(
        mehendiMid4,
        "Mehendi artist applying an intricate bridal design to the bride's hand",
      ),
    },
    {
      slug: "hospitality",
      name: "Hospitality",
      text: "Out-of-town family needs looking after: rooms, check-ins, welcome kits and help desks make guests feel at home and keep the wedding running smoothly.",
      image: photo(
        photographyMid5,
        "Couple and family walking along a palace corridor",
      ),
    },
    {
      slug: "band-baaja",
      name: "Band Baaja/Ghodiwala",
      text: "The baraat is pure celebration: a brass band, dhol, lights and the ghodi or buggy carrying the groom to the venue, with the whole family dancing along.",
      image: photo(
        bandBajaDholHigh2,
        "Dhol players in maroon kurtas under a marigold canopy",
      ),
    },
    {
      slug: "pandit",
      name: "Pandit/Priest",
      text: "The ceremonies are the heart of the wedding. An experienced pandit guides the families through every ritual, from the roka to the pheras, explaining the meaning along the way.",
      image: photo(
        mandapDecorMid5,
        "Bride and groom exchanging varmalas under a floral mandap in a palace courtyard",
      ),
    },
    {
      slug: "luxury-cars",
      name: "Luxury Car Rental",
      text: "The couple's arrival and departure are moments everyone watches. Vintage convertibles and luxury cars make the entry and the vidaai memorable, and look beautiful in photos.",
      image: photo(
        vintageCarHigh1,
        "Baraat walking beside a vintage maroon car by the lake",
      ),
    },
    {
      slug: "wedding-favours",
      name: "Wedding Favours",
      text: "Favours are the thank-you guests take home: sweets, hampers and keepsakes that carry a little of the wedding with them.",
      image: photo(
        weddingFavoursLow1,
        "Table of pastel favour boxes laid out on a lawn",
      ),
    },
    {
      slug: "cake-chocolate",
      name: "Cake & Chocolate",
      text: "A cake-cutting at the reception or a chocolate counter at the cocktail night adds a sweet moment guests love to gather around.",
      image: photo(
        catererMid3,
        "Chefs serving at a buffet laid out in a palace courtyard",
      ),
    },
    {
      slug: "permissions",
      name: "Permissions & License",
      text: "Police NOCs, DJ and sound permissions and event liquor licences keep a wedding legal and stress-free. Missing one can stop the music on the night.",
      image: photo(
        venuePhotographyHigh3,
        "Bride and groom in a palace courtyard beside a reflecting pool",
      ),
    },
    {
      slug: "additional-services",
      name: "Additional Services",
      text: "Every wedding has its own extras: anchors for the ceremonies, guest management, last-minute help. The little things add up to a smooth day.",
      image: photo(
        decorHigh3,
        "Outdoor lounge with sofas under draped arches and floral columns",
      ),
    },
    {
      slug: "security-valet",
      name: "Security & Valet",
      text: "With hundreds of guests, cars and gifts, trained security and valet teams keep everyone safe and the arrivals smooth.",
      image: photo(
        vintageCarHigh2,
        "Flower-decked white vintage car with a chauffeur outside a palace",
      ),
    },
    {
      slug: "transportation",
      name: "Transportation",
      text: "From airport pickups for out-of-town family to shuttles between the hotel and the venue, transport keeps everyone where they need to be, on time.",
      image: photo(
        baaratOnWheels,
        "Guests dancing to the dhol beside a lit-up Baraat on Wheels bus at night",
      ),
    },
  ],
};

/* ───────────────────────── HOME PHOTO ───────────────────────── */

export const images = {
  hero: photo(
    photographyVenueHigh2,
    "Bride and groom under a floral mandap with a lake behind them",
  ),
};

/* ───────────────────────── SERVICES ───────────────────────── */

export const services = [
  {
    slug: "planning",
    title: "Wedding Planning",
    short: "Venues, vendors, budgets and timelines, handled by one calm team.",
    image: photo(
      venuePhotographyHigh3,
      "Bride and groom in a palace courtyard beside a reflecting pool",
    ),
  },
  {
    slug: "decor",
    title: "Decor & Design",
    short: "Mandaps, stages and entrances designed around your story.",
    image: photo(
      decorHigh1,
      "Carved wooden arches with white drapes, florals and brass lamps",
    ),
  },
  {
    slug: "photography",
    title: "Photography & Films",
    short: "Candid and traditional coverage of every moment that matters.",
    image: photo(
      photographyMakeupHigh2,
      "Smiling bride in a red dupatta and gold jewellery in warm light",
    ),
  },
  {
    slug: "bridal-wear",
    title: "Bridal Couture",
    short:
      "Lehengas and outfits for every function, styled and fitted for you.",
    image: photo(
      venuePhotographyHigh1,
      "Bride in a maroon lehenga holding a bouquet on palace steps",
    ),
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

export const whatWeDoHero = photo(
  couplePhotographyMid7,
  "Couple posing between carved maroon arches and lanterns",
);

export const serviceGroups: ServiceGroup[] = [
  {
    id: "venue-decor",
    title: "Venue & décor",
    intro:
      "From the first step on the red carpet to the last petal on the mandap, every space designed around your story.",
    image: photo(
      decorHigh3,
      "Outdoor lounge with sofas under draped arches and floral columns",
    ),
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
    intro:
      "Menus your guests will talk about, a bar that never runs dry, and rooms, rides and care for everyone who travels in.",
    image: photo(
      catererMid3,
      "Chefs serving at a buffet laid out in a palace courtyard",
    ),
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
      {
        name: "Cake & chocolate",
        items: ["Wedding cake", "Designer cake", "Chocolate counter"],
      },
      {
        name: "Wedding favours",
        items: ["Standard favours", "Customised favours", "Premium hampers"],
      },
    ],
  },
  {
    id: "entertainment-baraat",
    title: "Entertainment & baraat",
    intro:
      "The dhol that starts the baraat, the band that fills the dance floor and the entry nobody forgets.",
    image: photo(
      baaratOnWheels,
      "Guests dancing to the dhol beside a lit-up Baraat on Wheels bus at night",
    ),
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
    intro:
      "Your look, your photographs and every permission in place, so the only thing on your mind is the day itself.",
    image: photo(
      makeupPhotographyMid4,
      "Bride in a red lehenga and kundan jewellery posing beside roses",
    ),
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
        items: [
          "Video invites",
          "Invite cards & boxes",
          "Silver invite for samdhi",
          "Wedding itinerary",
          "Theme milni envelopes",
        ],
      },
      { name: "Pandit / priest", items: ["Pandit ji", "Puja samagri kit"] },
      {
        name: "Permissions & licence",
        items: ["Police NOC", "DJ / sound permission", "Liquor licence"],
      },
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

export const galleryCategories = [
  "All",
  "Bride",
  "Groom",
  "Haldi",
  "Couples",
  "Celebrations",
  "Décor",
] as const;

type GalleryCategory = Exclude<(typeof galleryCategories)[number], "All">;

export const gallery: (Photo & { category: GalleryCategory })[] = [
  {
    category: "Couples",
    ...photo(
      photographyVenueHigh2,
      "Bride and groom under a floral mandap with a lake behind them",
    ),
  },
  {
    category: "Bride",
    ...photo(
      photographyMakeupHigh2,
      "Smiling bride in a red dupatta and gold jewellery in warm light",
    ),
  },
  {
    category: "Groom",
    ...photo(
      groomHigh1,
      "Groom in a sherwani and safa on a balcony overlooking the hills",
    ),
  },
  {
    category: "Décor",
    ...photo(
      decorHigh1,
      "Carved wooden arches with white drapes, florals and brass lamps",
    ),
  },
  {
    category: "Haldi",
    ...photo(
      haldiMid4,
      "Family applying haldi to the couple under a marigold mandap",
    ),
  },
  {
    category: "Celebrations",
    ...photo(
      bandBajaDholHigh1,
      "Friends playing the dhol and dancing around the bride",
    ),
  },
  {
    category: "Couples",
    ...photo(
      venuePhotographyHigh3,
      "Bride and groom in a palace courtyard beside a reflecting pool",
    ),
  },
  {
    category: "Bride",
    ...photo(
      venuePhotographyHigh1,
      "Bride in a maroon lehenga holding a bouquet on palace steps",
    ),
  },
  {
    category: "Groom",
    ...photo(
      groomHigh2,
      "Groom in a gold sherwani fastening his watch",
    ),
  },
  {
    category: "Décor",
    ...photo(
      decorHigh2,
      "White wedding hall with a floral aisle leading to a flower arch",
    ),
  },
  {
    category: "Haldi",
    ...photo(
      haldiMid2,
      "Friends in yellow and sunglasses making heart signs around the bride at the haldi",
    ),
  },
  {
    category: "Celebrations",
    ...photo(
      vintageCarHigh1,
      "Baraat walking beside a vintage maroon car by the lake",
    ),
  },
  {
    category: "Couples",
    ...photo(
      mandapDecorMid5,
      "Bride and groom exchanging varmalas under a floral mandap in a palace courtyard",
    ),
  },
  {
    category: "Bride",
    ...photo(
      makeupPhotographyMid4,
      "Bride in a red lehenga and kundan jewellery posing beside roses",
    ),
  },
  {
    category: "Décor",
    ...photo(
      decorHigh3,
      "Outdoor lounge with sofas under draped arches and floral columns",
    ),
  },
  {
    category: "Haldi",
    ...photo(
      decorHaldiMid5,
      "Couple seated in brass tubs at a haldi ceremony with tropical floral décor",
    ),
  },
  {
    category: "Celebrations",
    ...photo(
      receptionDecorMid7,
      "Reception hall with chandeliers, candlelit tables and a bar",
    ),
  },
  {
    category: "Couples",
    ...photo(
      couplePhotographyMid7,
      "Couple posing between carved maroon arches and lanterns",
    ),
  },
  {
    category: "Groom",
    ...photo(
      groomAccessoriesLow7,
      "Groom's safa, embroidered juttis and pearl mala laid out on velvet",
    ),
  },
  {
    category: "Décor",
    ...photo(
      decorMid4,
      "Maroon and gold wedding stage with arched drapes and red florals",
    ),
  },
  {
    category: "Haldi",
    ...photo(
      haldiMid3,
      "Family in yellow dancing and cheering at the haldi",
    ),
  },
  {
    category: "Celebrations",
    ...photo(
      baaratOnWheels,
      "Guests dancing to the dhol beside a lit-up Baraat on Wheels bus at night",
    ),
  },
  {
    category: "Couples",
    ...photo(
      photographyMid5,
      "Couple and family walking along a palace corridor",
    ),
  },
  {
    category: "Bride",
    ...photo(
      mehendiMid4,
      "Mehendi artist applying an intricate bridal design to the bride's hand",
    ),
  },
  {
    category: "Décor",
    ...photo(
      decorMid5,
      "Night-time aisle lined with flowers under hanging chandeliers",
    ),
  },
  {
    category: "Celebrations",
    ...photo(
      bandBajaDholHigh2,
      "Dhol players in maroon kurtas under a marigold canopy",
    ),
  },
  {
    category: "Couples",
    ...photo(
      venuePhotographyMid,
      "Bride and groom between carved pillars in a palace courtyard",
    ),
  },
  {
    category: "Bride",
    ...photo(
      photographyLow6,
      "Bride in a peach lehenga seated among white flowers",
    ),
  },
  {
    category: "Décor",
    ...photo(
      weddingFavoursLow1,
      "Table of pastel favour boxes laid out on a lawn",
    ),
  },
  {
    category: "Celebrations",
    ...photo(
      vintageCarHigh2,
      "Flower-decked white vintage car with a chauffeur outside a palace",
    ),
  },
  {
    category: "Décor",
    ...photo(
      weddingFavoursLow2,
      "Illustrated wedding cards and tags tied with ribbon",
    ),
  },
];

/* ───────────────────────── FEATURED WEDDINGS ───────────────────────── */

export const featuredWeddings = [
  // REPLACE the couple names with your real weddings
  {
    couple: "Simran & Harjot",
    image: photo(
      mandapDecorMid5,
      "Bride and groom exchanging varmalas under a floral mandap in a palace courtyard",
    ),
  },
  {
    couple: "Aditi & Karan",
    image: photo(
      venuePhotographyHigh3,
      "Bride and groom in a palace courtyard beside a reflecting pool",
    ),
  },
  {
    couple: "Neha & Rohit",
    image: photo(
      venuePhotographyMid,
      "Bride and groom between carved pillars in a palace courtyard",
    ),
  },
];

/* ───────────────────────── TESTIMONIALS ───────────────────────── */

// REPLACE with a real review (with the couple's permission)
export const testimonial = {
  quote:
    "They handled everything so smoothly that my mother actually danced at the sangeet.",
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
