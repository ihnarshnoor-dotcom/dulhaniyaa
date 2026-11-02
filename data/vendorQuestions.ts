/**
 * ─────────────────────────────────────────────────────────────
 *  VENDOR Q&A (/vendors/<service>/questions)
 *
 *  A tap-through flow where the couple tells us what they want
 *  from each vendor. Their answers are emailed to the team.
 *  Keys must match the slugs in `b2b.services` (data/site.ts).
 *
 *  Each group is one screen. Each question has:
 *    label   – short name shown in the email
 *    ask     – the friendly question the couple sees
 *    options – the answers they can tap
 *    multi   – true if they can tap more than one
 *  Each group's icon is from lucide-react (https://lucide.dev/icons).
 * ─────────────────────────────────────────────────────────────
 */

import {
  Aperture,
  Armchair,
  Award,
  Briefcase,
  Brush,
  Building2,
  CalendarDays,
  Camera,
  Clock,
  ConciergeBell,
  Droplets,
  FileCheck,
  Flower2,
  Gift,
  Handshake,
  HardDrive,
  Images,
  Lightbulb,
  Martini,
  Package,
  Paintbrush,
  Palette,
  ShieldCheck,
  Sparkles,
  SunMoon,
  Users,
  Video,
  Wallet,
  Wine,
  KeyRound,
  Radio,
  ShieldUser,
  Siren,
  SquareParking,
  UserCheck,
  type LucideIcon,
} from "lucide-react";

export type Question = {
  label: string;
  ask: string;
  options: readonly string[];
  multi?: boolean;
};

export type QuestionGroup = {
  title: string;
  icon: LucideIcon;
  questions: Question[];
};

export type VendorQuestions = {
  /** Shown beside the service name at the top of the flow. */
  icon: LucideIcon;
  /** One line shown at the top of the flow. */
  intro: string;
  groups: QuestionGroup[];
};

// Answer sets used again and again.
const yesNo = ["Yes please", "Not needed", "Not sure yet"] as const;
const importance = ["Must-have", "Nice to have", "Doesn't matter"] as const;

export const vendorQuestions: Record<string, VendorQuestions> = {
  makeup: {
    icon: Brush,
    intro:
      "Tell us about your dream bridal look, and we'll find the artist who can make it last through photos, heat and happy tears.",
    groups: [
      {
        title: "Portfolio and experience",
        icon: Images,
        questions: [
          {
            label: "Similar bridal work",
            ask: "Should your artist have done brides with skin tones and features like yours?",
            options: importance,
          },
          {
            label: "Trial session",
            ask: "Would you like a trial before the big day?",
            options: yesNo,
          },
          {
            label: "Long-wear trial",
            ask: "Should the trial be on a similar kind of day, to see how it holds for 6 to 8 hours?",
            options: yesNo,
          },
        ],
      },
      {
        title: "Brands and products",
        icon: Package,
        questions: [
          {
            label: "Brand preference",
            ask: "Which kind of brands do you love?",
            options: [
              "Luxury (MAC, Huda, Charlotte Tilbury)",
              "Mid-range",
              "Whatever suits my skin",
              "I'll bring my own",
            ],
          },
          {
            label: "Own products",
            ask: "Would you like the artist to use some of your own products?",
            options: yesNo,
          },
          {
            label: "Skin type",
            ask: "How would you describe your skin?",
            options: ["Sensitive", "Oily", "Dry", "Combination", "Normal"],
            multi: true,
          },
          {
            label: "Makeup type",
            ask: "Airbrush or HD makeup?",
            options: [
              "Airbrush",
              "HD",
              "Traditional",
              "Let the artist suggest",
            ],
          },
          {
            label: "Hygiene",
            ask: "Sanitised brushes, disposable applicators and in-date products: how much does that matter?",
            options: importance,
          },
        ],
      },
      {
        title: "Your base",
        icon: Paintbrush,
        questions: [
          {
            label: "Skin prep",
            ask: "Should the artist start with proper skin prep: moisturiser and sunscreen?",
            options: yesNo,
          },
          {
            label: "Finish",
            ask: "What finish do you love?",
            options: [
              "Dewy and glowing",
              "Soft matte",
              "Natural, skin-like",
              "Full glam",
            ],
          },
          {
            label: "Flash-safe SPF",
            ask: "Do you want SPF that won't leave a white cast in flash photos?",
            options: importance,
          },
          {
            label: "Shade match",
            ask: "Shade matched to your neck and chest, not just your face?",
            options: importance,
          },
          {
            label: "Coverage",
            ask: "How much coverage feels like you?",
            options: ["Light", "Medium", "Full"],
          },
        ],
      },
      {
        title: "Lighting and photos",
        icon: Camera,
        questions: [
          {
            label: "Ceremony light",
            ask: "When is your main ceremony?",
            options: ["Daytime", "Evening", "Night", "Across the day"],
          },
          {
            label: "Venue type",
            ask: "Where will most of your photos be taken?",
            options: ["Indoor hall", "Outdoors", "Both"],
          },
          {
            label: "Flash test",
            ask: "Should the foundation be tested in natural light and with phone flash?",
            options: yesNo,
          },
        ],
      },
      {
        title: "Staying power",
        icon: Droplets,
        questions: [
          {
            label: "Waterproof",
            ask: "Waterproof, smudge-proof and tear-proof eyes and lips? (There will be tears!)",
            options: importance,
          },
          {
            label: "Weather",
            ask: "What weather are you expecting?",
            options: ["Hot and humid", "Pleasant", "Cold", "Not sure"],
          },
        ],
      },
      {
        title: "Touch-ups",
        icon: Briefcase,
        questions: [
          {
            label: "Touch-up plan",
            ask: "How would you like touch-ups handled?",
            options: [
              "Artist stays for a few hours",
              "Leave me a touch-up kit",
              "Both",
              "Not needed",
            ],
          },
          {
            label: "Kit contents",
            ask: "What should be in your touch-up kit?",
            options: ["Blotting papers", "Compact", "Lip colour", "Kajal"],
            multi: true,
          },
        ],
      },
      {
        title: "Logistics and budget",
        icon: Wallet,
        questions: [
          {
            label: "Budget",
            ask: "What's your bridal makeup budget?",
            options: [
              "Under ₹25k",
              "₹25k–50k",
              "₹50k–1L",
              "₹1L+",
              "Not sure yet",
            ],
          },
          {
            label: "Location",
            ask: "Where should the artist do your makeup?",
            options: ["At the venue", "At home", "At the artist's studio"],
          },
          { label: "Hair", ask: "Hair styling as well?", options: yesNo },
          {
            label: "Family makeup",
            ask: "How many family members need makeup too?",
            options: ["None", "1–3", "4–8", "More than 8"],
          },
          {
            label: "Events",
            ask: "Which events need a look?",
            options: [
              "Roka",
              "Haldi",
              "Mehendi",
              "Sangeet",
              "Wedding",
              "Reception",
            ],
            multi: true,
          },
        ],
      },
      {
        title: "Booking peace of mind",
        icon: ShieldCheck,
        questions: [
          {
            label: "Backup artist",
            ask: "Should there be a backup artist for emergencies?",
            options: importance,
          },
          {
            label: "Flexible cancellation",
            ask: "How important is a flexible cancellation policy?",
            options: importance,
          },
        ],
      },
      {
        title: "Getting glow-ready",
        icon: Sparkles,
        questions: [
          {
            label: "Skincare",
            ask: "Have you started a skincare routine for the wedding?",
            options: ["Yes, already", "Starting soon", "Need advice"],
          },
          {
            label: "Overall vibe",
            ask: "Last one! How do you want to feel when you look in the mirror?",
            options: [
              "Like me, just glowing",
              "Classic bride, red and gold",
              "Bold and glamorous",
              "Soft and dreamy",
            ],
          },
        ],
      },
    ],
  },

  decor: {
    icon: Flower2,
    intro:
      "Paint us a picture of your dream setting, and we'll match you with a decorator who can bring it to life, rain or shine.",
    groups: [
      {
        title: "Portfolio and experience",
        icon: Images,
        questions: [
          {
            label: "Real weddings",
            ask: "Should your decorator have real weddings (not just styled shoots) at venues like yours?",
            options: importance,
          },
          {
            label: "Venue familiarity",
            ask: "Have you booked your venue yet?",
            options: ["Yes", "Shortlisting", "Not yet"],
          },
          {
            label: "Venue experience",
            ask: "Would you prefer a decorator who has already worked at your venue?",
            options: importance,
          },
        ],
      },
      {
        title: "Theme and design",
        icon: Palette,
        questions: [
          {
            label: "Vibe",
            ask: "Which vibe makes your heart skip?",
            options: [
              "Royal and regal",
              "Boho and floral",
              "Minimal and modern",
              "Traditional and vibrant",
              "Pastel dreamy",
            ],
            multi: true,
          },
          {
            label: "Mock-up first",
            ask: "Would you like a mood board and 3D mock-up before you commit?",
            options: yesNo,
          },
          {
            label: "Match outfits",
            ask: "Should the décor match your outfits and traditions?",
            options: importance,
          },
        ],
      },
      {
        title: "Flowers and materials",
        icon: Flower2,
        questions: [
          {
            label: "Flowers",
            ask: "Fresh or artificial flowers?",
            options: [
              "All fresh",
              "Mostly fresh",
              "Mix of both",
              "Artificial is fine",
            ],
          },
          {
            label: "Favourite flowers",
            ask: "Any favourites?",
            options: [
              "Marigold",
              "Roses",
              "Orchids",
              "Jasmine",
              "Lilies",
              "Surprise me",
            ],
            multi: true,
          },
          {
            label: "Season",
            ask: "When is the wedding?",
            options: ["Summer", "Monsoon", "Winter", "Spring", "Not decided"],
          },
        ],
      },
      {
        title: "Lighting",
        icon: Lightbulb,
        questions: [
          {
            label: "Light types",
            ask: "Which lights would you love?",
            options: [
              "Fairy lights",
              "Chandeliers",
              "Lanterns",
              "Spotlights",
              "Candles",
            ],
            multi: true,
          },
          {
            label: "Tone",
            ask: "Warm or cool tones?",
            options: [
              "Warm and golden",
              "Cool and bright",
              "Let the decorator suggest",
            ],
          },
          {
            label: "Photo-ready",
            ask: "Should the lighting be planned around photos and video?",
            options: importance,
          },
        ],
      },
      {
        title: "The setup",
        icon: Armchair,
        questions: [
          {
            label: "Elements",
            ask: "What do you need decorated?",
            options: [
              "Stage",
              "Mandap",
              "Entrance",
              "Photo booth",
              "Seating",
              "Aisle",
            ],
            multi: true,
          },
          {
            label: "Guest flow",
            ask: "Should the layout keep guests moving and give the photographer clear angles?",
            options: importance,
          },
          {
            label: "Events",
            ask: "Which events need décor?",
            options: ["Haldi", "Mehendi", "Sangeet", "Wedding", "Reception"],
            multi: true,
          },
        ],
      },
      {
        title: "Venue logistics",
        icon: Building2,
        questions: [
          {
            label: "Indoor / outdoor",
            ask: "Indoors or outdoors?",
            options: ["Indoors", "Outdoors", "Both"],
          },
          {
            label: "Weather backup",
            ask: "Do you want a weather backup plan for outdoor events?",
            options: yesNo,
          },
          {
            label: "Permissions",
            ask: "Should the decorator handle power, permissions and fire safety with the venue?",
            options: yesNo,
          },
        ],
      },
      {
        title: "Budget and quote",
        icon: Wallet,
        questions: [
          {
            label: "Budget",
            ask: "What's your décor budget?",
            options: [
              "Under ₹2L",
              "₹2L–5L",
              "₹5L–10L",
              "₹10L+",
              "Not sure yet",
            ],
          },
          {
            label: "Itemised quote",
            ask: "Would you like an itemised quote with no hidden charges?",
            options: importance,
          },
          {
            label: "Change flexibility",
            ask: "How likely are last-minute changes?",
            options: ["Quite likely", "Maybe a few", "We'll stick to the plan"],
          },
        ],
      },
      {
        title: "Team and contract",
        icon: Handshake,
        questions: [
          {
            label: "On-site supervisor",
            ask: "An on-site supervisor and backup staff on the day?",
            options: importance,
          },
          {
            label: "Same person",
            ask: "Should the person you meet be the one who shows up?",
            options: importance,
          },
          {
            label: "Written list",
            ask: "A written list of every item promised?",
            options: importance,
          },
        ],
      },
    ],
  },

  "liquor-bar": {
    icon: Martini,
    intro:
      "Let's plan a bar your guests will talk about, licensed, safe and flowing till the last song.",
    groups: [
      {
        title: "Experience",
        icon: Award,
        questions: [
          {
            label: "Real weddings",
            ask: "Should your bar partner have run bars at real weddings like yours?",
            options: importance,
          },
          {
            label: "Venue rules",
            ask: "Does your venue have its own bar rules or an in-house bar?",
            options: ["Yes", "No", "Not sure"],
          },
        ],
      },
      {
        title: "Licences and permissions",
        icon: FileCheck,
        questions: [
          {
            label: "Licence",
            ask: "Should the bar partner arrange the event liquor licence?",
            options: [
              "Yes please",
              "We'll handle it",
              "Not sure what's needed",
            ],
          },
          {
            label: "Legal sourcing",
            ask: "Legally sourced stock with bills you can see?",
            options: importance,
          },
        ],
      },
      {
        title: "Menu and drinks",
        icon: Martini,
        questions: [
          {
            label: "Drinks",
            ask: "What should be on the menu?",
            options: [
              "Whisky",
              "Vodka",
              "Gin",
              "Rum",
              "Wine",
              "Beer",
              "Tequila",
            ],
            multi: true,
          },
          {
            label: "Tier",
            ask: "Which tier of spirits?",
            options: ["Premium", "Mid-range", "Mix of both"],
          },
          {
            label: "Signature cocktail",
            ask: "A signature cocktail named after the two of you?",
            options: yesNo,
          },
          {
            label: "Mocktails",
            ask: "A fun mocktail menu so everyone feels celebrated?",
            options: importance,
          },
          {
            label: "Events",
            ask: "Which events need a bar?",
            options: [
              "Cocktail night",
              "Sangeet",
              "Mehendi",
              "Wedding",
              "Reception",
            ],
            multi: true,
          },
        ],
      },
      {
        title: "Guests and stock",
        icon: Users,
        questions: [
          {
            label: "Drinking guests",
            ask: "Roughly how many guests will drink?",
            options: ["Under 50", "50–150", "150–300", "300+"],
          },
          {
            label: "Who buys",
            ask: "Who buys the liquor?",
            options: ["The bar partner", "We will", "Not decided"],
          },
          {
            label: "All-inclusive",
            ask: "Ice, mixers, garnishes and glassware included?",
            options: importance,
          },
        ],
      },
      {
        title: "Bar setup",
        icon: Wine,
        questions: [
          {
            label: "Counters",
            ask: "How many bar counters?",
            options: ["One", "Two", "Three or more", "Let them suggest"],
          },
          {
            label: "Themed bar",
            ask: "Should the bar's look match your décor?",
            options: importance,
          },
          {
            label: "Extras",
            ask: "Any fun extras?",
            options: [
              "Flair bartending",
              "Live mixology",
              "Shots station",
              "Hookah lounge",
              "None",
            ],
            multi: true,
          },
        ],
      },
      {
        title: "Team and service",
        icon: ConciergeBell,
        questions: [
          {
            label: "Staff",
            ask: "Trained, uniformed bartenders and servers?",
            options: importance,
          },
          {
            label: "Service style",
            ask: "How should drinks be served?",
            options: ["At the bar", "Servers walking around", "Both"],
          },
        ],
      },
      {
        title: "Safety first",
        icon: ShieldCheck,
        questions: [
          {
            label: "Responsible serving",
            ask: "Should the team gently handle guests who've had too much?",
            options: importance,
          },
          {
            label: "Age checks",
            ask: "Strict no-serving to anyone underage?",
            options: importance,
          },
          {
            label: "Rides home",
            ask: "Help arranging drivers or cabs for guests?",
            options: yesNo,
          },
        ],
      },
      {
        title: "Timing and budget",
        icon: Clock,
        questions: [
          {
            label: "Bar hours",
            ask: "How long should the bar stay open?",
            options: ["Up to 4 hours", "4–6 hours", "Till the party ends"],
          },
          {
            label: "Pricing model",
            ask: "How would you like it priced?",
            options: ["Per person", "Per hour", "Per bottle", "Not sure"],
          },
          {
            label: "Budget",
            ask: "What's your bar budget?",
            options: ["Under ₹1L", "₹1L–3L", "₹3L–6L", "₹6L+", "Not sure yet"],
          },
        ],
      },
      {
        title: "Contract",
        icon: Handshake,
        questions: [
          {
            label: "Breakages",
            ask: "Clarity on who pays for breakages and lost glassware?",
            options: importance,
          },
          {
            label: "Written inclusions",
            ask: "Every brand, quantity and inclusion in writing?",
            options: importance,
          },
        ],
      },
    ],
  },

  photography: {
    icon: Camera,
    intro:
      "Tell us how you want to remember it all, and we'll find the photographer who'll capture it exactly that way.",
    groups: [
      {
        title: "Style",
        icon: Aperture,
        questions: [
          {
            label: "Style",
            ask: "Which style do you love?",
            options: ["Candid", "Traditional", "Cinematic", "Editorial"],
            multi: true,
          },
          {
            label: "Full albums",
            ask: "Would you like to see full wedding albums, not just highlights, before choosing?",
            options: importance,
          },
        ],
      },
      {
        title: "Experience",
        icon: Award,
        questions: [
          {
            label: "Experience level",
            ask: "How experienced should your photographer be?",
            options: [
              "100+ weddings",
              "50+ weddings",
              "Talent matters more than numbers",
            ],
          },
          {
            label: "Similar ceremonies",
            ask: "Should they have shot ceremonies and venues like yours?",
            options: importance,
          },
        ],
      },
      {
        title: "Team and gear",
        icon: Video,
        questions: [
          {
            label: "Team size",
            ask: "How big a team?",
            options: [
              "Just a photographer",
              "Photo + video",
              "Full team with second shooter",
            ],
          },
          {
            label: "Backup gear",
            ask: "Backup cameras and gear on the day?",
            options: importance,
          },
        ],
      },
      {
        title: "Light and venue",
        icon: SunMoon,
        questions: [
          {
            label: "Tricky light",
            ask: "Which tricky lighting will they face?",
            options: [
              "Low-light halls",
              "Harsh midday sun",
              "Night functions",
              "None I know of",
            ],
            multi: true,
          },
          {
            label: "Own lights",
            ask: "Should they bring their own lights?",
            options: yesNo,
          },
        ],
      },
      {
        title: "Coverage",
        icon: CalendarDays,
        questions: [
          {
            label: "Events",
            ask: "Which events should be covered?",
            options: [
              "Roka",
              "Haldi",
              "Mehendi",
              "Sangeet",
              "Wedding",
              "Reception",
            ],
            multi: true,
          },
          {
            label: "Pre-wedding",
            ask: "A pre-wedding shoot too?",
            options: yesNo,
          },
          { label: "Drone", ask: "Drone shots?", options: yesNo },
        ],
      },
      {
        title: "What you'll get",
        icon: Gift,
        questions: [
          {
            label: "Deliverables",
            ask: "What would you love to receive?",
            options: [
              "Edited photos",
              "Printed album",
              "Teaser",
              "Highlight film",
              "Full video",
            ],
            multi: true,
          },
          {
            label: "Raw files",
            ask: "All the raw files as well?",
            options: yesNo,
          },
          {
            label: "Sneak peek",
            ask: "How soon would you like a sneak peek?",
            options: ["Within a day or two", "Within a week", "No rush"],
          },
        ],
      },
      {
        title: "Delivery and storage",
        icon: HardDrive,
        questions: [
          {
            label: "Delivery",
            ask: "How should the files reach you?",
            options: [
              "Online gallery",
              "Google Drive",
              "Pen drive / hard disk",
            ],
            multi: true,
          },
          {
            label: "Long backup",
            ask: "Should they keep backups for a year or more?",
            options: importance,
          },
        ],
      },
      {
        title: "Budget",
        icon: Wallet,
        questions: [
          {
            label: "Budget",
            ask: "What's your photo and video budget?",
            options: ["Under ₹1L", "₹1L–3L", "₹3L–6L", "₹6L+", "Not sure yet"],
          },
          {
            label: "Travel",
            ask: "Will the team need to travel and stay?",
            options: ["Yes, destination wedding", "No, it's local", "Not sure"],
          },
        ],
      },
      {
        title: "Contract",
        icon: Handshake,
        questions: [
          {
            label: "Backup photographer",
            ask: "A backup photographer if someone falls sick?",
            options: importance,
          },
          {
            label: "Usage rights",
            ask: "Can they post your photos publicly?",
            options: [
              "Yes, happily",
              "Only with our okay",
              "No, keep them private",
            ],
          },
        ],
      },
    ],
  },
  "security-valet": {
    icon: ShieldUser,
    intro:
      "Tell us what needs looking after, and we'll find a team that keeps your guests, gifts and cars safe while you dance the night away.",
    groups: [
      {
        title: "Experience",
        icon: Award,
        questions: [
          {
            label: "Wedding experience",
            ask: "Should the team have handled weddings of your size before?",
            options: importance,
          },
          {
            label: "Venue security",
            ask: "Does your venue already have its own security or valet?",
            options: ["Yes", "No", "Not sure"],
          },
        ],
      },
      {
        title: "The team",
        icon: UserCheck,
        questions: [
          {
            label: "Trained staff",
            ask: "Trained, uniformed and background-checked staff?",
            options: importance,
          },
          {
            label: "Licensed agency",
            ask: "A licensed security agency (PSARA)?",
            options: importance,
          },
          {
            label: "Women guards",
            ask: "Women guards for the bride's room and women guests?",
            options: yesNo,
          },
        ],
      },
      {
        title: "What to protect",
        icon: ShieldUser,
        questions: [
          {
            label: "Coverage",
            ask: "What should security keep an eye on?",
            options: [
              "Entry gate",
              "Gift and shagun table",
              "Bride's room",
              "Jewellery",
              "Stage",
              "Parking",
            ],
            multi: true,
          },
          {
            label: "Entry check",
            ask: "How should guests be let in?",
            options: [
              "Guest list check",
              "Invite or pass check",
              "Open entry",
              "Not sure",
            ],
          },
          {
            label: "Guests",
            ask: "How many guests are you expecting?",
            options: ["Under 200", "200–500", "500–1000", "1000+"],
          },
        ],
      },
      {
        title: "Crowd and safety",
        icon: Siren,
        questions: [
          {
            label: "Crowd control",
            ask: "Help managing the crowd during the baraat and big entries?",
            options: importance,
          },
          {
            label: "Emergency plan",
            ask: "A first-aid kit and an emergency plan agreed with the venue?",
            options: importance,
          },
          {
            label: "VIP guests",
            ask: "Any VIP guests who need extra care?",
            options: ["Yes", "No", "Maybe"],
          },
        ],
      },
      {
        title: "Valet parking",
        icon: SquareParking,
        questions: [
          {
            label: "Cars",
            ask: "Roughly how many cars will arrive?",
            options: ["Under 50", "50–150", "150–300", "300+"],
          },
          {
            label: "Parking spot",
            ask: "Where will the cars be parked?",
            options: [
              "At the venue",
              "A nearby lot",
              "On the street",
              "Not sure",
            ],
          },
          {
            label: "Shuttle",
            ask: "A shuttle from a far-off parking lot?",
            options: yesNo,
          },
          {
            label: "Events",
            ask: "Which events need valet and security?",
            options: [
              "Mehendi",
              "Sangeet",
              "Cocktail night",
              "Wedding",
              "Reception",
            ],
            multi: true,
          },
        ],
      },
      {
        title: "Car care",
        icon: KeyRound,
        questions: [
          {
            label: "Key tracking",
            ask: "Numbered tokens so every key goes back to the right guest?",
            options: importance,
          },
          {
            label: "Insurance",
            ask: "Insurance cover for any damage to guests' cars?",
            options: importance,
          },
          {
            label: "Licensed drivers",
            ask: "Valet drivers with valid licences and experience with luxury cars?",
            options: importance,
          },
        ],
      },
      {
        title: "Staying in touch",
        icon: Radio,
        questions: [
          {
            label: "Walkie-talkies",
            ask: "Walkie-talkies so the team stays connected?",
            options: importance,
          },
          {
            label: "Point of contact",
            ask: "One supervisor your family can call for anything?",
            options: importance,
          },
        ],
      },
      {
        title: "Timing and budget",
        icon: Wallet,
        questions: [
          {
            label: "Hours",
            ask: "How long do you need them for?",
            options: [
              "Up to 4 hours",
              "4–8 hours",
              "A full day",
              "Several days",
            ],
          },
          {
            label: "Budget",
            ask: "What's your security and valet budget?",
            options: [
              "Under ₹25k",
              "₹25k–75k",
              "₹75k–1.5L",
              "₹1.5L+",
              "Not sure yet",
            ],
          },
        ],
      },
      {
        title: "Contract",
        icon: Handshake,
        questions: [
          {
            label: "Liability",
            ask: "Clear terms on who's responsible for theft or damage?",
            options: importance,
          },
          {
            label: "Backup staff",
            ask: "Backup staff if someone doesn't show up?",
            options: importance,
          },
          {
            label: "In writing",
            ask: "Staff numbers, hours and duties all in writing?",
            options: importance,
          },
        ],
      },
    ],
  },
};
