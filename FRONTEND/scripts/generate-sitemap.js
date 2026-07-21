// Genera public/sitemap.xml incluyendo, además de las páginas fijas, una
// entrada por cada lugar y publicación reales (antes el sitemap solo listaba
// 7 rutas estáticas y nunca /places/:slug ni /posts/:id, aunque esas páginas
// ya tienen SEO único). Se corre automáticamente antes de "npm run build"
// (ver "prebuild" en package.json). Si la API no responde (por ejemplo, sin
// red en el entorno de build), se deja el sitemap solo con las rutas fijas
// en vez de romper el build.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_URL = "https://www.jardindelasdelicias.com";
const API_URL = (process.env.VITE_API_URL || "https://jardinbackend-a5p0.onrender.com").replace(/\/+$/, "");
const OUTPUT_PATH = path.join(__dirname, "..", "public", "sitemap.xml");

const STATIC_URLS = [
  { loc: "/", changefreq: "weekly", priority: "1.0" },
  { loc: "/places", changefreq: "weekly", priority: "0.9" },
  { loc: "/events", changefreq: "weekly", priority: "0.7" },
  { loc: "/posts", changefreq: "weekly", priority: "0.7" },
  { loc: "/como-llegar", changefreq: "monthly", priority: "0.8" },
  { loc: "/informacion", changefreq: "monthly", priority: "0.8" },
  { loc: "/contact", changefreq: "monthly", priority: "0.6" },
];

async function fetchList(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : (data.results || []);
}

function urlEntry(loc, changefreq, priority) {
  return `  <url>\n    <loc>${SITE_URL}${loc}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

async function main() {
  const entries = STATIC_URLS.map((u) => urlEntry(u.loc, u.changefreq, u.priority));

  try {
    const places = await fetchList(`${API_URL}/api/places/`);
    for (const place of places) {
      if (place.slug) entries.push(urlEntry(`/places/${place.slug}`, "monthly", "0.8"));
    }
    console.log(`[sitemap] ${places.length} lugares agregados.`);
  } catch (err) {
    console.warn("[sitemap] No se pudieron obtener los lugares, se omiten:", err.message);
  }

  try {
    const posts = await fetchList(`${API_URL}/api/posts/`);
    for (const post of posts) {
      if (post.id) entries.push(urlEntry(`/posts/${post.id}`, "monthly", "0.6"));
    }
    console.log(`[sitemap] ${posts.length} publicaciones agregadas.`);
  } catch (err) {
    console.warn("[sitemap] No se pudieron obtener las publicaciones, se omiten:", err.message);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>\n`;
  fs.writeFileSync(OUTPUT_PATH, xml, "utf-8");
  console.log(`[sitemap] Generado con ${entries.length} URLs -> ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error("[sitemap] Error inesperado generando el sitemap, se mantiene el archivo existente:", err);
});
