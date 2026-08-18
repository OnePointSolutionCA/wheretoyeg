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
  active: boolean;
  date_listed: string;
  reviews?: Review[];
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
