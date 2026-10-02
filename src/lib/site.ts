export const SITE = {
  name: "WhereToYEG",
  domain: "wheretoyeg.ca",
  url: "https://wheretoyeg.ca",
  tagline: "Find the good stuff.",
  description:
    "Edmonton's local business directory. Discover the best restaurants, barbers, cafes, and hidden gems across YEG.",
  /** Shown to visitors as our contact address. */
  email: "hello@wheretoyeg.ca",
  /** Where mail actually delivers — form submissions + mailto links land here. */
  deliveryEmail: "info@onepointsolutionsca.com",
  social: {
    instagram: "https://instagram.com/wheretoyeg",
    tiktok: "https://tiktok.com/@wheretoyeg",
  },
  neighborhoods: [
    "Downtown",
    "Whyte Ave",
    "Jasper Ave",
    "124 Street",
    "West Edmonton",
    "South Edmonton",
    "Mill Woods",
    "Windermere",
    "Sherwood Park",
    "St. Albert",
    "Spruce Grove",
    "North Edmonton",
    "Beverly",
    "Castle Downs",
    "Beaumont",
  ],
  popularSearches: [
    { label: "Halal", href: "/restaurants?amenity=Halal" },
    { label: "Shawarma", href: "/restaurants/shawarma" },
    { label: "Barbers", href: "/barbers" },
    { label: "Coffee", href: "/cafes-coffee-shops" },
    { label: "Dentists", href: "/medical/dentists" },
    { label: "Auto repair", href: "/auto-repair" },
    { label: "Gyms", href: "/gyms-fitness" },
    { label: "Things to do", href: "/activities-fun" },
  ],
};
