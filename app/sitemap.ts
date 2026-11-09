import type { MetadataRoute } from "next";

/** Hanya rute publik — halaman /app butuh login dan tidak dipromosikan. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://nexcreator.vercel.app",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://nexcreator.vercel.app/auth/login",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
