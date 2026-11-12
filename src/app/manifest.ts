import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

// Lets people add WhereToYEG to their phone's home screen. It then opens full screen, like an app.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: SITE.name,
    description: SITE.description,
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F6F8F9",
    theme_color: "#053F52",
    lang: "en-CA",
    categories: ["food", "lifestyle", "travel", "shopping"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Search", url: "/search", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Halal restaurants", url: "/halal-restaurants", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
