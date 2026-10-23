"use client";

import { usePathname } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";
import { useEffect, useState } from "react";

const CONSENT_KEY = "rc-web-cookie-consent-v1";
// Declare the public variable explicitly so noPropertyAccessFromIndexSignature
// permits the direct access required for Next.js client-side env inlining.
declare const process: { env: { NEXT_PUBLIC_GA_MEASUREMENT_ID?: string } };
const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Optional GA4 + Vercel Web Analytics: no tracking SDK is mounted without opt-in. */
export function ConsentAnalytics() {
  const pathname = usePathname();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const update = () => {
      let accepted = false;
      try { accepted = localStorage.getItem(CONSENT_KEY) === "accepted"; } catch { /* Storage disabled. */ }
      setAllowed(accepted);
    };
    update();
    window.addEventListener("rc-consent-change", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("rc-consent-change", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  useEffect(() => {
    if (!measurementId || !/^G-[A-Z0-9]+$/.test(measurementId)) { return; }
    Object.assign(window, { [`ga-disable-${measurementId}`]: !allowed });
    if (!allowed) {
      window.gtag?.("consent", "update", { analytics_storage: "denied" });
      return;
    }
    window.dataLayer ??= [];
    window.gtag ??= (...args: unknown[]) => { window.dataLayer?.push(args); };
    window.gtag("consent", "default", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
    window.gtag("consent", "update", { analytics_storage: "granted" });
    if (!document.querySelector("script[data-rc-ga4]")) {
      const script = document.createElement("script");
      script.async = true;
      script.setAttribute('data-rc-ga4', 'true');
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
      document.head.appendChild(script);
      window.gtag("js", new Date());
      window.gtag("config", measurementId, { send_page_view: false, anonymize_ip: true });
    }
    window.gtag("event", "page_view", { page_path: pathname, page_location: window.location.origin + pathname });
  }, [allowed, pathname]);

  // Measure outbound ordering intent, never payment completion or personal data.
  useEffect(() => {
    if (!allowed || !measurementId || !/^G-[A-Z0-9]+$/.test(measurementId)) { return; }
    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) { return; }
      const anchor = event.target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) { return; }
      let url: URL;
      try { url = new URL(anchor.href); } catch { return; }
      // Only count secure, public order links; never attribute unsafe URLs.
      if (url.protocol !== "https:" || url.username || url.password || (url.port && url.port !== "443")) { return; }
      const host = url.hostname.toLowerCase();
      let channel: string | undefined;
      if (host === "rincon-colombiano-pedidosapp.vercel.app" && (url.pathname === "/" || (url.pathname === "/cliente.html" && url.searchParams.get("store") === "9702bf42-2f50-46b2-8f8a-d5f80ba576d5"))) { channel = "rc_ordera"; }
      else if (host === "rincon-colombiano.sumupstore.com" && url.pathname === "/produkty") { channel = "sumup"; }
      else if ((host === "www.ubereats.com" || host === "ubereats.com") && url.pathname === "/pl/store/rincon-colombiano/wL2-43SIUx2415myUeosqw") { channel = "uber_eats"; }
      else if (host === "glovoapp.com" && url.pathname === "/pl/pl/warszawa/stores/rincon-colombiano-waw") { channel = "glovo"; }
      else if ((host === "www.pyszne.pl" || host === "pyszne.pl") && url.pathname === "/menu/rincon-colombiano") { channel = "pyszne"; }
      else if (host === "wolt.com" && url.pathname === "/pl/pol/warsaw/restaurant/rincon-colombiano") { channel = "wolt"; }
      if (channel) { window.gtag?.("event", "select_order_channel", { order_channel: channel }); }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [allowed]);

  // Both the GA4 loader above and Vercel's first-party web analytics SDK
  // are disabled until a visitor explicitly opts into optional tracking.
  // Mounting the official Next.js integration also tracks client-side routes.
  // Vercel Dashboard activation and a new production deployment are required.
  return allowed ? <Analytics /> : null;
}
