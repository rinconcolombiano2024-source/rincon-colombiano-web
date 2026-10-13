
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
