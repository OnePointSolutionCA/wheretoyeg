export type Tier = "basic" | "featured" | "premium";

export type Hours = Record<
  "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday",
  string
>;

export type Review = {
  name: string;
  rating: number;
  date: string;
  comment: string;
};

export type Business = {
  name: string;
  slug: string;
  category: string;
  subcategory?: string;
  tier: Tier;
  logo?: string;
  description: string;
  address: string;
  neighborhood: string;
  phone?: string;
  email?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  google_maps_url?: string;
  hours: Hours;
  photos: string[];
  rating: number;
  review_count: number;
  price_range: "$" | "$$" | "$$$" | "$$$$";
  amenities: string[];
  tags: string[];
  latitude?: number;
  longitude?: number;
  featured?: boolean;
  /** Always shown first in category, service, area and search lists. */
  pinned?: boolean;
  active: boolean;
  date_listed: string;
  reviews?: Review[];
  /** True when description was built from listing data rather than written for the business. */
  generatedDescription?: boolean;
  /** Hand written page title for listings with a clear search intent (menu, halal, hours). Used before the template. */
  seo_title?: string;
  /** Hand written meta description; replaces the generated one when set. */
  seo_description?: string;
  /** Everyday name for questions and copy when the listed name is long ("Tajine House"). */
  short_name?: string;
  /** Short listing FAQ, only for facts the listing data supports. Rendered with FAQPage schema. */
  faq?: { q: string; a: string }[];
  /**
   * Per-platform delivery info.
   * For each platform: omit / false → don't show button.
   * true → show button with a search-by-name link.
   * string (URL) → show button that opens that direct link.
   */
  uber_eats?: boolean | string;
  doordash?: boolean | string;
  skipthedishes?: boolean | string;
};

export type Subcategory = {
  name: string;
  slug: string;
};

export type Category = {
  name: string;
  slug: string;
  description: string;
  icon: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  /** Hub H1 override, e.g. "Restaurants in Edmonton". The trailing "in Edmonton" is highlighted. */
  h1?: string;
  /** Guide links shown as chips under the hub intro. */
  guides?: { label: string; href: string }[];
  intro?: string;
  order?: number;
  active: boolean;
  subcategories?: Subcategory[];
};

export type Neighborhood = {
  name: string;
  slug: string;
  description: string;
  seo_title?: string;
};
