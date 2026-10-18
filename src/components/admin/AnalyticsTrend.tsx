type Day = { label: string; values: number[] };

const dateLabel = (label: string) => /^\d{8}$/.test(label) ? `${label.slice(6)}/${label.slice(4, 6)}/${label.slice(0, 4)}` : label;

/** Render only measured dates, without inventing missing days or traffic. No client JS. */
export function AnalyticsTrend({ days }: { days: Day[] }) {
  if (!days.length) { return null; }
  const maximum = Math.max(1, ...days.map(day => day.values[0] ?? 0));
  const slot = 680 / days.length;
  return (
    <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm" aria-labelledby="visits-trend-title">
      <h2 id="visits-trend-title" className="text-xl font-bold text-[#123d73]">Así evolucionan las visitas</h2>
      <p id="visits-trend-description" className="mt-2 text-sm text-[#62594f]">Páginas vistas por fecha registrada. Las cifras de cada día están disponibles en la tabla Evolución diaria.</p>
      <svg viewBox="0 0 760 240" role="img" aria-labelledby="visits-trend-title visits-trend-description" className="mt-5 block w-full">
        {[0, 0.5, 1].map(fraction => <g key={fraction}>
          <line x1="60" y1={195 - fraction * 160} x2="740" y2={195 - fraction * 160} stroke="#e5e7eb" />
          <text x="50" y={199 - fraction * 160} textAnchor="end" fontSize="12" fill="#62594f">{Math.round(maximum * fraction).toLocaleString("es-ES")}</text>
        </g>)}
        {days.map((day, index) => {
          const count = day.values[0] ?? 0;
          const height = count / maximum * 160;
          return <rect key={`${day.label}-${index}`} x={60 + index * slot + slot * 0.12} y={195 - height} width={slot * 0.76} height={height} rx={Math.min(4, slot * 0.15)} fill="#123d73"><title>{dateLabel(day.label)}: {count.toLocaleString("es-ES")} vistas</title></rect>;
        })}
        <text x="60" y="222" fontSize="12" fill="#62594f">{dateLabel(days[0]?.label ?? "")}</text>
        {days.length > 1 && <text x="740" y="222" textAnchor="end" fontSize="12" fill="#62594f">{dateLabel(days[days.length - 1]?.label ?? "")}</text>}
      </svg>
    </section>
  );
}
