"use client";

import { Children, useState, type ReactNode } from "react";

interface Category { readonly id: string; readonly name: string; }

export function MenuCategoryBrowser({ categories, label, children }: {
  readonly categories: readonly Category[];
  readonly label: string;
  readonly children: ReactNode;
}) {
  const [selected, setSelected] = useState(0);
  const panels = Children.toArray(children);
  return (
    <div className="mt-8">
      <nav aria-label={label} className="flex flex-wrap gap-2">
        {categories.map((category, index) => (
          <button key={category.id} type="button" aria-pressed={selected === index}
            aria-controls={`menu-panel-${index}`} onClick={() => setSelected(index)}
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
