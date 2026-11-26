#!/usr/bin/env node
/**
 * Flags listings whose name (and, for a few strong words, description) suggests a different
 * category than the one they are filed under, e.g. a storage facility under Cleaning Services.
 * It only reports; every flag needs a human look before anything is changed.
 *
 *   node scripts/audit-category-keywords.mjs            # active listings
 *   node scripts/audit-category-keywords.mjs --all      # include inactive listings
 *   node scripts/audit-category-keywords.mjs --json     # machine-readable output
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const DIR = path.join(process.cwd(), "content/businesses");
const ALL = process.argv.includes("--all");
const JSON_OUT = process.argv.includes("--json");

// [label, regex on the business name, categories where that word is expected]
const RULES = [
  ["storage", /\b(self[ -]?storage|mini[ -]?storage|storage)\b/i, ["moving-storage"]],
  ["moving", /\b(movers?|moving)\b/i, ["moving-storage"]],
  ["plumbing", /\b(plumb\w*|drain\w*|sewer\w*)\b/i, ["plumbers"]],
  ["electrical", /\b(electric(al|ian|ians)?)\b/i, ["electricians"]],
  ["hvac", /\b(hvac|furnace|heating|air condition\w*)\b/i, ["electricians", "plumbers"]],
  ["roof/garage door/locksmith", /\b(roof\w*|garage doors?|locksmith\w*)\b/i, ["plumbers"]],
  ["hair salon", /\b(hair|salon)\b/i, ["hair-salons", "barbers", "nail-salons", "spas-esthetics", "lash-techs"]],
  ["barber", /\bbarber\w*\b/i, ["barbers", "hair-salons"]],
  ["nails", /\bnails?\b/i, ["nail-salons", "spas-esthetics"]],
  ["lash/brow", /\b(lash\w*|brows?)\b/i, ["lash-techs", "spas-esthetics", "hair-salons"]],
  ["spa/esthetics", /\b(spa|esthetic\w*|aesthetic\w*|facials?|waxing|laser hair|laser clinic)\b/i, ["spas-esthetics", "nail-salons", "medical", "lash-techs", "hair-salons"]],
  ["bakery", /\b(bakery|bakeries|bakeshop|bake shop|pastr(y|ies)|patisserie|cakes?)\b/i, ["bakeries", "cafes-coffee-shops", "restaurants", "grocery-markets", "catering"]],
  ["cafe", /\b(caf[eé]|coffee|espresso|roaster\w*|bubble tea|boba)\b/i, ["cafes-coffee-shops", "bakeries", "restaurants"]],
  ["restaurant", /\b(restaurant|grill|eatery|bistro|kitchen|pizza\w*|shawarma|burgers?|sushi|diner|kebab\w*|biryani|donair)\b/i, ["restaurants", "catering", "cafes-coffee-shops", "bakeries", "grocery-markets"]],
  ["auto", /\b(auto|automotive|collision|tires?|mechanics?|car wash|detailing|transmission|muffler|windshield|auto glass|body shop)\b/i, ["auto-repair"]],
  ["dental", /\b(dental|dentist\w*|dentistry|orthodont\w*|denture\w*)\b/i, ["medical"]],
  ["clinic/health", /\b(clinic|physio\w*|chiropract\w*|medical|pharmacy|optometr\w*|optical|hearing|massage therapy|veterinar\w*|animal hospital)\b/i, ["medical", "spas-esthetics", "gyms-fitness"]],
  ["gym/fitness", /\b(gym|fitness|crossfit|yoga|pilates|martial arts?|karate|boxing|jiu ?jitsu|taekwondo|muay thai|dance)\b/i, ["gyms-fitness", "activities-fun"]],
  ["childcare", /\b(daycare|day care|childcare|child care|preschool|montessori|early learning|out of school care|day ?home)\b/i, ["childcare"]],
  ["photographer", /\b(photograph\w*|photo studio)\b/i, ["photographers"]],
  ["cleaning", /\b(clean\w*|janitorial|maids?|carpet)\b/i, ["cleaning-services"]],
  ["painting", /\b(paint(ing|ers?)?)\b/i, ["home-services"]],
  ["landscaping", /\b(landscap\w*|lawn\w*|yard|snow removal|tree service\w*)\b/i, ["home-services"]],
  ["pest", /\b(pest\w*|exterminat\w*)\b/i, ["home-services"]],
  ["junk", /\b(junk|dumpster|bins?|hauling|haulers?)\b/i, ["home-services"]],
  ["legal/accounting", /\b(law|lawyers?|legal|barristers?|notary|accounting|accountants?|cpa|bookkeep\w*|tax)\b/i, ["professional-services"]],
  ["catering", /\bcater(ing|ers?)\b/i, ["catering", "restaurants"]],
  ["grocery", /\b(grocery|groceries|supermarket|halal meat|butcher\w*|meat shop)\b/i, ["grocery-markets", "restaurants"]],
];

// Second pass on the description, with phrases specific enough to mean the business does that work.
// Only used when the name gave no hint (or a hint that already fits), so it catches quiet misfiles.
const DESC_RULES = [
  ["storage", /\b(self[ -]?storage|storage units?|mini[ -]?storage|storage facility)\b/i, ["moving-storage"]],
  ["moving", /\b(moving compan(y|ies)|professional movers|local moves|long distance mov\w*|residential moving)\b/i, ["moving-storage"]],
  ["painting", /\b((house|interior|exterior|residential|commercial) paint(ing|ers?)|painting (company|contractors?|services))\b/i, ["home-services"]],
  ["landscaping", /\b(landscap(ing|ers?|e design|e construction)|lawn (care|mowing)|snow removal|tree (removal|service))\b/i, ["home-services"]],
  ["pest", /\b(pest control|exterminat\w*|bed ?bugs?|rodent control|wildlife removal)\b/i, ["home-services"]],
  ["junk", /\b(junk removal|dumpster rentals?|bin rentals?|garbage bins?)\b/i, ["home-services"]],
  ["plumbing", /\b(plumbing|plumbers?)\b/i, ["plumbers", "electricians"]],
  ["electrical", /\b(electricians?|electrical (contractors?|services|work|repairs?))\b/i, ["electricians", "plumbers"]],
  ["cleaning", /\b((house|home|office|commercial|deep|move[ -]?out|carpet|window|residential) clean(ing|ers?)|janitorial)\b/i, ["cleaning-services"]],
];

function readAll() {
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".md"))
    .map((file) => ({ file, data: matter(fs.readFileSync(path.join(DIR, file), "utf8")).data }));
}

const flags = [];
for (const { file, data } of readAll()) {
  if (!ALL && data.active === false) continue;
  const name = String(data.name ?? "");
  let hits = RULES.filter(([, re]) => re.test(name));
  let source = "name";
  if (!hits.length) {
    // No hint in the name: look for a clear service phrase in the description instead.
    const desc = String(data.description ?? "");
    hits = DESC_RULES.filter(([, re]) => re.test(desc));
    source = "description";
    if (!hits.length) continue;
  }
  // A listing is fine when ANY matching word is expected in its category.
  if (hits.some(([, , cats]) => cats.includes(data.category))) continue;
  flags.push({
    file,
    name,
    category: data.category,
    subcategory: data.subcategory ?? "",
    source,
    words: hits.map(([label]) => label),
    suggests: [...new Set(hits.flatMap(([, , cats]) => cats))],
    description: String(data.description ?? "").replace(/\s+/g, " ").slice(0, 160),
  });
}

flags.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
if (JSON_OUT) console.log(JSON.stringify(flags, null, 2));
else {
  for (const f of flags)
    console.log(`${f.category}/${f.subcategory} | ${f.name} | ${f.source}: ${f.words.join(", ")} | suggests: ${f.suggests.join(", ")} | ${f.file}`);
  console.log(`\n${flags.length} listings flagged for a look.`);
}
