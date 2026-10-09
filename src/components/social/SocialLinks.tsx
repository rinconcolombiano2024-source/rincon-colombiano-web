
import type { CSSProperties } from "react";
import { siteConfig } from "@/config/site";

type Platform = "whatsapp" | "instagram" | "tiktok" | "facebook";

interface SocialItem {
  name: string;
  platform: Platform;
  href: string;
  color: string;
}

const items: SocialItem[] = [
  {
    name: "WhatsApp",
    platform: "whatsapp",
    href: siteConfig.contact.whatsapp ?? "",
    color: "#25D366",
  },
  {
    name: "Instagram",
    platform: "instagram",
    href: siteConfig.social.instagram ?? "",
    color: "#C13584",
  },
  {
    name: "TikTok",
    platform: "tiktok",
    href: siteConfig.social.tiktok ?? "",
    color: "#111111",
  },
  {
    name: "Facebook",
    platform: "facebook",
    href: siteConfig.social.facebook ?? "",
    color: "#1877F2",
  },
];

const paths: Record<Platform, string> = {
  whatsapp:
    "M17.472 14.382c-.297-.149-1.758-.867-2.03-.966-.273-.099-.471-.149-.67.149-.198.297-.767.966-.94 1.164-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.76-1.653-2.057-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.173.198-.297.298-.495.099-.198.049-.372-.025-.52-.074-.149-.67-1.611-.916-2.206-.242-.579-.487-.5-.67-.51l-.57-.01c-.198 0-.52.074-.792.372-.273.297-1.04 1.015-1.04 2.478 0 1.462 1.065 2.874 1.213 3.072.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.005-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.004 2a9.94 9.94 0 0 0-8.588 14.958L2 22l5.197-1.363A9.98 9.98 0 1 0 12.004 2zm0 18.176a8.19 8.19 0 0 1-4.175-1.144l-.3-.178-3.087.81.824-3.009-.196-.309a8.2 8.2 0 1 1 6.934 3.83z",
  instagram:
    "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm5.5-3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z",
  tiktok:
    "M16.6 2h-3.1v13.1a3.1 3.1 0 1 1-2.8-3.08V8.87a6.2 6.2 0 1 0 5.9 6.23V8.4a8.8 8.8 0 0 0 5.4 1.75V7.02A5.4 5.4 0 0 1 16.6 2z",
  facebook:
    "M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.1 0 2.25.2 2.25.2v2.47h-1.27c-1.25 0-1.64.77-1.64 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z",
};

function SocialIcon({ platform }: { platform: Platform }) {
  return (
    <svg
      width="23"
      height="23"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d={paths[platform]} />
    </svg>
  );
}

export function SocialLinks() {
  return (
    <nav
      aria-label="Redes sociales de Rincón Colombiano"
      className="flex flex-wrap items-center gap-3"
    >
      {items.filter((item) => {
        try {
          const url = new URL(item.href);
          return url.protocol === "https:";
        } catch {
          return false;
        }
      }).map((item) => (
        <a
          key={item.platform}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Abrir ${item.name} de Rincón Colombiano`}
          title={item.name}
          style={{ "--social-color": item.color } as CSSProperties}
          className="
            inline-flex min-h-12 items-center justify-center
            gap-2 rounded-full border border-neutral-200
            bg-white px-5 py-3 font-semibold text-neutral-900
            shadow-sm transition-all duration-200
            hover:-translate-y-0.5 hover:shadow-md
            focus-visible:outline-2
            focus-visible:outline-offset-4
            focus-visible:outline-blue-700
            motion-reduce:transform-none
          "
        >
          <span
            style={{ color: item.color }}
            className="flex items-center"
          >
            <SocialIcon platform={item.platform} />
          </span>
          <span>{item.name}</span>
        </a>
      ))}
    </nav>
  );
}
