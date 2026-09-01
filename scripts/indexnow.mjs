#!/usr/bin/env node
/**
 * IndexNow submitter for wheretoyeg.ca
 * Pushes URLs to Bing and Yandex via IndexNow.
 *
 * Usage:
 *   node scripts/indexnow.mjs                  # submits the default priority list
 *   node scripts/indexnow.mjs /restaurants /blog/some-post   # submits only these paths
 *
 * The key file must be live at:
 *   https://wheretoyeg.ca/ab3b4d13f61a4995bd7edbc67fcd8ec5.txt
 */

const HOST = 'wheretoyeg.ca'
const KEY = 'ab3b4d13f61a4995bd7edbc67fcd8ec5'
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`
const BASE = `https://${HOST}`

const DEFAULT_PATHS = [
  '/',
  '/about',
  '/contact',
  '/get-listed',
  '/blog',
  '/collections',
  '/neighborhoods',
  '/search',
  '/restaurants',
  '/cafes-coffee-shops',
  '/barbers',
  '/bakeries',
  '/gyms-fitness',
  '/nail-salons',
  '/lash-techs',
  '/hair-salons',
  '/medical',
  '/spas-esthetics',
  '/activities-fun',
  '/auto-repair',
  '/grocery-markets',
  '/catering',
  '/cleaning-services',
  '/electricians',
  '/plumbers',
  '/photographers',
  '/professional-services',
  '/henna-artists',
  '/collections/late-night-eats',
  '/collections/halal-foodie-tour',
  '/collections/date-night',
  '/collections/brunch-spots',
  '/collections/coffee-and-work',
  '/collections/hidden-gems',
  '/collections/middle-eastern-favourites',
  '/blog/halal-food-guide-edmonton-2026',
  '/blog/best-barbers-edmonton-2026',
  '/blog/best-coffee-shops-edmonton-2026',
  '/blog/best-brunch-edmonton-2026',
  '/blog/best-pizza-edmonton-2026',
  '/blog/best-shawarma-edmonton-2026',
  '/blog/first-date-ideas-edmonton-2026',
  '/blog/rainy-day-activities-edmonton-2026',
  '/blog/where-to-eat-downtown-edmonton-2026',
  '/blog/whyte-ave-old-strathcona-guide-2026',
]

const args = process.argv.slice(2).filter(Boolean)
const paths = args.length ? args : DEFAULT_PATHS
const urlList = paths.map((p) => (p.startsWith('http') ? p : `${BASE}${p.startsWith('/') ? '' : '/'}${p}`))

const body = { host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList }

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(body),
})

const text = await res.text()
console.log(`IndexNow → ${res.status} ${res.statusText}`)
console.log(`Submitted ${urlList.length} URL(s):`)
urlList.forEach((u) => console.log('  ' + u))
if (text.trim()) console.log('Response body:', text.trim())
if (res.status !== 200 && res.status !== 202) {
  console.error('\n⚠️  Non-success status — check that the key file is live at', KEY_LOCATION)
  process.exit(1)
}
