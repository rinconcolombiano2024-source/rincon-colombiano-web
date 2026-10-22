"use client";

import { Children, useEffect, useState, type ReactNode } from "react";
import { resolveImportedMenuCategoryHash } from "@/integrations/rc-ordera/menu-category-hash";

interface Category { readonly id: string; readonly name: string; }

export function MenuCategoryBrowser({ categories, label, children }: {
  readonly categories: readonly Category[];
  readonly label: string;
  readonly children: ReactNode;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Opening /pl/menu#category-bebidas must show the right tab, not the
  // default first tab while the actual bookmark stays inside a hidden panel.
  useEffect(() => {
    const activateBookmark = () => {
      const match = resolveImportedMenuCategoryHash(window.location.hash, categories);
      if (match) {
        setSelectedId(match);
        window.requestAnimationFrame(() => {
          document.getElementById(match)?.scrollIntoView({ block: "start" });
        });
      }
    };
    activateBookmark();
    window.addEventListener("hashchange", activateBookmark);
    return () => window.removeEventListener("hashchange", activateBookmark);
  }, [categories]);

  const selectCategory = (id: string) => {
    setSelectedId(id);
    // Replace the fragment without reloading or forcing a scroll jump.
    // Customers can now share a direct URL to Entradas, Platos or Bebidas.
    const url = new URL(window.location.href);
    url.hash = id;
    window.history.replaceState(window.history.state, "", url.href);
  };

  const selected = Math.max(0, categories.findIndex((category) => category.id === selectedId));
  const panels = Children.toArray(children);
  return (
    <div className="mt-8">
      <nav aria-label={label} className="flex flex-wrap gap-2">
        {categories.map((category, index) => (
          <button key={category.id} type="button" aria-pressed={selected === index}
            aria-controls={`menu-panel-${index}`} onClick={() => selectCategory(category.id)}
            className={`min-h-11 rounded-full border px-5 py-3 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#123d73] ${selected === index ? "border-[#123d73] bg-[#123d73] text-white" : "border-[#d8d0c5] bg-white text-[#123d73] hover:bg-[#f4f1eb]"}`}>
            {category.name}
          </button>
        ))}
      </nav>
      <div className="mt-8">
        {panels.map((panel, index) => (
          <div key={categories[index]?.id ?? index} id={`menu-panel-${index}`} aria-label={categories[index]?.name} role="region" hidden={selected !== index}>{panel}</div>
        ))}
      </div>
    </div>
  );
}
