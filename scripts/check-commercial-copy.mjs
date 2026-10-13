import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const home = await readFile("src/app/[locale]/page.tsx", "utf8");

// Customers should never see internal implementation promises. Any new
// cross-language customer copy must describe an actual current experience.
const forbidden = [
  "ecosistema de pedidos",
  "ecosystem of orders",
  "ekosystem RC ORDERA",
  "Zamawianie bez oddawania relacji",
  "Pedidos propios sin regalar",
  "Own the ordering experience",
  "Ta przestrzeń będzie zasilana z prywatnego panelu",
  "Este espacio se alimentará desde el panel privado",
  "This area will be powered from the private admin panel",
  "identidad estable dentro del sistema",
  "stable system identity",
  "El sistema de fidelización formará parte",
  "The loyalty system will live inside",
  "Program lojalnościowy jest projektowany",
  "centrum relacji z klientem jest nasza własna strona",
  "La arquitectura incluye reservas",
  "Reservation architecture is included",
  "Moduł rezerwacji jest częścią architektury",
  "Kontakt, sugestie, współpraca, catering i sprawy klientów będą kierowane",
  "Customer care, suggestions, collaboration, catering and business inquiries will follow",
  "One central point for catering, businesses",
  "Jedno miejsce do zapytań dotyczących cateringu",
  "Internet prowadzi do Rincón. Rincón prowadzi dalej.",
  "The internet leads to Rincón. Rincón takes the relationship further.",
];
for (const phrase of forbidden) {
  assert.ok(!home.includes(phrase), `Developer-facing marketing copy is back: ${phrase}`);
}

for (const phrase of [
  "Zamów kolumbijskie jedzenie wygodnie online.",
  "Pide tus platos colombianos favoritos en línea.",
  "Order your favourite Colombian dishes online.",
  "Czapelska 33",
  "service.eyebrow",
  "Restauracja",
  "Restaurante",
  "Restaurant",
  "los puntos y recompensas todavía no están activos",
  "Points and rewards are not active yet",
  "Punkty i nagrody nie są jeszcze aktywne",
  "Masz pytanie o menu, zamówienie, catering lub współpracę?",
  "Questions about our menu, orders, catering or working together?",
  "Planujesz urodziny, rodzinne spotkanie lub wydarzenie firmowe",
  "Planning a birthday, family gathering or corporate event in Warsaw?",
  "Brzeska 10 · {copy.locations.comingSoon}",
]) {
  assert.ok(home.toLocaleLowerCase().includes(phrase.toLocaleLowerCase()),
    `Expected localized customer copy: ${phrase}`);
}
assert.ok(
  !home.includes("key={\n                        service.title\n                      }"),
  "Editable service titles must not be React list keys",
);

assert.ok(/comingSoon:\\s*"Wkrótce"/.test(home) &&
  /comingSoon:\\s*"Próximamente"/.test(home) &&
  /comingSoon:\\s*"Coming soon"/.test(home),
  "Future Brzeska location must have a localized non-open status in all three languages");

console.log("PASS: PL/ES/EN commercial copy avoids technical promises and editable cards use stable keys");
