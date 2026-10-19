
/**
 * RINCÓN COLOMBIANO
 * Verificación de la web pública.
 *
 * Node.js 22+
 * Sin dependencias externas.
 *
 * Uso:
 * node scripts/smoke-public.mjs https://rinconcolombiano.pl
 */

const previewMode = process.argv.includes("--preview");

const origin = (
  process.argv[2] ??
  "https://rinconcolombiano.pl"
).replace(/\/+$/, "");

const socialLinks = {
  WhatsApp:
    "https://wa.me/message/OWMYNNNTJEIFF1",
  Instagram:
    "https://www.instagram.com/rinconcolombiano.pl",
  TikTok:
    "https://www.tiktok.com/@rinconcolombiano.pl",
  Facebook:
    "https://www.facebook.com/share/1CdzPbwFAu/",
};

const locales = ["pl", "es", "en"];
const orderingHeadings = {
  pl: "Zamów kolumbijskie jedzenie wygodnie online.",
  es: "Pide tus platos colombianos favoritos en línea.",
  en: "Order your favourite Colombian dishes online.",
};
const localeBrandStripLabels = {
  pl: "Restauracja",
  es: "Restaurante",
  en: "Restaurant",
};
const serviceActionLabels = {
  pl: "Zapytaj o szczegóły",
  es: "Consultar servicio",
  en: "Enquire now",
};
const legalFooterLabels = {
  pl: "Zasady",
  es: "Información legal",
  en: "Legal",
};
const futureLocationStatus = {
  pl: "Wkrótce",
  es: "Próximamente",
  en: "Coming soon",
};
const customerContactCopy = {
  pl: "Masz pytanie o menu, zamówienie, catering lub współpracę?",
  es: "Estamos aquí para ayudarte con tus pedidos",
  en: "Questions about our menu, orders, catering or working together?",
};

// Natural restaurant-search questions must be visible in each locale's SSR
// HTML, rather than hidden keyword inventories or bot-only markup.
const searchIntentFaqQuestions = {
  pl: [
    "Gdzie zjeść kolumbijskie jedzenie w Warszawie?",
    "Jakie tradycyjne kolumbijskie dania znajdę w menu?",
    "Gdzie w Warszawie zamówię tamales i lechonę kolumbijską?",
    "Czy można zamówić kolumbijskie jedzenie na wynos?",
  ],
  es: [
    "¿Dónde comer comida colombiana en Varsovia?",
    "¿Qué platos típicos colombianos encuentro en el menú?",
    "¿Dónde comprar tamales y lechona colombiana en Varsovia?",
    "¿Puedo pedir comida colombiana para llevar?",
  ],
  en: [
    "Where can I eat Colombian food in Warsaw?",
    "What traditional Colombian dishes are on the menu?",
    "Where can I order Colombian tamales and lechona in Warsaw?",
    "Can I order Colombian food for takeaway?",
  ],
};

const smallCommercialLabels = {
  pl: ["Społeczność", "Nasza historia", "Praca", "Informacje", "Warszawa"],
  es: ["Comunidad", "Nuestra historia", "Trabaja con nosotros", "Información", "Varsovia"],
  en: ["Community", "Our story", "Careers", "Information", "Warsaw"],
};

const socialNavigationLabels = {
  pl: "Media społecznościowe Rincón Colombiano",
  es: "Redes sociales de Rincón Colombiano",
  en: "Rincón Colombiano social media",
};

let errors = 0;

function report(ok, description) {
  console.log(
    `${ok ? "PASS" : "FAIL"} ${description}`
  );

  if (!ok) {
    errors += 1;
  }
}

async function request(path) {
  const response = await fetch(
    new URL(path, origin),
    {
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
      headers: {
        Accept: "text/html, */*",
      },
    }
  );

  return {
    status: response.status,
    finalUrl: response.url,
    body: await response.text(),
  };
}

async function checkPage(locale) {
  const path = `/${locale}`;

  try {
    const result = await request(path);

    report(
      result.status === 200,
      `${path} responde HTTP 200`
    );

    const html = result.body;

    report(
      html.includes('id="social"'),
      `${path} contiene sección social`
    );

    const section =
      html.match(
        /<section\b[^>]*id="social"[\s\S]*?<\/section>/i
      )?.[0] ?? "";

    report(
      section.includes(
        `aria-label="${socialNavigationLabels[locale]}"`
      ),
      `${path} contiene navegación social`
    );

    for (const [name, href] of
      Object.entries(socialLinks)) {
      report(
        section.includes(`href="${href}"`),
        `${path} enlace ${name}`
      );
    }

    for (const label of smallCommercialLabels[locale]) {
      report(
        html.includes(label),
        `${path} muestra la microcopia comercial localizada: ${label}`
      );
    }

    const iconCount =
      (section.match(/<svg\b/gi) ?? []).length;

    report(
      iconCount >= 4,
      `${path} muestra cuatro iconos SVG`
    );

    report(
      html.includes("Rincón Colombiano"),
      `${path} identifica la marca`
    );
    report(
      html.includes(orderingHeadings[locale]),
      `${path} contiene título comercial correcto del flujo de pedidos`
    );
    report(
      html.includes(localeBrandStripLabels[locale]),
      `${path} muestra la banda de servicios localizada`
    );
    const services =
      html.match(/<section\b[^>]*id="services"[\s\S]*?<\/section>/i)?.[0] ?? "";
    report(
      (services.match(/href="#contact"/g) ?? []).length >= 7,
      `${path} permite solicitar los siete servicios desde tarjetas reales`
    );
    report(
      services.includes('href="#menu"') && services.includes(serviceActionLabels[locale]),
      `${path} ofrece CTA de menú y textos comerciales del idioma`
    );
    report(
      html.includes(legalFooterLabels[locale]),
      `${path} incluye navegación legal localizada`
    );

    const footer = html.match(/<footer\b[^>]*>[\s\S]*?<\/footer>/i)?.[0] ?? "";
    // Strip SSR React comments/HTML tags before inspecting real user text.
    const footerText = footer.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
    report(
      footerText.includes(`Brzeska 10 · ${futureLocationStatus[locale]}`),
      `${path} marks unopened Brzeska 10 as coming soon in the footer`,
    );
    report(
      html.includes(customerContactCopy[locale]),
      `${path} presents natural contact copy for actual customers`,
    );

    for (const question of searchIntentFaqQuestions[locale]) {
      report(
        html.includes(question),
        `${path} renders visible, localized restaurant-search answer: ${question}`,
      );
    }

    report(
      !html.includes("La web de Rincón Colombiano será el centro de contacto") &&
      !html.includes("The Rincón Colombiano website is becoming") &&
      !html.includes("Strona Rincón Colombiano jest centralnym"),
      `${path} no muestra texto técnico de desarrollo al cliente`
    );
  } catch (error) {
    report(
      false,
      `${path}: ${String(error)}`
    );
  }
}

const contactRoutes = {
  pl: "/pl/kontakt",
  es: "/es/contacto",
  en: "/en/contact",
};
const policyContactLabels = {
  pl: "Pytania o zasady? Skontaktuj się z nami",
  es: "¿Preguntas sobre nuestras políticas? Contáctanos",
  en: "Questions about our policies? Contact us",
};

async function checkContactAndLegal(locale) {
  const path = contactRoutes[locale];
  try {
    const response = await fetch(new URL(path, origin), {
      redirect: "manual",
      signal: AbortSignal.timeout(15000),
    });
    const locationHeader = response.headers.get("location") ?? "";
    const destination = new URL(locationHeader, origin);
    console.log(`Contact route ${path}: HTTP ${response.status}, Location=${locationHeader}`);
    report(
      [302, 303, 307, 308].includes(response.status) &&
      destination.origin === new URL(origin).origin &&
      destination.pathname === `/${locale}` &&
      destination.hash === "#contact",
      `${path} lleva a contacto real y localizado, sin formulario vacío`
    );

    const { body: html, status } = await request(`/${locale}`);
    const legal = html.match(/<section\b[^>]*id="legal"[\s\S]*?<\/section>/i)?.[0] ?? "";
    report(status === 200 && legal.includes('href="#contact"'),
      `/${locale} facilita consulta real de privacidad y condiciones`);
    report(legal.includes(policyContactLabels[locale]),
      `/${locale} comunica cómo consultar políticas en su idioma`);
  } catch (error) {
    report(false, `${path}: ${String(error)}`);
  }
}

const orderRoutes = {
  pl: "/pl/zamow",
  es: "/es/pedir",
  en: "/en/order",
};

async function checkOrderShortcut(locale) {
  const path = orderRoutes[locale];
  try {
    const response = await fetch(new URL(path, origin), {
      redirect: "manual",
      signal: AbortSignal.timeout(15000),
    });
    const destination = new URL(response.headers.get("location") ?? "", origin);
    report(
      [302, 303, 307, 308].includes(response.status) &&
      destination.origin === "https://rincon-colombiano-pedidosapp.vercel.app" &&
      destination.pathname === "/cliente.html" &&
      destination.searchParams.has("store"),
      `${path} lleva al restaurante real de RC ORDERA sin alterar pedidos`
    );
  } catch (error) {
    report(false, `${path}: ${String(error)}`);
  }
}

/**
 * These URLs are part of the published public route registry. Their full
 * standalone pages are not implemented, so direct visitors must be sent
 * to a real, local-language section, not a 404 or an empty promise.
 * Legal/account/checkout URLs are deliberately excluded.
 */
const serviceShortcuts = {
  pl: [
    ["dostawa", "order"], ["uslugi", "services"], ["catering", "services"],
    ["urodziny", "services"], ["dla-firm", "services"], ["dla-rodzin", "services"],
    ["sniadania", "services"], ["sniadania-niespodzianki", "services"],
    ["dekoracje-stolow", "services"], ["wydarzenia", "events"],
    ["lokale", "locations"], ["rezerwacje", "contact"], ["o-nas", "stories"],
    ["opinie", "reviews"], ["kariera", "contact"],
    ["spolecznosc", "community"], ["nagrody", "rewards"],
  ],
  es: [
    ["domicilios", "order"], ["servicios", "services"], ["catering", "services"],
    ["cumpleanos", "services"], ["empresas", "services"], ["familias", "services"],
    ["desayunos", "services"], ["desayunos-sorpresa", "services"],
    ["decoracion-de-mesas", "services"], ["eventos", "events"],
    ["restaurantes", "locations"], ["reservas", "contact"], ["nosotros", "stories"],
    ["opiniones", "reviews"], ["trabaja-con-nosotros", "contact"],
    ["comunidad", "community"], ["recompensas", "rewards"],
  ],
  en: [
    ["delivery", "order"], ["services", "services"], ["catering", "services"],
    ["birthdays", "services"], ["corporate", "services"], ["families", "services"],
    ["breakfasts", "services"], ["surprise-breakfasts", "services"],
    ["table-decorations", "services"], ["events", "events"],
    ["locations", "locations"], ["reservations", "contact"], ["about", "stories"],
    ["reviews", "reviews"], ["careers", "contact"],
    ["community", "community"], ["rewards", "rewards"],
  ],
};

async function checkServiceShortcuts(locale) {
  const home = await request(`/${locale}`);
  const pageIds = new Set(
    [...home.body.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]),
  );
  for (const [segment, anchor] of serviceShortcuts[locale]) {
    const path = `/${locale}/${segment}`;
    try {
      const response = await fetch(new URL(path, origin), {
        redirect: "manual",
        signal: AbortSignal.timeout(15000),
      });
      const target = new URL(response.headers.get("location") ?? "", origin);
      const dedicatedSegments = {
        pl: ["uslugi", "lokale", "o-nas", "spolecznosc", "nagrody"],
        es: ["servicios", "restaurantes", "nosotros", "comunidad", "recompensas"],
        en: ["services", "locations", "about", "community", "rewards"],
      };
      const dedicated = dedicatedSegments[locale].includes(segment);
      if (dedicated) {
        const html = await response.text();
        report(response.status === 200 && /<main\\b/i.test(html) && /<h1\\b/i.test(html),
          `${path} muestra página independiente con título y contenido, en ${locale}`);
        continue;
      }
      report(
        [302, 303, 307, 308].includes(response.status) &&
        target.origin === new URL(origin).origin &&
        target.pathname === `/${locale}` &&
        target.hash === `#${anchor}` &&
        pageIds.has(anchor),
        `${path} lleva a la sección publicada #${anchor}, en ${locale}`,
      );
    } catch (error) {
      report(false, `${path}: ${String(error)}`);
    }
  }
}

async function checkMenuPage(locale) {
  const path = `/${locale}/menu`;

  try {
    const result = await request(path);
    report(result.status === 200, `${path} responde HTTP 200`);
    report(result.body.includes("Rincón Colombiano"), `${path} muestra la marca`);
    report(/<main\b/i.test(result.body), `${path} tiene contenido principal`);
  } catch (error) {
    report(false, `${path}: ${String(error)}`);
  }
}

async function checkInfrastructure() {
  try {
    const robots = await request("/robots.txt");

    report(
      robots.status === 200,
      "robots.txt responde correctamente"
    );

    const blocksAllCrawlers = /^Disallow:\s*\/\s*$/im.test(robots.body);
    report(
      previewMode ? blocksAllCrawlers : !blocksAllCrawlers,
      previewMode
        ? "Preview no expone sus páginas a buscadores"
        : "Producción permite indexar páginas públicas"
    );
  } catch (error) {
    report(false, `robots.txt: ${error}`);
  }

  try {
    const sitemap = await request(
      "/sitemap.xml"
    );

    report(
      sitemap.status === 200 &&
      sitemap.body.includes("<urlset"),
      "sitemap.xml disponible"
    );
    for (const lang of ["pl-PL", "es", "en", "x-default"]) {
      report(
        sitemap.body.includes(`hreflang="${lang}"`),
        `sitemap anuncia solo alternates equivalentes: ${lang}`
      );
    }
    report(
      !/brzeska/i.test(sitemap.body),
      "sitemap no indexa la sede Brzeska mientras no abra"
    );
  } catch (error) {
    report(false, `sitemap.xml: ${error}`);
  }
}

async function main() {
  console.log(
    `Verificando Rincón Colombiano: ${origin}`
  );

  for (const locale of locales) {
    await checkPage(locale);
    await checkMenuPage(locale);
    await checkContactAndLegal(locale);
    await checkOrderShortcut(locale);
    await checkServiceShortcuts(locale);
  }

  await checkInfrastructure();

  console.log(
    `Resultado: ${errors} errores`
  );

  if (errors > 0) {
    process.exitCode = 1;
  }
}

await main();
