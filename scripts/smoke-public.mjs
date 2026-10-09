
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
        'aria-label="Redes sociales de Rincón Colombiano"'
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
  } catch (error) {
    report(
      false,
      `${path}: ${String(error)}`
    );
  }
}

async function checkInfrastructure() {
  try {
    const robots = await request("/robots.txt");

    report(
      robots.status === 200,
      "robots.txt responde correctamente"
    );

    report(
      !/^Disallow:\s*\/\s*$/im.test(
        robots.body
      ),
      "robots.txt no bloquea todo el sitio"
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
