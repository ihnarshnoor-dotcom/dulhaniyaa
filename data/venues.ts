/**
 * Venue listings for /venue and /venue/<slug>.
 * DUMMY DATA: made-up venues to shape the page until the real list arrives. Swap these entries out freely;
 * the filters build their options from whatever is listed here.
 */

export const venueTypes = [
  "Banquet hall",
  "Farmhouse",
  "Hotel",
  "Lawn",
  "Resort",
  "Palace",
] as const;
export type VenueType = (typeof venueTypes)[number];

export const venueSettings = ["Indoor", "Outdoor", "Indoor & outdoor"] as const;
export type VenueSetting = (typeof venueSettings)[number];

/** Every amenity a venue can tick. The filter panel shows them in this order. */
export const venueAmenities = [
  "Parking",
  "Rooms on site",
  "Alcohol allowed",
  "Outside catering allowed",
  "Outside décor allowed",
  "In-house décor",
  "DJ allowed",
  "Pool",
  "Air conditioned",
  "Wheelchair access",
] as const;
export type VenueAmenity = (typeof venueAmenities)[number];

export type VenueSpace = {
  name: string;
  setting: "Indoor" | "Outdoor";
  seated: number;
  floating: number;
};

export type Venue = {
  slug: string;
  name: string;
  type: VenueType;
  city: string;
  area: string;
  rating: number;
  reviews: number;
  /** Per plate, in rupees. */
  vegPrice: number;
  nonVegPrice: number;
  /** Rent for the venue alone, if they charge it separately. */
  rentalFrom?: number;
  capacity: { min: number; max: number };
  rooms: number;
  setting: VenueSetting;
  amenities: VenueAmenity[];
  spaces: VenueSpace[];
  short: string;
  about: string;
  policies: { label: string; value: string }[];
  popular?: boolean;
};

export const venues: Venue[] = [
  {
    slug: "gulmohar-greens",
    name: "Gulmohar Greens",
    type: "Farmhouse",
    city: "Delhi",
    area: "Chhatarpur",
    rating: 4.7,
    reviews: 128,
    vegPrice: 2200,
    nonVegPrice: 2600,
    rentalFrom: 300000,
    capacity: { min: 150, max: 1200 },
    rooms: 6,
    setting: "Indoor & outdoor",
    amenities: ["Parking", "Rooms on site", "Alcohol allowed", "Outside décor allowed", "DJ allowed", "Pool", "Wheelchair access"],
    spaces: [
      { name: "The Great Lawn", setting: "Outdoor", seated: 800, floating: 1200 },
      { name: "Banyan Hall", setting: "Indoor", seated: 300, floating: 450 },
      { name: "Poolside Deck", setting: "Outdoor", seated: 120, floating: 200 },
    ],
    short: "A sprawling farmhouse with a lawn for the pheras and a poolside deck for the sangeet.",
    about:
      "Gulmohar Greens sits on four acres of lawns lined with old gulmohar trees. The main lawn takes a full baraat and a mandap with room to spare, the indoor hall covers rainy days, and the poolside deck is made for cocktail nights. Six suites on site keep the family close.",
    policies: [
      { label: "Timings", value: "Day 10 am – 4 pm · Night 7 pm – 1 am" },
      { label: "Advance to book", value: "30% of the estimate" },
      { label: "Cancellation", value: "Advance adjusted against a new date within 6 months" },
      { label: "Music", value: "Outdoor music until 10 pm, indoor until 1 am" },
    ],
    popular: true,
  },
  {
    slug: "the-ivory-courtyard",
    name: "The Ivory Courtyard",
    type: "Hotel",
    city: "Gurugram",
    area: "Golf Course Road",
    rating: 4.8,
    reviews: 214,
    vegPrice: 3200,
    nonVegPrice: 3800,
    capacity: { min: 100, max: 700 },
    rooms: 180,
    setting: "Indoor & outdoor",
    amenities: ["Parking", "Rooms on site", "Alcohol allowed", "In-house décor", "DJ allowed", "Pool", "Air conditioned", "Wheelchair access"],
    spaces: [
      { name: "Grand Ballroom", setting: "Indoor", seated: 450, floating: 700 },
      { name: "Courtyard", setting: "Outdoor", seated: 250, floating: 400 },
      { name: "Terrace Lounge", setting: "Outdoor", seated: 80, floating: 150 },
    ],
    short: "A five-star hotel with a pillarless ballroom and an open courtyard under fairy lights.",
    about:
      "The Ivory Courtyard pairs a pillarless ballroom with a marble courtyard, so the wedding and the reception can each have their own look without leaving the building. 180 rooms mean outstation guests stay where the party is.",
    policies: [
      { label: "Timings", value: "Flexible, slots of 6 hours" },
      { label: "Advance to book", value: "25% of the estimate" },
      { label: "Catering", value: "In-house only" },
      { label: "Décor", value: "In-house team or approved partners" },
    ],
    popular: true,
  },
  {
    slug: "sheesh-bagh-palace",
    name: "Sheesh Bagh Palace",
    type: "Palace",
    city: "Jaipur",
    area: "Amer Road",
    rating: 4.9,
    reviews: 96,
    vegPrice: 4500,
    nonVegPrice: 5200,
    rentalFrom: 1500000,
    capacity: { min: 100, max: 600 },
    rooms: 54,
    setting: "Indoor & outdoor",
    amenities: ["Parking", "Rooms on site", "Alcohol allowed", "In-house décor", "DJ allowed", "Pool"],
    spaces: [
      { name: "Darbar Hall", setting: "Indoor", seated: 200, floating: 300 },
      { name: "Mirror Courtyard", setting: "Outdoor", seated: 350, floating: 600 },
      { name: "Fort-view Terrace", setting: "Outdoor", seated: 120, floating: 200 },
    ],
    short: "A restored haveli palace with a mirror-work courtyard and views of the Aravallis.",
    about:
      "A restored 18th-century haveli with jharokhas, a mirror-work courtyard and a terrace that looks out to the hills. Made for a destination wedding over three days, with every guest staying on site.",
    policies: [
      { label: "Minimum stay", value: "Full buyout for 2 nights" },
      { label: "Advance to book", value: "50% of the estimate" },
      { label: "Catering", value: "In-house only" },
      { label: "Music", value: "Outdoor music until 10 pm" },
    ],
    popular: true,
  },
  {
    slug: "kesar-banquets",
    name: "Kesar Banquets",
    type: "Banquet hall",
    city: "Delhi",
    area: "Rajouri Garden",
    rating: 4.3,
    reviews: 342,
    vegPrice: 1400,
    nonVegPrice: 1700,
    capacity: { min: 100, max: 500 },
    rooms: 0,
    setting: "Indoor",
    amenities: ["Parking", "Alcohol allowed", "In-house décor", "DJ allowed", "Air conditioned", "Wheelchair access"],
    spaces: [
      { name: "Kesar Hall", setting: "Indoor", seated: 300, floating: 500 },
      { name: "Mehfil Room", setting: "Indoor", seated: 80, floating: 120 },
    ],
    short: "A fully air-conditioned banquet that does a warm, fuss-free celebration on any budget.",
    about:
      "Kesar Banquets is the easy choice for a city wedding: central, air conditioned, with valet parking and an in-house team that handles décor, food and DJ in one package.",
    policies: [
      { label: "Timings", value: "Day 11 am – 4 pm · Night 7 pm – 12 am" },
      { label: "Advance to book", value: "₹1,00,000" },
      { label: "Catering", value: "In-house only" },
      { label: "Décor", value: "In-house packages" },
    ],
  },
  {
    slug: "neelkamal-lawns",
    name: "Neelkamal Lawns",
    type: "Lawn",
    city: "Noida",
    area: "Sector 135",
    rating: 4.4,
    reviews: 87,
    vegPrice: 1600,
    nonVegPrice: 1900,
    rentalFrom: 150000,
    capacity: { min: 300, max: 2000 },
    rooms: 2,
    setting: "Outdoor",
    amenities: ["Parking", "Outside catering allowed", "Outside décor allowed", "DJ allowed"],
    spaces: [
      { name: "Main Lawn", setting: "Outdoor", seated: 1200, floating: 2000 },
      { name: "Side Lawn", setting: "Outdoor", seated: 300, floating: 500 },
    ],
    short: "Two open lawns that take a big guest list, with your own caterer and decorator welcome.",
    about:
      "Neelkamal Lawns is a blank canvas: two open lawns, parking for 400 cars and the freedom to bring your own caterer and decorator. Ideal for a big wedding that wants full control of the look.",
    policies: [
      { label: "Timings", value: "Night 7 pm – 1 am" },
      { label: "Advance to book", value: "40% of rent" },
      { label: "Catering", value: "Outside caterers allowed" },
      { label: "Rain plan", value: "Waterproof hangar on request" },
    ],
  },
  {
    slug: "aravali-retreat",
    name: "Aravali Retreat",
    type: "Resort",
    city: "Gurugram",
    area: "Sohna Road",
    rating: 4.6,
    reviews: 158,
    vegPrice: 2800,
    nonVegPrice: 3300,
    capacity: { min: 80, max: 900 },
    rooms: 72,
    setting: "Indoor & outdoor",
    amenities: ["Parking", "Rooms on site", "Alcohol allowed", "Outside décor allowed", "DJ allowed", "Pool", "Air conditioned"],
    spaces: [
      { name: "Lakeside Lawn", setting: "Outdoor", seated: 600, floating: 900 },
      { name: "Aravali Hall", setting: "Indoor", seated: 250, floating: 400 },
      { name: "Pool Garden", setting: "Outdoor", seated: 100, floating: 180 },
    ],
    short: "A weekend resort an hour from Delhi, with a lakeside lawn and 72 rooms for the family.",
    about:
      "Aravali Retreat turns a wedding into a weekend away: a lakeside lawn for the pheras, a pool garden for haldi, and 72 cottages so everyone wakes up at the venue.",
    policies: [
      { label: "Minimum stay", value: "30 rooms for 1 night" },
      { label: "Advance to book", value: "30% of the estimate" },
      { label: "Catering", value: "In-house only" },
      { label: "Music", value: "Outdoor music until 11 pm" },
    ],
    popular: true,
  },
  {
    slug: "chandni-mahal",
    name: "Chandni Mahal",
    type: "Banquet hall",
    city: "Faridabad",
    area: "Sector 21",
    rating: 4.1,
    reviews: 64,
    vegPrice: 1100,
    nonVegPrice: 1350,
    capacity: { min: 50, max: 350 },
    rooms: 4,
    setting: "Indoor",
    amenities: ["Parking", "Rooms on site", "In-house décor", "DJ allowed", "Air conditioned"],
    spaces: [
      { name: "Chandni Hall", setting: "Indoor", seated: 250, floating: 350 },
      { name: "Terrace", setting: "Indoor", seated: 60, floating: 100 },
    ],
    short: "A cosy hall for roka, mehendi and smaller weddings, with rooms for the bride's side.",
    about:
      "Chandni Mahal is sized for smaller functions: a roka, a mehendi or an intimate wedding. Four rooms on site give the bride a getting-ready suite.",
    policies: [
      { label: "Timings", value: "Day 11 am – 4 pm · Night 7 pm – 12 am" },
      { label: "Advance to book", value: "₹50,000" },
      { label: "Catering", value: "In-house only" },
      { label: "Alcohol", value: "Not allowed" },
    ],
  },
  {
    slug: "the-saffron-terrace",
    name: "The Saffron Terrace",
    type: "Hotel",
    city: "Delhi",
    area: "Aerocity",
    rating: 4.5,
    reviews: 189,
    vegPrice: 2900,
    nonVegPrice: 3400,
    capacity: { min: 50, max: 400 },
    rooms: 220,
    setting: "Indoor & outdoor",
    amenities: ["Parking", "Rooms on site", "Alcohol allowed", "In-house décor", "DJ allowed", "Air conditioned", "Wheelchair access"],
    spaces: [
      { name: "Saffron Ballroom", setting: "Indoor", seated: 280, floating: 400 },
      { name: "Sky Terrace", setting: "Outdoor", seated: 100, floating: 180 },
    ],
    short: "Five minutes from the airport, with a rooftop terrace made for cocktail nights.",
    about:
      "The Saffron Terrace is the easy pick when half the guest list is flying in: five minutes from the airport, 220 rooms and a rooftop terrace with city views for the cocktail night.",
    policies: [
      { label: "Timings", value: "Flexible, slots of 5 hours" },
      { label: "Advance to book", value: "25% of the estimate" },
      { label: "Catering", value: "In-house only" },
      { label: "Décor", value: "In-house team or approved partners" },
    ],
  },
  {
    slug: "baghicha-farms",
    name: "Baghicha Farms",
    type: "Farmhouse",
    city: "Ghaziabad",
    area: "Raj Nagar Extension",
    rating: 4.2,
    reviews: 51,
    vegPrice: 1300,
    nonVegPrice: 1600,
    rentalFrom: 100000,
    capacity: { min: 100, max: 800 },
    rooms: 3,
    setting: "Outdoor",
    amenities: ["Parking", "Rooms on site", "Outside catering allowed", "Outside décor allowed", "DJ allowed"],
    spaces: [
      { name: "Orchard Lawn", setting: "Outdoor", seated: 500, floating: 800 },
      { name: "Courtyard", setting: "Outdoor", seated: 150, floating: 250 },
    ],
    short: "A green farmhouse among mango trees, open to your own caterer and decorator.",
    about:
      "Baghicha Farms is a rustic farmhouse among mango trees with a big orchard lawn. Bring your own caterer and decorator, and use the three rooms for getting ready.",
    policies: [
      { label: "Timings", value: "Day or night, 8-hour slots" },
      { label: "Advance to book", value: "50% of rent" },
      { label: "Catering", value: "Outside caterers allowed" },
      { label: "Music", value: "Outdoor music until 10 pm" },
    ],
  },
  {
    slug: "jheel-kinara-resort",
    name: "Jheel Kinara Resort",
    type: "Resort",
    city: "Udaipur",
    area: "Lake Badi",
    rating: 4.8,
    reviews: 73,
    vegPrice: 4000,
    nonVegPrice: 4700,
    capacity: { min: 80, max: 500 },
    rooms: 90,
    setting: "Indoor & outdoor",
    amenities: ["Parking", "Rooms on site", "Alcohol allowed", "In-house décor", "DJ allowed", "Pool", "Air conditioned", "Wheelchair access"],
    spaces: [
      { name: "Lakefront Lawn", setting: "Outdoor", seated: 350, floating: 500 },
      { name: "Jharokha Hall", setting: "Indoor", seated: 200, floating: 300 },
      { name: "Sunset Ghat", setting: "Outdoor", seated: 80, floating: 120 },
    ],
    short: "A lakeside resort where the pheras happen on a ghat at sunset.",
    about:
      "Jheel Kinara sits right on the lake: a lawn on the water for the reception, a covered hall for rainy days and a stone ghat for pheras at sunset. 90 rooms take the whole wedding.",
    policies: [
      { label: "Minimum stay", value: "Full buyout for 2 nights" },
      { label: "Advance to book", value: "50% of the estimate" },
      { label: "Catering", value: "In-house only" },
      { label: "Music", value: "Outdoor music until 10 pm" },
    ],
  },
  {
    slug: "rang-mahal-convention",
    name: "Rang Mahal Convention",
    type: "Banquet hall",
    city: "Greater Noida",
    area: "Pari Chowk",
    rating: 4.0,
    reviews: 112,
    vegPrice: 1200,
    nonVegPrice: 1500,
    capacity: { min: 200, max: 1500 },
    rooms: 8,
    setting: "Indoor & outdoor",
    amenities: ["Parking", "Rooms on site", "Alcohol allowed", "Outside décor allowed", "DJ allowed", "Air conditioned", "Wheelchair access"],
    spaces: [
      { name: "Convention Hall", setting: "Indoor", seated: 800, floating: 1200 },
      { name: "Front Lawn", setting: "Outdoor", seated: 300, floating: 500 },
    ],
    short: "A large convention hall plus lawn for the big-guest-list wedding, at a friendly price.",
    about:
      "Rang Mahal Convention is built for scale: an air-conditioned hall for 1,200, a front lawn for the baraat and parking for 500 cars, at one of the friendliest per-plate rates around.",
    policies: [
      { label: "Timings", value: "Night 7 pm – 1 am" },
      { label: "Advance to book", value: "₹2,00,000" },
      { label: "Catering", value: "In-house only" },
      { label: "Décor", value: "Outside decorators allowed" },
    ],
  },
  {
    slug: "mehrab-lawns",
    name: "Mehrab Lawns",
    type: "Lawn",
    city: "Delhi",
    area: "GT Karnal Road",
    rating: 4.3,
    reviews: 78,
    vegPrice: 1700,
    nonVegPrice: 2000,
    rentalFrom: 200000,
    capacity: { min: 200, max: 1500 },
    rooms: 2,
    setting: "Outdoor",
    amenities: ["Parking", "Alcohol allowed", "Outside catering allowed", "Outside décor allowed", "DJ allowed"],
    spaces: [
      { name: "Mehrab Lawn", setting: "Outdoor", seated: 900, floating: 1500 },
    ],
    short: "One wide lawn framed by Mughal-style arches, ready for a grand baraat.",
    about:
      "Mehrab Lawns is one wide lawn framed by Mughal-style arches, with a long drive for the baraat and room for a big stage. Your caterer and decorator are welcome.",
    policies: [
      { label: "Timings", value: "Night 7 pm – 1 am" },
      { label: "Advance to book", value: "40% of rent" },
      { label: "Catering", value: "Outside caterers allowed" },
      { label: "Rain plan", value: "German hangar on request" },
    ],
  },
];

export const venueCities = [...new Set(venues.map((v) => v.city))];

export function findVenue(slug: string) {
  return venues.find((v) => v.slug === slug) ?? null;
}

export const inrFull = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/** "₹3 lakh", "₹15 lakh", "₹1.2 crore" for rents. */
export function inrShort(n: number) {
  if (n >= 10000000) return `₹${+(n / 10000000).toFixed(1)} crore`;
  if (n >= 100000) return `₹${+(n / 100000).toFixed(1)} lakh`;
  return inrFull(n);
}
