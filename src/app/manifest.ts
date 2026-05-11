import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Diamy Admin",
    short_name: "Diamy",
    description: "Panel de administración Diamy Laser Cut",
    start_url: "/admin/pedidos",
    display: "standalone",
    background_color: "#fffbfe",
    theme_color: "#6750A4",
    icons: [
      { src: "/logo.png", sizes: "any", type: "image/png" },
    ],
  };
}
