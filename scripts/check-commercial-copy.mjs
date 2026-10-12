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
  "centrum relacji z klientem jest nasza własna strona",
  "La arquitectura incluye reservas",
  "Reservation architecture is included",
  "Moduł rezerwacji jest częścią architektury",
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
]) {
  assert.ok(home.includes(phrase), `Expected localized customer copy: ${phrase}`);
}
assert.ok(
  !home.includes("key={\n                        service.title\n                      }"),
  "Editable service titles must not be React list keys",
);

console.log("PASS: PL/ES/EN commercial copy avoids technical promises and editable cards use stable keys");
