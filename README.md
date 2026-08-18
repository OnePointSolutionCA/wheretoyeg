# WhereToYEG

Local business directory for Edmonton. Static site — Next.js 14 App Router, markdown content, no database.

## Dev

```bash
npm install
npm run dev   # http://localhost:4200
npm run build && npm start
```

## Add a business

Create `content/businesses/{slug}.md` with the frontmatter from `content/businesses/fades-by-mike.md`. Photos go in `public/images/businesses/{slug}/`. Commit, push — Vercel auto-deploys.

## Structure

- `content/` — markdown source for categories, businesses, neighborhoods
- `src/app/` — routes (App Router)
- `src/components/` — UI
- `src/lib/` — data loading, helpers
- `public/` — logo, images
- `brand-kit/` — PRD + brand guidelines (git-ignored)
