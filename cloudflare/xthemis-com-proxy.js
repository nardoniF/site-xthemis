/**
 * Keeps xthemis.com on its own host so the page stays in English.
 * GitHub Pages only accepts one custom domain and would send .com to .com.br.
 * Files come from the pinned commit on jsDelivr.
 */
const COMMIT = "56b54f650621c87420bb36ccb3f54a28e7f96032";
const ORIGIN = "https://cdn.jsdelivr.net/gh/nardoniF/site-xthemis@" + COMMIT;

function filePath(pathname) {
  if (pathname === "/" || pathname === "") return "/index.html";
  if (pathname.endsWith("/")) return pathname + "index.html";
  return pathname;
}

function contentType(pathname) {
  if (pathname.endsWith(".html")) return "text/html; charset=utf-8";
  if (pathname.endsWith(".css")) return "text/css; charset=utf-8";
  if (pathname.endsWith(".js")) return "application/javascript; charset=utf-8";
  if (pathname.endsWith(".png")) return "image/png";
  if (pathname.endsWith(".txt")) return "text/plain; charset=utf-8";
  if (pathname.endsWith(".svg")) return "image/svg+xml";
  if (pathname.endsWith(".ico")) return "image/x-icon";
  return "application/octet-stream";
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.protocol === "http:") {
      url.protocol = "https:";
      return Response.redirect(url.toString(), 301);
    }
    const host = url.hostname.toLowerCase();
    if (host === "xthemis.com") {
      url.hostname = "www.xthemis.com";
      return Response.redirect(url.toString(), 301);
    }
    const path = filePath(url.pathname);
    const upstream = await fetch(ORIGIN + path, { redirect: "manual" });
    if (!upstream.ok) {
      return new Response("Não encontrado.", { status: upstream.status || 404 });
    }
    const headers = new Headers();
    headers.set("Content-Type", contentType(path));
    const fresco = path.endsWith(".html") || path.endsWith(".js") || path.endsWith(".css");
    headers.set("Cache-Control", fresco ? "no-cache" : "public, max-age=86400");
    headers.set("X-Content-Type-Options", "nosniff");
    return new Response(upstream.body, { status: 200, headers });
  },
};
