import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();

  return [
    { url: base, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/crear-cuenta`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/ingresar`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
