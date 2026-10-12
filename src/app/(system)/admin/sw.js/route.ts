/**
 * Worker exclusivamente en red; NO guarda HTML privado,
 * cookies, tokens, catálogos ni respuestas de Supabase.
 */
const script = `
"use strict";
self.addEventListener("install", event => {
  event.waitUntil(self.skipWaiting());
});
self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});
self.addEventListener("fetch", event => {
  if (event.request.mode === "navigate" && event.request.method === "GET") {
    event.respondWith(fetch(event.request));
  }
});
`;

export function GET(): Response {
  return new Response(script, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-store",
      "Service-Worker-Allowed": "/admin/",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
