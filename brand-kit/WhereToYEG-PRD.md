# WhereToYEG — Product Requirements Document

## Version 1.0 | August 2026

---

## 1. Product Overview

**Name:** WhereToYEG
**Domain:** wheretoyeg.ca
**Tagline:** "Find the best local businesses in Edmonton."

WhereToYEG is a local business directory website for Edmonton, Alberta. Businesses pay a listing fee to be featured. Visitors browse and discover businesses by category. No user accounts or logins exist anywhere on the site — not for businesses, not for visitors.

Businesses submit their info through a Google Form and pay via e-transfer or Stripe payment link. The site team manually adds and manages all listings.

---

## 2. The Opportunity

People google "best barber Edmonton," "lash tech near me," "halal restaurants YEG" thousands of times per month. The results are Yelp, Google Maps, and generic blog posts. A dedicated, well-designed, SEO-optimized local directory targeting Edmonton-specific searches can rank on page one for hundreds of these keywords — especially for niche categories the big platforms don't cover well (lash techs, henna artists, halal food, home-based businesses).

Every category page and every business listing is a permanent SEO asset that drives free Google traffic and generates listing fee revenue indefinitely.

---

## 3. Target Users

**Visitors (searching for businesses):**
Edmonton residents looking for local services, restaurants, shops, and professionals. They arrive via Google search, social media, or word of mouth. They browse, find what they need, and leave. No account required.

**Businesses (paying to be listed):**
Small and medium businesses in Edmonton — restaurants, barber shops, lash techs, nail salons, dentists, gyms, home-based businesses, and service providers who want more local visibility. They pay a monthly or annual fee to be featured on the site.

---

## 4. What This Site Does

1. Displays business listings organized by category.
2. Each category page is SEO-optimized to rank for "[category] Edmonton" and "[category] near me" searches.
3. Each business has its own dedicated page with photos, description, contact info, location, and hours.
4. Visitors can browse by category or search by keyword.
5. A "Get Listed" page with a Google Form for businesses to submit their info.
6. The site team manages all content — no CMS login for businesses.

---

## 5. What This Site Does NOT Do

- No user accounts or logins for anyone.
- No online booking or scheduling.
- No e-commerce or payments on the site (payments handled externally via e-transfer or Stripe links).
- No user reviews or ratings (keep it simple — businesses control their own narrative).
- No mobile app. Website only.

---

## 6. Revenue Model

Businesses pay to be listed. Three tiers:

| Tier | Price | What They Get |
|---|---|---|
| Basic | $25/month or $200/year | Business name, description (up to 100 words), contact info, link to website/social, 1 photo, listed in category page |
| Featured | $50/month or $500/year | Everything in Basic plus: up to 5 photos, 250-word description, highlighted placement at top of category page, "Featured" badge, link to Google Maps |
| Premium | $100/month or $900/year | Everything in Featured plus: full dedicated business page with unlimited photos, 500-word description, embedded Google Map, social media links, "Premium" badge, featured on homepage rotation |

**Payment collection (all external, no payment system on site):**
- Interac e-transfer to the business email
- OR Stripe Payment Links (generate a unique link per tier, send to business, they pay, done)

---

## 7. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (Static Site Generation for SEO) |
| Styling | Tailwind CSS |
| Hosting | Vercel (free tier) |
| Domain/DNS | Cloudflare |
| Content Management | Markdown/MDX files in the codebase (no database) |
| Business Intake | Google Forms (embedded or linked) |
| Payments | Stripe Payment Links (external) or e-transfer |
| Analytics | Plausible (free self-hosted) or Vercel Analytics |
| Maps | Google Maps Embed (free) |
| Images | Stored in /public/images/ or Cloudflare Images |

**Why no database:**
At launch with fewer than 500 listings, storing business data as markdown files is simpler, faster, free, and easy for the team to update. Each business is a single .md file. To add a listing, add a file. To edit, edit the file. To remove, delete the file. Claude Code can handle all of this.

When the site grows past 500+ listings, migrate to Supabase (free tier). The architecture supports this migration without rebuilding the frontend.

---

## 8. Content Structure

### 8.1 How Business Data Is Stored

Each business listing is a markdown file with frontmatter:

```
/content/businesses/fades-by-mike.md
```

```markdown
---
name: "Fades by Mike"
slug: "fades-by-mike"
category: "barbers"
subcategory: "mens-haircuts"
tier: "featured"
description: "Premium men's barbershop in south Edmonton specializing in fades, lineups, and beard trims. Walk-ins welcome."
address: "10234 82 Ave NW, Edmonton, AB"
neighborhood: "Whyte Ave"
phone: "780-555-1234"
email: "info@fadesbymike.ca"
website: "https://fadesbymike.ca"
instagram: "https://instagram.com/fadesbymike"
facebook: ""
tiktok: ""
google_maps_url: "https://maps.google.com/?cid=XXXXX"
hours:
  monday: "9:00 AM - 7:00 PM"
  tuesday: "9:00 AM - 7:00 PM"
  wednesday: "9:00 AM - 7:00 PM"
  thursday: "9:00 AM - 8:00 PM"
  friday: "9:00 AM - 8:00 PM"
  saturday: "10:00 AM - 5:00 PM"
  sunday: "Closed"
photos:
  - "/images/businesses/fades-by-mike/1.jpg"
  - "/images/businesses/fades-by-mike/2.jpg"
  - "/images/businesses/fades-by-mike/3.jpg"
rating: 4.5
review_count: 12
price_range: "$$"
amenities:
  - "Walk-ins Welcome"
  - "Free Parking"
  - "Wheelchair Accessible"
  - "Cash & Card Accepted"
  - "Appointment Available"
tags:
  - "fades"
  - "lineups"
  - "beard trims"
  - "mens haircuts"
latitude: 53.5183
longitude: -113.4938
featured: true
active: true
date_listed: "2026-08-15"
reviews:
  - name: "Ahmed R."
    rating: 5
    date: "2026-08-10"
    comment: "Best fade I've ever gotten in Edmonton. Mike takes his time and gets it perfect every time."
  - name: "Jordan T."
    rating: 4
    date: "2026-07-22"
    comment: "Great cuts, sometimes a bit of a wait on Saturdays but worth it."
  - name: "Sarah K."
    rating: 5
    date: "2026-07-15"
    comment: "Took my son here for his first real haircut. Mike was amazing with him."
---
```

### 8.2 How Categories Are Stored

Each category is also a markdown file:

```
/content/categories/barbers.md
```

```markdown
---
name: "Barbers"
slug: "barbers"
description: "Find the best barber shops in Edmonton. Browse top-rated barbers for fades, lineups, beard trims, and classic cuts."
icon: "scissors"
seo_title: "Best Barbers in Edmonton | WhereToYEG"
seo_description: "Find the best barber shops in Edmonton. Top-rated barbers for fades, lineups, beard trims, and classic cuts near you."
seo_keywords:
  - "best barber Edmonton"
  - "barber near me Edmonton"
  - "barber shop YEG"
  - "mens haircut Edmonton"
  - "fade haircut Edmonton"
order: 1
active: true
---
```

---

## 9. Pages & Routes

| Route | Page | Purpose |
|---|---|---|
| `/` | Homepage | Hero section, search bar, featured businesses, category grid, popular searches |
| `/[category]` | Category page | Lists all businesses in that category with filters, SEO-optimized |
| `/[category]/map` | Category map view | All businesses in category shown as pins on a map |
| `/[category]/[business-slug]` | Business page | Full profile with photos, map, reviews, hours, amenities |
| `/map` | Full map view | All businesses across all categories on one map |
| `/get-listed` | Get Listed | Pricing tiers + embedded Google Form for submissions |
| `/review/[business-slug]` | Leave a Review | Google Form for submitting a review (no login) |
| `/submit-photo/[business-slug]` | Submit a Photo | Google Form for submitting user photos (no login) |
| `/about` | About | What WhereToYEG is, who runs it |
| `/contact` | Contact | Contact form or email for inquiries |
| `/privacy` | Privacy Policy | Required for AdSense eligibility and legal |
| `/terms` | Terms of Service | Terms for listed businesses |
| `/search?q=` | Search results | Keyword search across all businesses with filters |
| `/neighborhoods` | Neighborhoods | Browse businesses by Edmonton neighborhood |
| `/neighborhoods/[slug]` | Neighborhood page | All businesses in a specific neighborhood |

---

## 10. Launch Categories

Start with these 20 categories. Expand over time.

**Food & Drink:**
- Restaurants
- Halal Restaurants
- Cafes & Coffee Shops
- Bakeries
- Catering

**Beauty & Grooming:**
- Barbers
- Hair Salons
- Lash Techs
- Nail Salons
- Spas & Esthetics
- Henna Artists

**Health & Wellness:**
- Dentists
- Walk-in Clinics
- Gyms & Fitness
- Pharmacies

**Home & Auto:**
- Plumbers
- Electricians
- Cleaning Services
- Auto Repair

**Professional Services:**
- Photographers

---

## 11. Page Specs

### 11.1 Homepage

**Hero Section:**
- Large heading: "Find the Best Local Businesses in Edmonton"
- Subheading: "Your trusted guide to Edmonton's top shops, restaurants, services, and more."
- Search bar with two fields: "What are you looking for?" + "Neighborhood" (dropdown)
- Quick filter buttons below search: "Open Now" · "Top Rated" · "New This Week"
- Clean, modern design with Edmonton identity

**Popular Searches (Yelp-style):**
- Row of clickable pills showing trending searches: "Halal Food" · "Barbers" · "Lash Techs" · "Coffee Shops" · "Walk-in Clinics" · "Nail Salons"
- Each links to the relevant category page

**Category Grid:**
- Visual grid of all categories with icons and names
- Each card links to the category page
- Show count of businesses per category: "Barbers (12)"
- Show average rating for the category: "★ 4.6 avg"

**Featured Businesses:**
- Rotating section showing 6-8 Premium/Featured tier businesses
- Photo, business name, star rating, review count, neighborhood, price range, one-line description
- "Open Now" green badge if currently open
- Links to their business page

**Recent Reviews:**
- Section showing 3-4 of the most recent reviews site-wide
- Shows reviewer name, star rating, snippet of comment, business name
- Builds social proof and makes the site feel active

**Browse by Neighborhood:**
- Grid of Edmonton neighborhoods: Whyte Ave, Jasper Ave, Downtown, West Edmonton, South Side, Mill Woods, St. Albert, Sherwood Park, etc.
- Each links to a neighborhood page showing all businesses in that area

**Get Listed CTA:**
- Banner: "Own a business in Edmonton? Get listed on WhereToYEG."
- Stats: "Join 200+ Edmonton businesses already listed"
- Button linking to /get-listed

**Footer:**
- Links to About, Contact, Privacy, Terms
- All category links (SEO internal linking)
- All neighborhood links
- Social media links (Instagram, TikTok)
- "© 2026 WhereToYEG"

### 11.2 Category Page

URL: `wheretoyeg.ca/barbers`

**SEO Elements:**
- Title tag: "Best Barbers in Edmonton | WhereToYEG"
- Meta description: "Find the best barber shops in Edmonton. Top-rated barbers for fades, lineups, beard trims, and classic cuts near you."
- H1: "Best Barbers in Edmonton"
- Intro paragraph (2-3 sentences) about the category for SEO

**View Toggle:**
- Two view options at the top: "List View" (default) and "Map View"
- List View: standard card layout
- Map View: full-width Google Map with pins for every business in the category. Clicking a pin shows a mini card with name, rating, photo, and link to full page. URL changes to `/barbers/map`

**Filters Bar (Yelp-style):**
- **Price:** $ · $$ · $$$ · $$$$ (toggle buttons)
- **Rating:** Minimum star filter (3+, 4+, 4.5+)
- **Open Now:** Toggle on/off — filters to businesses currently open based on their hours data
- **Neighborhood:** Dropdown of Edmonton neighborhoods
- **Amenities:** Multi-select checkboxes — "Free Parking," "Wheelchair Accessible," "Walk-ins Welcome," "Delivery," "Halal," "Women-Owned," etc.
- **Sort By:** "Recommended" (featured first + highest rated) · "Highest Rated" · "Most Reviewed" · "Newest"
- All filters work client-side with JavaScript — no backend needed

**Business Listing Cards:**
- Featured/Premium businesses appear first with a badge
- Each card shows:
  - Business photo (left side or top)
  - Business name
  - Star rating (★★★★☆) with review count: "4.5 (12 reviews)"
  - Price range: "$$"
  - Neighborhood: "Whyte Ave"
  - Short description (one line)
  - Amenity tags: small pills showing "Walk-ins Welcome" · "Free Parking"
  - "Open Now" green badge OR "Closed" gray badge (calculated from hours)
- Click through to the full business page

**Sidebar or Bottom Section:**
- "Looking for a different service?" with links to related categories
- "Get your business listed" CTA
- "Popular searches in Barbers:" list of related search terms for SEO

### 11.3 Business Page (Premium Tier Only)

URL: `wheretoyeg.ca/barbers/fades-by-mike`

**SEO Elements:**
- Title tag: "Fades by Mike — Barber Shop in Edmonton | WhereToYEG"
- Meta description: "Fades by Mike is a premium men's barbershop on Whyte Ave, Edmonton. Specializing in fades, lineups, and beard trims. Walk-ins welcome."
- H1: Business name

**Header Section:**
- Business name (H1)
- Star rating display: ★★★★☆ 4.5 (12 reviews)
- Price range: "$$"
- Category link: "Barbers"
- Neighborhood link: "Whyte Ave"
- "Open Now" or "Closed · Opens at 9:00 AM" badge (auto-calculated from hours)
- Quick action buttons: "📞 Call" · "🌐 Website" · "📍 Directions" · "📤 Share"

**Photo Gallery:**
- Full-width photo carousel/grid (1-5 photos depending on tier)
- Lightbox view on click
- "📷 Add a Photo" button → links to Google Form for photo submissions

**Business Info Section:**
- Full description (100-500 words depending on tier)
- Service tags/specialties as clickable pills: "Fades" · "Lineups" · "Beard Trims"

**Amenities & Features Section (Yelp-style):**
- Grid of amenity badges with icons:
  - ✅ Walk-ins Welcome
  - ✅ Free Parking
  - ✅ Wheelchair Accessible
  - ✅ Cash & Card Accepted
  - ✅ Appointment Available
  - ✅ Women-Owned (if applicable)
  - ✅ Halal (if applicable)
  - ✅ Delivery Available (if applicable)
  - ✅ Free WiFi (if applicable)

**Hours Section:**
- Full weekly hours table
- Current status highlighted: "Open Now — Closes at 7:00 PM" in green, or "Closed — Opens Tomorrow at 9:00 AM" in red
- Hours for today are bold/highlighted

**Location & Map Section:**
- Full address displayed
- Embedded Google Map showing the business location with a pin
- "Get Directions" button that opens Google Maps with the address pre-filled

**Reviews Section:**
- Overall rating summary: large star display + total review count
- Rating breakdown bar chart:
  - 5 stars: ████████████ 8
  - 4 stars: █████ 3
  - 3 stars: █ 1
  - 2 stars: 0
  - 1 star: 0
- Individual review cards showing:
  - Reviewer first name + last initial (e.g., "Ahmed R.")
  - Star rating
  - Date
  - Review text
- Reviews sorted by most recent first
- "✍️ Write a Review" button → links to Google Form for review submissions

**Similar Businesses Section:**
- "You Might Also Like" — 3-4 other businesses in the same category
- Shows photo, name, rating, neighborhood
- Prioritizes Featured/Premium listings

**Share Section:**
- Share buttons: WhatsApp, Facebook, X/Twitter, Copy Link
- "Share this business with a friend"

**Contact Section:**
- Phone number (clickable on mobile)
- Email address
- Website link (opens in new tab)
- Social media links: Instagram, Facebook, TikTok (with icons)

**Basic and Featured tier businesses do NOT get a dedicated page.** They appear only as cards on the category page. This makes the Premium tier more valuable.

### 11.4 Get Listed Page

URL: `wheretoyeg.ca/get-listed`

**Content:**
- Headline: "Get Your Business on WhereToYEG"
- Subheading: "Join Edmonton's go-to local business directory."
- Three pricing tier cards side by side (Basic / Featured / Premium)
- Each card lists what's included
- CTA button on each card: "Get Started" → scrolls to the form

**Google Form (embedded):**
Fields:
- Business name
- Category (dropdown matching site categories)
- Your name
- Email
- Phone
- Business address
- Website URL
- Instagram/Facebook/TikTok links
- Business description (textarea)
- Upload photos (Google Forms supports file upload)
- Which tier are you interested in? (Basic / Featured / Premium)
- How did you hear about WhereToYEG?

After submission, the team reviews, confirms payment, and adds the listing.

### 11.5 Search

A search page with filters, similar to Yelp's search experience. No backend needed — static JSON index with client-side filtering.

**Search Bar:**
- Two inputs: "What are you looking for?" (keyword) + "Where?" (neighborhood dropdown or "All Edmonton")
- Auto-suggest as user types (matching business names and categories)

**Search Results:**
- Same card layout as category pages
- Same filters available: Price, Rating, Open Now, Neighborhood, Amenities
- Same sort options: Recommended, Highest Rated, Most Reviewed, Newest
- Map toggle: switch between list view and map view of results
- Results count: "Showing 14 results for 'shawarma' in Edmonton"

Implementation: Generate a search index JSON file at build time containing all business data. Use Fuse.js for fuzzy keyword matching.

### 11.6 User Reviews (No Login Required)

Reviews are submitted via Google Form and manually added by the team. No user accounts needed.

**How it works:**
1. Visitor clicks "Write a Review" on any business page
2. They're taken to a page (`/review/[business-slug]`) with an embedded Google Form
3. The form pre-fills the business name based on the URL
4. They submit: their first name, star rating (1-5), and a short comment
5. The team receives a notification, reviews for quality/spam, and adds approved reviews to the business's markdown file
6. Site redeploys and the review appears on the business page

**Review Google Form fields:**
| Field | Type | Required |
|---|---|---|
| Business Name | Pre-filled, read-only | Yes |
| Your First Name | Short text | Yes |
| Last Initial | Short text (1 character) | Yes |
| Your Email | Email (for verification, not displayed) | Yes |
| Star Rating | Multiple choice (1, 2, 3, 4, 5) | Yes |
| Your Review | Long text (500 char max) | Yes |
| Upload a Photo | File upload (optional) | No |

**Review moderation rules:**
- Team approves all reviews before publishing
- Reject spam, fake reviews, and offensive content
- Notify the business if they receive a negative review (optional courtesy)
- Minimum 10 words required for review text

**How reviews are stored:**
Reviews are stored directly in the business's markdown frontmatter (see Section 8.1). The team adds approved reviews manually or via Claude Code:

Tell Claude Code:
> "Add a review to fades-by-mike: Ahmed R., 5 stars, date 2026-08-10, comment: Best fade I've ever gotten in Edmonton."

**Rating calculation:**
The business's `rating` field in frontmatter is the average of all review ratings, rounded to one decimal. The `review_count` is the total number of reviews. Both are updated each time a review is added.

### 11.7 User Photo Submissions (No Login Required)

Same approach as reviews — Google Form, team moderation, manual addition.

1. Visitor clicks "Add a Photo" on a business page
2. Taken to `/submit-photo/[business-slug]` with embedded Google Form
3. They upload 1-3 photos with their first name
4. Team reviews, resizes/optimizes photos, and adds approved ones to the business's image folder
5. Site redeploys and photos appear in the gallery

User-submitted photos are labeled "Community Photo" to distinguish them from business-provided photos.

### 11.8 Map View

Two map view pages:

**Full Map (`/map`):**
- Full-screen Google Map showing ALL businesses across all categories as pins
- Sidebar or bottom sheet listing the businesses
- Category filter buttons at the top of the map
- Clicking a pin shows a popup card: business photo, name, rating, category, "View Details" link
- Color-coded pins by category (blue for food, red for beauty, green for health, etc.)

**Category Map (`/[category]/map`):**
- Same as full map but filtered to one category
- Example: `/barbers/map` shows only barber shops
- Toggle between list and map view on the category page switches the URL

**Implementation:**
- Use Google Maps JavaScript API (free up to 28,000 map loads/month)
- OR use Leaflet.js with OpenStreetMap tiles (completely free, no API key needed, no usage limits)
- Leaflet.js is recommended for launch to avoid any Google Maps costs

### 11.9 "Open Now" Feature

Every business card and business page shows whether the business is currently open.

**How it works:**
- Business hours are stored in the markdown frontmatter
- A client-side JavaScript function checks the current time (in Mountain Time / Edmonton timezone) against the business's hours
- Displays: "🟢 Open Now — Closes at 7:00 PM" or "🔴 Closed — Opens Tomorrow at 9:00 AM"
- On category pages, the "Open Now" filter hides all currently closed businesses

**Implementation:**
```javascript
function isOpenNow(hours) {
  const now = new Date().toLocaleString("en-US", { timeZone: "America/Edmonton" });
  const currentDay = new Date(now).toLocaleDateString("en-US", { weekday: "lowercase" });
  const todayHours = hours[currentDay];
  if (todayHours === "Closed") return false;
  // Parse open/close times and compare with current time
  // Return { isOpen: boolean, closesAt: string, opensNext: string }
}
```

### 11.10 Neighborhoods

Edmonton neighborhoods are a key browsing dimension.

**Neighborhoods page (`/neighborhoods`):**
- Grid of Edmonton neighborhood cards with name and business count
- Links to individual neighborhood pages

**Neighborhood page (`/neighborhoods/[slug]`):**
- Shows all businesses in that neighborhood across all categories
- Same filter bar as category pages
- Map view showing businesses in that area
- SEO title: "Best Businesses in Whyte Ave, Edmonton | WhereToYEG"

**Launch neighborhoods:**
- Downtown
- Whyte Ave / Old Strathcona
- Jasper Ave
- West Edmonton
- South Edmonton Common
- Mill Woods
- Windermere
- Sherwood Park
- St. Albert
- Spruce Grove
- Stony Plain
- Beaumont
- Leduc
- North Edmonton / Manning

Neighborhoods are stored as markdown files in `/content/neighborhoods/`:

```markdown
---
name: "Whyte Ave"
slug: "whyte-ave"
description: "Whyte Avenue is Edmonton's most vibrant neighborhood, packed with independent shops, restaurants, bars, and entertainment."
seo_title: "Best Businesses on Whyte Ave, Edmonton | WhereToYEG"
bounds:
  north: 53.5220
  south: 53.5150
  east: -113.4800
  west: -113.5100
---
```

---

## 12. SEO Strategy

### 12.1 URL Structure

Clean, keyword-rich URLs:
- `wheretoyeg.ca/barbers` — ranks for "barbers Edmonton"
- `wheretoyeg.ca/halal-restaurants` — ranks for "halal restaurants Edmonton"
- `wheretoyeg.ca/lash-techs` — ranks for "lash tech Edmonton"
- `wheretoyeg.ca/barbers/fades-by-mike` — ranks for "Fades by Mike Edmonton"

### 12.2 Every Category Page Targets These Search Patterns

For each category (example: barbers):
- "best barbers in Edmonton"
- "barber near me Edmonton"
- "barber shop Edmonton"
- "mens haircut Edmonton"
- "fade haircut Edmonton"
- "barber shop open now Edmonton"

The category page title, H1, meta description, intro paragraph, and URL slug all target these keywords naturally.

### 12.3 Schema.org Markup

Every business listing includes LocalBusiness structured data:

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Fades by Mike",
  "description": "Premium men's barbershop...",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "10234 82 Ave NW",
    "addressLocality": "Edmonton",
    "addressRegion": "AB",
    "postalCode": "T6E 1Z8",
    "addressCountry": "CA"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 53.5183,
    "longitude": -113.4938
  },
  "telephone": "780-555-1234",
  "url": "https://fadesbymike.ca",
  "openingHours": "Mo-Fr 09:00-19:00, Sa 10:00-17:00",
  "image": "https://wheretoyeg.ca/images/businesses/fades-by-mike/1.jpg",
  "priceRange": "$$",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.5",
    "reviewCount": "12",
    "bestRating": "5",
    "worstRating": "1"
  },
  "review": [
    {
      "@type": "Review",
      "author": { "@type": "Person", "name": "Ahmed R." },
      "datePublished": "2026-08-10",
      "reviewRating": { "@type": "Rating", "ratingValue": "5" },
      "reviewBody": "Best fade I've ever gotten in Edmonton."
    }
  ]
}
```

This helps Google show rich results with star ratings, review counts, and business info directly in search. The aggregate rating and reviews in Schema markup significantly improve click-through rates from search results.

### 12.4 Sitemap & Indexing

- Auto-generate sitemap.xml at build time including all category and business pages
- Submit to Google Search Console
- Each new listing automatically appears in the sitemap on next deploy

### 12.5 Blog (Phase 2)

Add SEO-driven blog posts that link to category pages:

- "Top 10 Barber Shops in Edmonton (2026)"
- "Best Halal Restaurants in Edmonton You Need to Try"
- "Where to Get the Best Lashes in Edmonton"
- "Edmonton's Hidden Gem Cafes"

Each post links to the relevant businesses on the site and targets long-tail keywords.

---

## 13. UI/UX Guidelines

**Design Direction:**
- Clean, modern, local feel. Not corporate — this is Edmonton's community directory.
- Mobile-first. Most visitors will find category pages via Google on their phone.
- Fast. Static site generation means every page loads instantly.
- Photography-forward. Business photos are the hero, not text.

**Color Palette:**
- Primary: Deep blue (#1E3A5F) — trustworthy, professional
- Accent: Warm amber/gold (#F59E0B) — energy, local warmth
- Background: White (#FFFFFF) and light gray (#F8FAFC)
- Text: Dark slate (#1E293B)
- Success/Active: Green (#22C55E)

**Typography:**
- Display/Headings: Plus Jakarta Sans (bold, modern, friendly)
- Body: Inter (clean, readable)

**Category Icons:**
- Use Lucide icons for each category (scissors for barbers, utensils for restaurants, etc.)

**Business Cards (Yelp-style):**
- Rounded corners, subtle shadow
- Business photo on the left (horizontal card) or top (vertical card)
- Name, star rating with review count, price range
- Neighborhood, one-line description
- Amenity tag pills
- "Open Now" green dot or "Closed" gray text
- Featured badge if applicable

**Star Ratings:**
- Use filled/empty star icons from Lucide
- Gold/amber color (#F59E0B) for filled stars
- Gray (#D1D5DB) for empty stars
- Half-star support for .5 ratings
- Always show rating number + review count: "★ 4.5 (12)"

**Open/Closed Badges:**
- Open: Green dot + "Open Now" in green text (#22C55E)
- Closed: Gray dot + "Closed" in gray text (#9CA3AF)
- On business page, also show when it opens/closes next

**Price Range:**
- Display as $, $$, $$$, $$$$ in dark text
- Unselected price levels in light gray
- Tooltip on hover: $ = "Under $15" · $$ = "$15-30" · $$$ = "$30-60" · $$$$ = "$60+"

**Amenity Tags:**
- Small rounded pills with icons
- Light background with colored text
- Consistent icon set from Lucide

**Filter Bar:**
- Horizontal scrolling on mobile
- Sticky at top of page when scrolling on category pages
- Active filters highlighted with primary color
- "Clear All" button when any filter is active

**Map Pins:**
- Custom colored pins by category
- Popup card on click with photo, name, rating, link

**Review Cards:**
- Reviewer name in bold
- Star rating inline
- Date in gray
- Review text below
- Clean separator between reviews

**Featured/Premium Badges:**
- Small amber badge: "Featured" or "Premium"
- Appears on the business card and business page

---

## 14. File & Folder Structure

```
wheretoyeg/
├── src/
│   ├── app/
│   │   ├── page.tsx                      # Homepage
│   │   ├── layout.tsx                    # Root layout
│   │   ├── [category]/
│   │   │   ├── page.tsx                  # Category listing page
│   │   │   └── [slug]/
│   │   │       └── page.tsx              # Individual business page
│   │   ├── get-listed/
│   │   │   └── page.tsx                  # Pricing + Google Form
│   │   ├── search/
│   │   │   └── page.tsx                  # Search results
│   │   ├── about/
│   │   │   └── page.tsx
│   │   ├── contact/
│   │   │   └── page.tsx
│   │   ├── privacy/
│   │   │   └── page.tsx
│   │   └── terms/
│   │       └── page.tsx
│   ├── components/
│   │   ├── Navbar.tsx                    # Site navigation with search
│   │   ├── Footer.tsx
│   │   ├── SearchBar.tsx                 # Dual-input search (keyword + neighborhood)
│   │   ├── SearchSuggestions.tsx         # Auto-suggest dropdown
│   │   ├── CategoryGrid.tsx             # Homepage category grid
│   │   ├── CategoryCard.tsx             # Single category card
│   │   ├── BusinessCard.tsx             # Business listing card with rating, price, open now
│   │   ├── BusinessGallery.tsx          # Photo carousel/grid with lightbox
│   │   ├── BusinessHours.tsx            # Hours table with "Open Now" indicator
│   │   ├── BusinessMap.tsx              # Single business embedded map
│   │   ├── MapView.tsx                  # Full map view with pins (Leaflet.js)
│   │   ├── MapPin.tsx                   # Individual map pin with popup card
│   │   ├── StarRating.tsx              # Star rating display (★★★★☆)
│   │   ├── RatingBreakdown.tsx         # Rating bar chart (5 star, 4 star, etc.)
│   │   ├── ReviewCard.tsx              # Individual review display
│   │   ├── ReviewsList.tsx             # List of reviews with summary
│   │   ├── OpenNowBadge.tsx            # Green/red open/closed indicator
│   │   ├── PriceRange.tsx              # $, $$, $$$ display
│   │   ├── AmenityTags.tsx             # Grid of amenity badges with icons
│   │   ├── FilterBar.tsx               # Price, rating, open now, neighborhood filters
│   │   ├── SortDropdown.tsx            # Sort by recommended, rating, reviews, newest
│   │   ├── ViewToggle.tsx              # List view / Map view toggle
│   │   ├── SimilarBusinesses.tsx       # "You Might Also Like" section
│   │   ├── PopularSearches.tsx         # Trending search pills
│   │   ├── RecentReviews.tsx           # Homepage recent reviews section
│   │   ├── NeighborhoodGrid.tsx        # Neighborhood browsing grid
│   │   ├── FeaturedBadge.tsx           # Featured/Premium badge
│   │   ├── PricingTiers.tsx            # Pricing cards on get-listed page
│   │   ├── GetListedCTA.tsx            # CTA banner component
│   │   ├── ShareButtons.tsx            # WhatsApp, Facebook, X, Copy Link
│   │   └── QuickActions.tsx            # Call, Website, Directions, Share buttons
│   ├── lib/
│   │   ├── businesses.ts                # Load and query business markdown files
│   │   ├── categories.ts                # Load and query category files
│   │   ├── neighborhoods.ts             # Load and query neighborhood files
│   │   ├── search.ts                    # Search index builder (Fuse.js)
│   │   ├── openNow.ts                   # Calculate open/closed status from hours
│   │   ├── ratings.ts                   # Calculate average ratings from reviews
│   │   └── filters.ts                   # Client-side filter logic
│   └── styles/
│       └── globals.css                  # Tailwind base styles
├── content/
│   ├── businesses/                      # All business .md files
│   │   ├── fades-by-mike.md
│   │   ├── sams-shawarma.md
│   │   └── ...
│   ├── categories/                      # All category .md files
│   │   ├── barbers.md
│   │   ├── restaurants.md
│   │   ├── halal-restaurants.md
│   │   └── ...
│   └── neighborhoods/                   # All neighborhood .md files
│       ├── whyte-ave.md
│       ├── downtown.md
│       ├── west-edmonton.md
│       └── ...
├── public/
│   ├── images/
│   │   ├── businesses/                  # Business photos organized by slug
│   │   │   ├── fades-by-mike/
│   │   │   │   ├── 1.jpg
│   │   │   │   └── 2.jpg
│   │   │   └── sams-shawarma/
│   │   │       ├── 1.jpg
│   │   │       └── 2.jpg
│   │   └── categories/                  # Category header images
│   ├── og-image.png                     # Social sharing image
│   └── favicon.ico
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── README.md
```

---

## 15. How To Add a New Business (Team Workflow)

This is the manual process for the team. No CMS needed.

**Step 1:** Business fills out Google Form and pays.

**Step 2:** Team member creates a new markdown file:
```
/content/businesses/[business-slug].md
```
Copy the frontmatter template from Section 8.1 and fill in the business info.

**Step 3:** Add business photos to:
```
/public/images/businesses/[business-slug]/
```
Name photos 1.jpg, 2.jpg, 3.jpg etc.

**Step 4:** Commit and push to GitHub. Vercel auto-deploys in ~60 seconds.

**Step 5:** The new business is now live on the site.

To edit a listing: edit the .md file, push to GitHub.
To remove a listing: delete the .md file, push to GitHub.
To add a new category: create a new .md file in /content/categories/.

---

## 16. Adding Businesses via Claude Code

The team can also use Claude Code to add listings without touching files manually:

Tell Claude Code:
> "Add a new business: Sams Shawarma, category: halal-restaurants, tier: featured, address: 10512 Jasper Ave, phone: 780-555-9876, description: Best shawarma in Edmonton. Fresh ingredients, homemade garlic sauce, open late. Instagram: @samsshawarma. Hours: Mon-Sat 11am-11pm, Sun 12pm-9pm."

Claude Code creates the markdown file, places photos if provided, and pushes to GitHub. Site updates automatically.

---

## 17. Google Form Setup

Create a Google Form with these fields:

| Field | Type | Required |
|---|---|---|
| Business Name | Short text | Yes |
| Your Name | Short text | Yes |
| Email Address | Email | Yes |
| Phone Number | Phone | Yes |
| Business Category | Dropdown (list all 20 categories) | Yes |
| Business Address | Short text | Yes |
| Neighborhood | Short text | No |
| Website URL | URL | No |
| Instagram URL | URL | No |
| Facebook URL | URL | No |
| TikTok URL | URL | No |
| Business Description | Long text (500 word max) | Yes |
| Business Hours | Long text | Yes |
| Upload Photos | File upload (max 5 files) | Yes |
| Listing Tier | Multiple choice (Basic $25/mo / Featured $50/mo / Premium $100/mo) | Yes |
| How did you hear about us? | Short text | No |

Set up Google Form email notifications so the team gets alerted on every submission.

### 17.2 Review Submission Google Form

Create a SEPARATE Google Form for reviews:

| Field | Type | Required |
|---|---|---|
| Business Name | Short text (pre-filled via URL parameter if possible) | Yes |
| Your First Name | Short text | Yes |
| Last Initial | Short text (1 character) | Yes |
| Your Email | Email (for verification, never displayed) | Yes |
| Star Rating | Multiple choice (★★★★★ 5, ★★★★ 4, ★★★ 3, ★★ 2, ★ 1) | Yes |
| Your Review | Long text (500 char max) | Yes |
| Upload a Photo (optional) | File upload | No |

### 17.3 Photo Submission Google Form

Create a THIRD Google Form for community photos:

| Field | Type | Required |
|---|---|---|
| Business Name | Short text (pre-filled via URL parameter if possible) | Yes |
| Your First Name | Short text | Yes |
| Upload Photos | File upload (max 3 files) | Yes |
| Caption (optional) | Short text | No |

### 17.4 Google Form Links on the Site

Each business page has two buttons linking to these forms:
- "✍️ Write a Review" → links to the Review Form with business name pre-filled
- "📷 Add a Photo" → links to the Photo Form with business name pre-filled

Google Forms supports URL pre-fill: `https://docs.google.com/forms/d/e/FORM_ID/viewform?entry.FIELD_ID=BusinessName`

This means visitors click the button, the form opens with the business name already filled in, and they just add their review or photo.

---

## 18. AdSense Eligibility Checklist

To qualify for Google AdSense and add display ads for bonus revenue:

- Minimum 15-20 pages of original content (category pages + business pages cover this)
- About page with real info about who runs the site
- Contact page with working contact method
- Privacy Policy page
- Terms of Service page
- Clean site navigation
- Mobile-friendly design
- Original content (business descriptions written by your team, not copied)
- No copyrighted images (use photos provided by businesses or taken by your team)
- Custom domain (wheretoyeg.ca — done)
- Site must be live for at least a few weeks before applying

Apply at adsense.google.com once you have 30+ business listings live.

---

## 19. Launch Plan

**Week 1:** Set up infrastructure — Vercel project, GitHub repo, Cloudflare DNS, Google Form, Stripe payment links.

**Week 2-3:** Build the site — homepage, category pages, business page template, get-listed page, search, about, contact, privacy, terms.

**Week 3-4:** Seed with 30-50 FREE listings. Reach out to Edmonton businesses you already know. Walk Whyte Ave and Jasper Ave, take photos, collect info, and add them for free to fill the site with content.

**Week 5:** Soft launch. Share on personal social media. Post in Edmonton Facebook groups and subreddits (r/Edmonton). Ask listed businesses to share.

**Week 6:** Start charging. Every new listing pays. Begin outreach to businesses in categories with few listings.

**Ongoing:** Add 5-10 new businesses per week. Add new categories as demand appears. Post on Instagram/TikTok featuring listed businesses.

---

## 20. Growth Strategy

**Social Media (Instagram + TikTok):**
- Create @wheretoyeg on Instagram and TikTok
- Post short Reels/TikToks featuring listed businesses: "Where to get the best fade in Edmonton" → show the barber → link to wheretoyeg.ca/barbers
- This drives traffic to the site AND sells listings to businesses who see the content

**SEO:**
- Every category page targets "[category] Edmonton" keywords
- Every business page targets "[business name] Edmonton"
- Blog posts (Phase 2) target long-tail keywords
- Submit sitemap to Google Search Console immediately at launch

**Local Outreach:**
- Your team physically visits businesses, introduces WhereToYEG, and signs them up
- Offer the first month free to get them on the platform
- Once they see traffic and inquiries from their listing, they'll stay and pay

**Partnerships:**
- Partner with Edmonton BIAs (Business Improvement Areas) for bulk listings
- Partner with community organizations for cross-promotion
- Sponsor local events for brand visibility

---

## 21. Environment Variables

```
NEXT_PUBLIC_SITE_URL=https://wheretoyeg.ca
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here (optional — can use free embed URLs instead)
NEXT_PUBLIC_GA_ID=your_google_analytics_id (optional)
```

Minimal environment variables needed since there's no database, no auth, and no payment processing on the site.

---

## 22. Future Expansion

When ready to expand beyond Edmonton:

- Create wheretoyeg.ca as the Edmonton hub
- Buy wheretoyyc.ca for Calgary
- Buy wheretovan.ca for Vancouver
- OR pivot to a single multi-city domain like whereto.ca with city subpages: whereto.ca/edmonton, whereto.ca/calgary

The same codebase, same design, same process — just duplicate the content folder structure per city.

---

## 23. Workspace & File Organization (IMPORTANT — Read First)

A dedicated folder has been created on the Desktop for this project:

```
~/Desktop/wheretoyeg/
```

**Claude Code MUST use this folder as the project root.** All project files, code, assets, and content go inside this folder. Do not create files outside of it.

**Naming conventions — follow these strictly:**

**Folders:**
- All lowercase
- Use hyphens for multi-word names: `halal-restaurants`, `lash-techs`, `fades-by-mike`
- No spaces, no underscores, no camelCase in folder names

**Files:**
- Components: PascalCase `.tsx` — `BusinessCard.tsx`, `StarRating.tsx`, `FilterBar.tsx`
- Lib/utils: camelCase `.ts` — `businesses.ts`, `openNow.ts`, `ratings.ts`
- Pages/routes: `page.tsx` (Next.js App Router convention)
- Content files: lowercase with hyphens `.md` — `fades-by-mike.md`, `halal-restaurants.md`
- Images: numbered or descriptive, lowercase — `1.jpg`, `2.jpg`, `hero.jpg`, `logo.png`
- Config files: standard names — `next.config.js`, `tailwind.config.js`, `tsconfig.json`

**Business content files must be named using the business slug:**
- Business name: "Fades by Mike" → file: `fades-by-mike.md`
- Business name: "Sam's Shawarma" → file: `sams-shawarma.md`
- Business name: "Noor Lash Studio" → file: `noor-lash-studio.md`

**Business image folders must match the slug:**
- `public/images/businesses/fades-by-mike/1.jpg`
- `public/images/businesses/sams-shawarma/1.jpg`

**Keep the project organized at all times:**
- Do not leave temporary files, test files, or unused code in the project
- Every file should have a clear purpose
- Group related files together (all components in `/components`, all business content in `/content/businesses`, etc.)
- Delete any generated boilerplate that Next.js creates but the project doesn't use
- Keep `package.json` clean — only install packages that are actually used

**Git workflow:**
- Initialize git in the project folder: `git init`
- Create a `.gitignore` with standard Next.js ignores (node_modules, .next, .env.local, etc.)
- Make meaningful commit messages: "Add barbers category page" not "update"
- Commit after completing each feature, not in the middle of building one

---

*This PRD is designed to be handed directly to Claude Code for implementation. The project lives at ~/Desktop/wheretoyeg/. Build in this order: homepage → category pages → business page template → get-listed page → search → map view → remaining pages. Seed with 30-50 free listings before public launch.*
