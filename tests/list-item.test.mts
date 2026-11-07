import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { toListItem, fromListItem } from "../src/lib/slim.ts";
import { openStatus } from "../src/lib/openNow.ts";
import type { Business } from "../src/lib/types.ts";

function getBusinesses(): Business[] {
  const dir = path.join(path.dirname(new URL(import.meta.url).pathname), "..", "content/businesses");
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => matter(fs.readFileSync(path.join(dir, f), "utf8")).data as Business)
    .filter((b) => b.active !== false);
}

// The compact list payload must give cards and filters exactly what the full listing would.
test("toListItem/fromListItem keep what cards and filters read", () => {
  const all = getBusinesses();
  assert.ok(all.length > 1000);
  const times = [new Date("2026-11-07T15:00:00Z"), new Date("2026-11-08T05:30:00Z"), new Date("2026-11-10T22:10:00Z")];
  for (const b of all) {
    const c = fromListItem(JSON.parse(JSON.stringify(toListItem(b))));
    assert.equal(c.name, b.name);
    assert.equal(c.slug, b.slug);
    assert.equal(c.category, b.category);
    assert.equal(c.neighborhood, b.neighborhood ?? "", `${b.slug} area`);
    assert.equal(c.photos[0], b.photos?.[0] || undefined, `${b.slug} photo`);
    assert.equal(c.logo, b.logo || undefined, `${b.slug} logo`);
    assert.equal(c.rating ?? 0, b.rating ?? 0);
    assert.equal(c.review_count ?? 0, b.review_count ?? 0);
    assert.equal(c.price_range, b.price_range || undefined, `${b.slug} price`);
    assert.deepEqual(c.amenities, b.amenities ?? []);
    assert.equal(c.tier === "premium", b.tier === "premium");
    assert.equal(!!c.pinned, !!b.pinned);
    assert.equal(c.date_listed, b.date_listed ? String(b.date_listed) : "", `${b.slug} date`);
    if (b.generatedDescription) assert.equal(c.description, "");
    else assert.ok((b.description ?? "").trim().startsWith(c.description.replace(/…$/, "")));
    for (const d of ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const) {
      assert.equal(c.hours?.[d] ?? "", b.hours?.[d] ?? "", `${b.slug} ${d}`);
    }
    for (const t of times) assert.deepEqual(openStatus(c.hours, t, c.season), openStatus(b.hours, t, b.season), b.slug);
  }
});
