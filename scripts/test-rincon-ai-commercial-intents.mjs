import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { getCommercialInquiryIntent } from "../src/components/rincon-ai/commercial-intents.ts";

test("real questions about hours link to location information in PL ES EN", () => {
  for (const [locale, inputs] of [
    ["pl", ["Jakie są godziny otwarcia?", "O której zamykacie?", "Czy jesteście otwarci?"]],
    ["es", ["¿Cuál es el horario?", "¿A qué hora abren?", "¿Están abiertos hoy?"]],
    ["en", ["What are your opening hours?", "What time do you close?", "Are you open now?"]],
  ]) {
    for (const message of inputs) {
      assert.equal(getCommercialInquiryIntent(message, locale), "hours",
        `Missing ${locale} hours classification for ${message}`);
    }
  }
});

test("real questions about prices link to authentic menu, not invented offers", () => {
  for (const [locale, inputs] of [
    ["pl", ["Ile kosztuje tamal?", "Jaka cena lechony?", "Cennik proszę"]],
    ["es", ["¿Cuánto cuesta el tamal?", "¿Qué precio tiene la bandeja?", "¿Cuánto vale?"]],
    ["en", ["How much is the tamal?", "What is the price?", "Do you have a pricing list?"]],
  ]) {
    for (const message of inputs) {
      assert.equal(getCommercialInquiryIntent(message, locale), "prices",
        `Missing ${locale} prices classification for ${message}`);
    }
  }
});

test("avoid misunderstanding dinner, nonsensical text or existing allergy intents", () => {
  for (const [locale, message] of [
    ["es", "Quiero una cena colombiana"],
    ["es", "La comida está deliciosa"],
    ["pl", "Poproszę empanadę"],
    ["en", "I want some food"],
    ["en", "catering and events"],
    ["pl", ""],
  ]) {
    assert.equal(getCommercialInquiryIntent(message, locale), null,
      `Don't guess commercial intent for ${message}`);
  }
});

test("Rincón AI uses real homepage navigation and honest localization", () => {
  const component = readFileSync("src/components/rincon-ai/RinconAiWidget.tsx", "utf8");
  assert.match(component, /getCommercialInquiryIntent\(question, locale\)/);
  const hours = component.indexOf('commercialIntent === "hours"');
  const prices = component.indexOf('commercialIntent === "prices"');
  const legacyMenu = component.indexOf('          "menu",', hours);
  assert.ok(hours > 0 && prices > hours && legacyMenu > prices,
    "Price/hour questions must be recognized before the generic menu fallback");
  assert.match(component.slice(hours, prices), /copy\.hoursAnswer,[\s\S]*?"#locations",[\s\S]*?copy\.viewLocations/);
  assert.match(component.slice(prices, legacyMenu), /copy\.menuAnswer,[\s\S]*?"#menu",[\s\S]*?copy\.viewMenu/);
  for (const text of [
    "Godziny otwarcia restauracji przy ul. Czapelskiej 33",
    "Consulta los horarios de nuestra sede de Czapelska 33",
    "Find the opening hours for Czapelska 33",
  ]) {
    assert.ok(component.includes(text), "Hours must be translated naturally for all three languages");
  }
  for (const unavailable of [
    "Brzeska 10 jest w przygotowaniu i jeszcze nie jest otwarta.",
    "Brzeska 10 abrirá próximamente y todavía no está atendiendo.",
    "Brzeska 10 is coming soon and is not open yet.",
  ]) {
    assert.ok(component.includes(unavailable), "Future Brzeska 10 must not be advertised as open");
  }
  assert.doesNotMatch(component, /fetch\(.+?hours|new Date\(.+?isOpen/u,
    "Never claim real-time opening status without a trusted verified source");
});
