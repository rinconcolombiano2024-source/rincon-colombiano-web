"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const CONSENT_KEY = "rc-web-cookie-consent-v1";
const measurementId = process.env['NEXT_PUBLIC_GA_MEASUREMENT_ID'];

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Optional GA4 analytics: no third-party script is loaded without opt-in. */
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
    if (!measurementId || !/^G-[A-Z0-9]+$/.test(measurementId)) return;
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
      script.dataset['rcGa4'] = "true";
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
      document.head.appendChild(script);
      window.gtag("js", new Date());
      window.gtag("config", measurementId, { send_page_view: false, anonymize_ip: true });
    }
    window.gtag("event", "page_view", { page_path: pathname, page_location: window.location.origin + pathname });
  }, [allowed, pathname]);

  return null;
}
