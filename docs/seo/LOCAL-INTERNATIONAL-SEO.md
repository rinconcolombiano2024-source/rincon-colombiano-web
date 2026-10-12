# SEO local e internacional — Rincón Colombiano
Última revisión del código y del catálogo público RC ORDERA: 12/10/2026.

## Política SEO
Mercado prioritario: Varsovia, Polonia. Idiomas: **polaco, español e inglés**.
Dominio canónico: https://rinconcolombiano.pl/.

**Nunca** introducir listas enormes de recetas como contenido invisible, metatags
`keywords`, datos estructurados falsos o comidas que no se comercializan. Google
no garantiza una posición por incluir palabras clave en una etiqueta.

## Inventario contrastado con el catálogo real

Consultada la fuente `app_settings.menu` de RC ORDERA en Czapelska el
12/10/2026: contiene 42 productos en 7 categorías. Estas especialidades
se encontraron en el menú operativo y son relevantes para búsquedas
semánticas, siempre sujetas a disponibilidad actual:

| Producto existente | Consulta natural en polaco | Página legítima |
| --- | --- | --- |
| Bandeja paisa | bandeja paisa Warszawa | /pl/menu |
| Lechona tolimense | lechona kolumbijska Warszawa | /pl/menu |
| Tamal tolimense | tamales kolumbijskie Warszawa | /pl/menu |
| Empanadas de carne y papa | kolumbijskie empanadas Warszawa | /pl/menu |
| Arepa con queso y arepas rellenas | arepas kolumbijskie Warszawa | /pl/menu |
| Buñuelos | kolumbijskie buñuelos | /pl/menu |
| Patacones con hogao | patacones kolumbijskie | /pl/menu |
| Sancocho trifásico | kolumbijskie sancocho | /pl/menu |
| Dorada frita con arroz con coco | kolumbijska ryba z ryżem kokosowym | /pl/menu |
| Masato, avena, chocolate con queso | kolumbijskie napoje | /pl/menu |

El texto de SEO es una descripción breve del contenido **real y visible**
de la página. Precios y nombres de productos provienen de RC ORDERA,
no de una tabla SEO duplicada.

**Sólo oportunidades de investigación futura, NO términos insertados en
metadatos ni JSON-LD:** ajiaco, mondongo, cocido boyacense, cabro
santandereano, pepitoria, carimañolas, obleas, cholado y demás platos
de la lista general que no estén confirmados actualmente en el menú.

## Estrategia técnica implementada

- Páginas /pl, /es y /en con título y descripción originales.
- `/admin/home`: edición y publicación de título/description del inicio
  por idioma. Sin credenciales de servicio ni escrituras anónimas.
- Rutas canónicas a `https://rinconcolombiano.pl`, con `x-default`
  a polaco para el mercado principal.
- Sitemap con enlaces `hreflang` hacia páginas que existen realmente.
- Sede Czapelska abierta indexable. Sede Brzeska en preparación,
  no incluida en el sitemap ni comercializada como abierta.
- `Restaurant`, `Organization`, `WebSite` y `BreadcrumbList` JSON-LD
  existentes reutilizados sin valoraciones inventadas.
- `Menu`, `MenuSection`, `MenuItem` y `Offer` sólo cuando RC ORDERA
  devuelve platos realmente disponibles y precios PLN válidos; no inventar
  productos y no renderizar Menu JSON-LD si falla la integración.
- Verificación automática del sitemap/hreflang y del contenido comercial
  en GitHub Quality Gate.

**Limitación:** el SEO internacional requiere que el contenido de la
versión lingüística realmente se pueda leer en ese idioma. Revisar las
traducciones PL/EN de todos los productos en el origen RC ORDERA y los
textos de páginas antes de prometer posicionamiento.

## Google Search Console — despliegue en producción

1. Verificar primero que la nueva web se sirva en el dominio oficial:
   HTTPS, rutas /pl, /es, /en, /pl/menu, administración protegida y pedidos
   RC ORDERA funcionales.
2. Entrar en Google Search Console con la cuenta de la empresa.
3. Agregar la **propiedad de dominio** `rinconcolombiano.pl`.
4. Crear el registro DNS TXT solicitado por Google con el proveedor DNS
   real y esperar validación. No cambiar los registros A/CNAME
   comercialmente activos sin plan de corte y reversión.
5. En **Sitemaps**, enviar `https://rinconcolombiano.pl/sitemap.xml`.
6. Utilizar **Inspección de URL** para /pl, /pl/menu y la sede Czapelska,
   comprobar indexación, canonical, robots y contenido renderizado.
7. Revisar páginas válidas/excluidas, consultas reales en polaco,
   Core Web Vitals y rastreo móvil. No inventar impresiones o rankings.
8. Revalidar configuración tras lanzar otra sede, cambiar horarios o
   publicar un nuevo idioma.

## Bloqueos de producción

El Quality Gate no sustituye Search Console ni el funcionamiento real
del dominio. La web en `main` necesita desplegarse y verificarse en
Vercel antes de sustituir la página operativa. Probar pedidos, pagos,
recogida, entrega y permisos de la app CEO con usuarios autorizados.
No introducir `noindex` en producción salvo rutas explícitamente privadas.
