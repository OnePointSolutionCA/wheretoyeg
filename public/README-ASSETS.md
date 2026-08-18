# Public assets to add before launch

## Hero background video

Drop an Edmonton downtown loop here so the homepage hero plays it:

- `public/hero-edmonton.mp4` — 1080p, ~8–15 seconds, silent, loops cleanly
- `public/hero-edmonton.webm` — optional, smaller/better for modern browsers
- `public/hero-poster.jpg` — first-frame still, shown while the video loads and on very slow connections

Where to source:

- Pexels — https://www.pexels.com/search/videos/edmonton/
- Pixabay — https://pixabay.com/videos/search/edmonton/
- Coverr — https://coverr.co/ (search "city downtown")

Encoding tips:

- Aim for < 3 MB. Use ffmpeg: `ffmpeg -i in.mov -vf scale=1920:-2 -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p -movflags +faststart -an hero-edmonton.mp4`
- Muted and short — a 10-second seamless loop is enough
- Choose footage with sky in the top half so the headline reads cleanly

Until you add these files, the hero falls back to a deep teal gradient — the layout still looks correct.

## Reviews

Reviews on business pages are **real Google reviews** pasted into the business's markdown frontmatter under `reviews:`. Workflow:

1. Open the business's Google Business Profile
2. Copy the reviewer's first name + last initial, star rating, date, and comment
3. Paste into `content/businesses/{slug}.md` under `reviews:`
4. Update `rating` (average) and `review_count` (total) at the top of the same file
5. Commit and push — Vercel redeploys

Never invent reviews. Reviews should link back to what someone actually wrote on Google, minus their photo (we only display first name + last initial for privacy).
