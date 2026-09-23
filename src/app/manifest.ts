import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Nihongo — JLPT Japanese Study",
    short_name: "Nihongo",
    description: "Japanese study tools in Mongolian, English and Japanese",
    lang: "mn",
    start_url: "/mn",
    scope: "/",
    display: "standalone",
    background_color: "#f8f8f5",
    theme_color: "#f8f8f5",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
