/**
 * Cloudflare Worker – Share Redirect para Portafolio Web de Jeefry Archila
 *
 * URL format: https://jeefry-share.TU_SUBDOMINIO.workers.dev/post/{postId}
 *
 * Funcionamiento:
 *  1. Un crawler (Telegram, WhatsApp, etc.) visita la URL del Worker.
 *  2. El Worker consulta Firestore REST API para obtener los datos del post.
 *  3. Devuelve HTML con las meta tags OG correctas + redirect inmediato al sitio.
 *  4. Crawlers leen las OG tags. Humanos son redirigidos al post real.
 */

const FIREBASE_PROJECT_ID = "portafolio-jeefry-archila-tech";
const BASE_SITE_URL = "https://coralgamer.github.io/hojadevida";
const DEFAULT_IMAGE = `${BASE_SITE_URL}/assets/icons/LogoPNG.png`;
const SITE_NAME = "Portafolio Web de Jeefry Archila";

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Solo manejar rutas /post/{id}
    const match = url.pathname.match(/^\/post\/([^/]+)$/);
    if (!match) {
      return new Response(
        `<h1>${SITE_NAME}</h1><p><a href="${BASE_SITE_URL}">Ir al portafolio</a></p>`,
        { headers: { "content-type": "text/html; charset=utf-8" } }
      );
    }

    const postId = match[1];

    // Consultar Firestore REST API (lectura pública, no requiere autenticación)
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/posts/${postId}`;

    let titulo = SITE_NAME;
    let description = "Portafolio profesional de Jeefry Nicolas Archila.";
    let image = DEFAULT_IMAGE;
    let redirectUrl = BASE_SITE_URL;

    try {
      const res = await fetch(firestoreUrl);
      const doc = await res.json();

      if (doc.fields) {
        // Título del post
        titulo = doc.fields.titulo?.stringValue || SITE_NAME;

        // Descripción: primeras 160 chars del contenido o el título
        const rawContent = doc.fields.contenido?.stringValue || "";
        const plainText = rawContent.replace(/[#*`\[\]()>!\-_]/g, "").trim();
        description = plainText.length > 0
          ? plainText.substring(0, 160) + (plainText.length > 160 ? "…" : "")
          : `${titulo} – ${SITE_NAME}`;

        // Imagen: seoThumbnail > primera imagen > logo por defecto
        const seoThumbnail = doc.fields.seoThumbnail?.stringValue;
        const imagenesArr = doc.fields.imagenes?.arrayValue?.values;
        const firstImage = imagenesArr?.[0]?.stringValue;
        image = seoThumbnail || firstImage || DEFAULT_IMAGE;

        // Categoría para construir la URL de destino
        const categoriasArr = doc.fields.categorias?.arrayValue?.values;
        const category = categoriasArr?.[0]?.stringValue || "project-management";
        redirectUrl = `${BASE_SITE_URL}/pages/servicios/${category}.html#post-${postId}`;
      }
    } catch (err) {
      // Si falla Firestore, redirigir al sitio principal
      console.error("Error leyendo Firestore:", err);
    }

    // HTML con OG tags correctas + redirect
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(titulo)} – ${SITE_NAME}</title>

  <!-- Open Graph -->
  <meta property="og:site_name" content="${SITE_NAME}" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${escapeHtml(titulo)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${escapeHtml(image)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:url" content="${escapeHtml(request.url)}" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(titulo)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(image)}" />

  <!-- Redirect inmediato para humanos -->
  <meta http-equiv="refresh" content="0;url=${escapeHtml(redirectUrl)}" />
</head>
<body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f8f9fa;">
  <div style="text-align:center;padding:2rem;">
    <p style="color:#666;margin-bottom:1rem;">Redirigiendo a la publicación…</p>
    <a href="${escapeHtml(redirectUrl)}" style="color:#1A73E8;font-weight:bold;">
      Haz clic aquí si no redirige automáticamente →
    </a>
  </div>
  <script>window.location.replace("${escapeHtml(redirectUrl)}");</script>
</body>
</html>`;

    return new Response(html, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        // Cache: crawlers pueden guardar 5 minutos, sin problema
        "cache-control": "public, max-age=300",
        // CORS por si acaso
        "access-control-allow-origin": "*",
      },
    });
  },
};

// Prevenir XSS en los valores inyectados en HTML
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
