import type { StaticImageData } from "next/image";
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
import groomAccessoriesLow7 from "@/app/assets/groom-accessories-low-7.webp";
import groomHigh1 from "@/app/assets/groom-high-1.webp";
import groomHigh2 from "@/app/assets/groom-high-2.webp";
import haldiMid2 from "@/app/assets/haldi-mid-2.webp";
import haldiMid3 from "@/app/assets/haldi-mid-3.webp";
import haldiMid4 from "@/app/assets/haldi-mid-4.webp";
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
  { href: "/budget-calculator", label: "Wedding Budgetor" },
  { href: "/photogram", label: "Photogram" },
  { href: "/community", label: "Community" },
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
    "The partners behind every great wedding: makeup artists, decorators, bars and photographers, brought together in one place.",
  services: [
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
      slug: "decor",
      name: "Décor",
      text: "Décor sets the mood before a single word is spoken. Florals, lighting, mandaps and stages turn an empty venue into a story, and each function needs its own look.",
      image: photo(
        decorHigh2,
        "White wedding hall with a floral aisle leading to a flower arch",
      ),
    },
    {
      slug: "liquor-bar",
      name: "Liquor & Bar",
      text: "The bar is where the party gathers. Skilled bartenders, signature cocktails, lounge corners and smooth licensing turn sangeet and reception nights into celebrations everyone talks about.",
      image: photo(
        sangriaBar,
        "Sangria bar with a floral-print counter set up on a garden lawn",
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
      slug: "security-valet",
      name: "Security & Valet",
      text: "With hundreds of guests, cars and gifts, trained security and valet teams keep everyone safe and the arrivals smooth.",
      image: photo(
        vintageCarHigh2,
        "Flower-decked white vintage car with a chauffeur outside a palace",
      ),
    },
  ],
};

/**
 * The service detail pages (/vendors/<service>) are hidden for now: every service link opens the
 * Q&A straight away, and visiting a detail page redirects there. Set to true to bring them back.
 */
export const SHOW_VENDOR_DETAIL = false;

export const vendorHref = (slug: string) =>
  SHOW_VENDOR_DETAIL ? `/vendors/${slug}` : `/vendors/${slug}/questions`;

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
// `info` is the one-line explanation shown in the bubble when a visitor taps the item.

export type ServiceItem = { name: string; info: string };

export type ServiceGroup = {
  id: string;
  title: string;
  intro: string;
  image: Photo;
  categories: { name: string; items: ServiceItem[] }[];
};

export const whatWeDoHero = photo(
  decor,
  "Gold stage with a flower-crowned sculpted face, golden deer and lanterns",
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
          { name: "Catering, décor & entertainment layout", info: "A floor plan placing the food, décor, stage and dance floor so guests flow easily." },
          { name: "Extra décor", info: "Additional décor touches beyond the main setup, wherever the venue needs more." },
          { name: "Extra signage", info: "Welcome boards, direction signs and name boards around the venue." },
          { name: "Red carpet entry", info: "A red carpet walkway for a grand arrival." },
          { name: "Vedi", info: "The sacred fire canopy where the pheras take place, dressed to match your theme." },
          { name: "Bar", info: "A styled bar counter set up for the event." },
          { name: "Ice bar", info: "A bar counter carved from ice that looks stunning and keeps drinks chilled." },
          { name: "Molecule bar", info: "Cocktails made with smoke, foams and gels, mixed right in front of guests." },
          { name: "Ambient lighting", info: "Soft overall lighting that sets the mood across the venue." },
          { name: "Element lighting", info: "Focused lights that highlight the stage, florals and key décor pieces." },
          { name: "Chair covers & drapes", info: "Fabric covers and sashes so every chair matches the theme." },
          { name: "Table overlays", info: "Decorative cloths layered over tablecloths for colour and texture." },
          { name: "Table runners", info: "Fabric strips down the middle of each table to tie the look together." },
          { name: "Ceiling décor", info: "Draped fabric, florals or hanging pieces overhead." },
          { name: "Wall treatments & fabric drapery", info: "Fabric and panels that cover plain walls and transform the space." },
          { name: "Centrepieces", info: "Floral or décor arrangements at the centre of each guest table." },
          { name: "Floral arrangements", info: "Fresh flower designs placed around the venue." },
          { name: "Bridal & wedding party bouquets", info: "Hand-tied bouquets for the bride, bridesmaids and family." },
          { name: "Exclusive furniture & décor fabrication", info: "Furniture and décor pieces designed and built just for your wedding." },
          { name: "Custom backdrops", info: "Made-to-order backdrops for the stage, photos or entrance." },
        ],
      },
      {
        name: "Décor",
        items: [
          { name: "Entrance décor", info: "A dressed-up entrance that greets guests as they arrive." },
          { name: "Passage décor", info: "Florals, lights and props lining the walkways between spaces." },
          { name: "Stage", info: "The main stage designed and built for your function." },
          { name: "Chandeliers", info: "Statement chandeliers hung over the stage, lounge or dance floor." },
          { name: "Console setups", info: "Decorated side tables with florals, candles and frames." },
          { name: "Corner setups", info: "Styled corners that turn empty spaces into photo spots." },
          { name: "Floral installations", info: "Large flower pieces like arches, walls and hanging florals." },
          { name: "Photo booth", info: "A themed spot with props where guests snap fun photos." },
          { name: "Props", info: "Décor props and accents that bring the theme to life." },
        ],
      },
      {
        name: "Function themes",
        items: [
          { name: "Mehendi meena bazaar: parandi", info: "A fair-style mehendi with stalls, including colourful parandis for braids." },
          { name: "Bangles", info: "A bangle stall where guests pick and try on glass bangles." },
          { name: "Astrologer", info: "An astrologer reading guests' fortunes for fun." },
          { name: "Tarot reader", info: "A tarot card reader who gives guests short readings." },
          { name: "Parrot fortune teller", info: "The traditional fortune teller whose parrot picks a card for you." },
          { name: "Jutti wala", info: "A stall of embroidered Punjabi juttis for guests." },
          { name: "Pagdi wala", info: "An expert who ties colourful pagdis for guests." },
          { name: "Theme singer & dance troupe", info: "Singers and dancers performing to match the function's theme." },
          { name: "Chura ceremony", info: "Setup and décor for the bride's chura (bangle) ceremony." },
          { name: "Cocktail", info: "A full theme and setup for your cocktail night." },
          { name: "Haldi", info: "Bright, cheerful décor and setup for the haldi ceremony." },
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
          { name: "Menu options", info: "Curated menus across cuisines to fit your taste and budget." },
          { name: "Contract promises explained", info: "We walk you through what the catering contract covers, so nothing is missed." },
          { name: "Baraat trolley", info: "A moving trolley of drinks and snacks that travels with the baraat." },
          { name: "Chaat menu", info: "Live chaat counters with golgappe, tikki, papdi and more." },
          { name: "Phera menu", info: "Snacks and tea served to family during the late-night pheras." },
          { name: "Baraat welcome special sweets", info: "Special sweets to welcome the groom's side as they arrive." },
        ],
      },
      {
        name: "Liquor & bar",
        items: [
          { name: "Hard drinks (room service)", info: "Drinks delivered straight to guests' rooms." },
          { name: "Cocktails", info: "A cocktail menu made for your event." },
          { name: "International liquor", info: "Imported spirits, wines and beers." },
          { name: "Molecule bar", info: "Cocktails made with smoke, foams and gels, mixed right in front of guests." },
          { name: "LED bar", info: "A glowing bar counter that lights up the party." },
          { name: "Ice bar", info: "A bar counter carved from ice that looks stunning and keeps drinks chilled." },
          { name: "Bartender", info: "Professional bartenders to mix and serve all night." },
          { name: "Bar accessories", info: "Glassware, ice, mixers and everything else the bar needs." },
          { name: "Liquor licence", info: "We arrange the permit needed to serve alcohol at your event." },
          { name: "Russian waitresses", info: "Professional international hosts who serve drinks and look after guests." },
        ],
      },
      {
        name: "Stay & hospitality",
        items: [
          { name: "Hotel contract detailing: menu, mini bar, food, hi-tea", info: "We go through the hotel contract line by line so you get what you pay for." },
          { name: "Complimentary cake, wine & room upgrades", info: "We negotiate free extras like cake, wine and upgrades with the hotel." },
          { name: "Car rental pick & drop", info: "Cars to pick guests up and drop them off." },
          { name: "Guest check-in", info: "A help desk that checks guests in and hands over room keys and kits." },
          { name: "24-hour control room", info: "A team on call around the clock to sort out any guest need." },
          { name: "Savoury trays", info: "Snack trays placed in guests' rooms." },
          { name: "Wedding stationery", info: "Itineraries, room notes, tags and other printed pieces for guests." },
          { name: "Control room for liquor, room service, savouries & bookings", info: "One desk that tracks drinks, room service, snacks and bookings." },
          { name: "Manpower: control room & travel desk", info: "Staff to run the control room and the guest travel desk." },
          { name: "Driver & staff food and stay", info: "Meals and rooms for drivers and staff travelling with guests." },
          { name: "Massage room", info: "A room where guests can relax with a massage." },
          { name: "Beauty parlour for 40–50 female guests", info: "An in-house salon to get 40–50 guests ready for the functions." },
          { name: "Games room: roulette tokens & playing cards", info: "A games room with roulette, cards and tokens for guests." },
          { name: "Event-wise SMS alerts", info: "Guests get timings and venues for each function by SMS." },
          { name: "Return gifts to suit your budget & taste", info: "Thank-you gifts for guests, picked to match your style and budget." },
        ],
      },
      {
        name: "Cake & chocolate",
        items: [
          { name: "Wedding cake", info: "A tiered wedding cake for the celebration." },
          { name: "Designer cake", info: "A custom-designed cake made to your theme." },
          { name: "Chocolate counter", info: "A live chocolate station with fountains and treats." },
        ],
      },
      {
        name: "Wedding favours",
        items: [
          { name: "Standard favours", info: "Simple, elegant gifts for every guest." },
          { name: "Customised favours", info: "Gifts personalised with your names, date or theme." },
          { name: "Premium hampers", info: "Luxury gift hampers for close family and VIP guests." },
        ],
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
          { name: "DJ", info: "A DJ to keep the dance floor full all night." },
          { name: "Female DJ", info: "A female DJ to run the music for your event." },
          { name: "Live bands", info: "Live bands performing at your function." },
          { name: "Celebrity performers", info: "Well-known artists performing at your wedding." },
          { name: "Celebrity management", info: "We handle booking, contracts and on-site care for celebrity guests." },
          { name: "International acts", info: "Performers from abroad for a show-stopping moment." },
          { name: "Dance troupes", info: "Professional dancers for performances and entries." },
          { name: "Singers", info: "Solo singers for sufi, Bollywood, Punjabi or classical sets." },
          { name: "Anchors & emcees", info: "A host who runs the show and keeps guests engaged." },
          { name: "Dhol & percussionists", info: "Dhol players and drummers to lift the energy." },
          { name: "Acoustic performers", info: "Soft live music, perfect for cocktails or dinner." },
          { name: "Pianists", info: "A pianist for an elegant musical backdrop." },
          { name: "Salsa bands", info: "A Latin band to get guests dancing salsa." },
          { name: "Solo performers", info: "Individual acts like magicians, instrumentalists or artists." },
          { name: "Group dance", info: "Group dance performances by family and friends, choreographed for you." },
          { name: "Comedian (breakfast / hi-tea)", info: "A stand-up comedian to liven up a breakfast or hi-tea." },
          { name: "Military band", info: "A uniformed brass band for a grand, regal touch." },
          { name: "Harpists", info: "A harpist for a graceful, live musical backdrop." },
          { name: "Bride & groom entry", info: "A planned, show-stopping entry for the couple." },
          { name: "Jaimala concepts", info: "Creative ideas and setups for the garland exchange." },
          { name: "Choreography", info: "A choreographer to teach the couple and family their dances." },
          { name: "Folk dances", info: "Traditional folk performers like bhangra and giddha troupes." },
          { name: "Sound, light & trussing", info: "Speakers, stage lights and the frames that hold them up." },
          { name: "LED walls", info: "Large LED screens for visuals, videos and live feeds." },
          { name: "LED bar", info: "A glowing bar counter that lights up the party." },
          { name: "LED dance floor", info: "A light-up dance floor that changes colours." },
          { name: "Wooden dance floor", info: "A classic polished wooden dance floor." },
          { name: "Flex dance floor", info: "A printed vinyl dance floor with your custom design or monogram." },
          { name: "Sharpees", info: "Moving beam lights that cut sharp beams through the air." },
          { name: "LED lights", info: "Colour-changing LED lights for the stage and venue." },
          { name: "Linear & speakers", info: "Line-array speakers for clear, powerful sound across the venue." },
          { name: "Base", info: "Bass speakers for a dance floor you can feel." },
          { name: "LED dhol", info: "A light-up dhol that glows as it's played." },
          { name: "Stage platform", info: "A raised platform for performers or the couple." },
        ],
      },
      {
        name: "Band baaja & ghodiwala",
        items: [
          { name: "Band baaja", info: "A traditional brass band to lead the baraat." },
          { name: "Ghodi", info: "A decorated mare for the groom to ride." },
          { name: "Dhol", info: "Dhol players to set the baraat's beat." },
          { name: "Lights & chhatar", info: "Lights and a decorative umbrella carried with the groom." },
          { name: "Theme entry", info: "A themed baraat arrival designed around your idea." },
          { name: "Shehnai", info: "Shehnai players for an auspicious, traditional sound." },
          { name: "Taasha & naperi", info: "Taasha drums and naperi horns for a festive procession." },
          { name: "Baggi with horses", info: "A horse-drawn carriage for the groom's arrival." },
          { name: "Palki", info: "A decorated palanquin for a royal entry." },
          { name: "Phoolon ki chadar", info: "A canopy of flowers held over the bride as she walks in." },
          { name: "Mobile DJ", info: "A DJ on wheels that moves with the baraat." },
        ],
      },
      {
        name: "Baraat welcome",
        items: [
          { name: "Pataka", info: "Firecrackers to greet the baraat as it arrives." },
          { name: "Pearl mala", info: "Pearl garlands to welcome the groom's family." },
          { name: "Flower garlands", info: "Fresh flower garlands for the milni and welcome." },
          { name: "Brooch", info: "Brooches for the groom's side as a mark of welcome." },
          { name: "Floral jewellery", info: "Jewellery made of fresh flowers for the bride and family." },
          { name: "Pagdi / safa assembly", info: "Experts who tie matching safas for the baraat." },
          { name: "Cold fireworks", info: "Safe, smokeless sparkler fountains for big moments." },
        ],
      },
      {
        name: "Luxury car rental",
        items: [
          { name: "Vintage car", info: "A classic vintage car for the couple's arrival or departure." },
          { name: "Limousine", info: "A limousine for a luxurious ride." },
        ],
      },
      {
        name: "Transportation",
        items: [
          { name: "Guest shuttles", info: "Buses and cars that move guests between the hotel and venues." },
        ],
      },
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
          { name: "Bridal", info: "Complete bridal makeup and look for each function." },
          { name: "Party", info: "Makeup for party and function looks." },
          { name: "Family", info: "Makeup for mothers, sisters and close family." },
          { name: "Pre-wedding shoot", info: "Makeup and styling for your pre-wedding shoot." },
          { name: "Basic, HD & airbrush makeovers", info: "Choose the finish: classic, camera-ready HD or long-lasting airbrush." },
          { name: "Hairstyling", info: "Hairdos to complete every look." },
          { name: "Nail art", info: "Manicures and nail designs for the bride and family." },
          { name: "Parlour in hotel", info: "A beauty parlour set up at the hotel so no one has to travel." },
        ],
      },
      {
        name: "Mehendi",
        items: [
          { name: "Bridal", info: "Detailed bridal mehendi on hands and feet." },
          { name: "Family (40–50 people)", info: "Mehendi artists for 40–50 family members and guests." },
          { name: "Groom", info: "A simple, elegant mehendi design for the groom." },
        ],
      },
      {
        name: "Photography",
        items: [
          { name: "Pre-wedding shoot", info: "A styled photoshoot of the couple before the wedding." },
          { name: "Wedding day photography", info: "Full coverage of your wedding day in photos." },
          { name: "Pre-function photography", info: "Photos of the mehendi, haldi, sangeet and other functions." },
          { name: "Photo booth", info: "A themed spot with props where guests snap fun photos." },
          { name: "Personal assistant", info: "A helper who stays with the couple and keeps the shoot on schedule." },
          { name: "Frame canvas", info: "Your favourite photos printed on framed canvas." },
          { name: "Wedding website", info: "A website to share your story, schedule and photos with guests." },
          { name: "Pre-wedding shoot makeup", info: "Makeup and hair for the pre-wedding shoot." },
        ],
      },
      {
        name: "Invitation cards",
        items: [
          { name: "Video invites", info: "Animated video invitations to share on WhatsApp and social media." },
          { name: "Invite cards & boxes", info: "Printed invitation cards and gift boxes." },
          { name: "Silver invite for samdhi", info: "A special silver invitation for the in-laws." },
          { name: "Wedding itinerary", info: "A printed schedule of all the functions for guests." },
          { name: "Theme milni envelopes", info: "Themed envelopes for the shagun given at the milni." },
        ],
      },
      {
        name: "Pandit / priest",
        items: [
          { name: "Pandit ji", info: "A priest to perform the wedding rituals." },
          { name: "Puja samagri kit", info: "Every item needed for the ceremonies, in one kit." },
        ],
      },
      {
        name: "Permissions & licence",
        items: [
          { name: "Police NOC", info: "A no-objection certificate from the police for your event." },
          { name: "DJ / sound permission", info: "The permit needed to play music at your venue." },
          { name: "Liquor licence", info: "We arrange the permit needed to serve alcohol at your event." },
        ],
      },
      {
        name: "Security & valet",
        items: [
          { name: "Security", info: "Trained guards to keep the venue and guests safe." },
          { name: "Valet parking", info: "Valets who park and bring back guests' cars." },
        ],
      },
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
    category: "Décor",
    ...photo(
      decor,
      "Gold stage with a flower-crowned sculpted face, golden deer and lanterns",
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
    category: "Haldi",
    ...photo(
      carnivalHaldiTheme,
      "Carnival-style haldi entrance of gold and pink heart arches over a striped aisle",
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
    category: "Celebrations",
    ...photo(
      sangriaBar,
      "Sangria bar with a floral-print counter set up on a garden lawn",
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
      vintageCar,
      "Groom and his brother in a flower-decked red vintage convertible",
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
    category: "Celebrations",
    ...photo(
      cake,
      "Tiered white wedding cake framed by glowing arches and flowers",
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
