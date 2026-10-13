# Rincón Colombiano Web — publicación controlada con Vercel

**Regla de negocio:** La web de SumUp puede estar recibiendo visitas y pedidos. No modificar DNS, no apagar SumUp, no tocar pagos ni escrituras de RC ORDERA hasta completar la aceptación.

## 1. Separar los tres sistemas

- **Rincón Colombiano Web:** este repositorio Next.js. Vercel debe contener su build y sus variables privadas por entorno.
- **RC ORDERA:** servicio de pedidos independiente, con su aplicación actual. Este repositorio solo lee el catálogo público y redirige a la app de pedidos; el editor de menú necesita autorización explícita adicional del propietario RC ORDERA.
- **Rincón Colombiano CEO:** PWA + wrapper Windows para el panel /admin. El wrapper Windows abre el dominio HTTPS **oficial**, no un preview aleatorio; por tanto, la aplicación no validará la nueva administración hasta que el dominio oficial publique Next.js.

## 1A. Demostrar qué código está realmente publicado en Vercel

El repositorio anuncia la URL pública de Vercel **https://rincon-colombiano-web.vercel.app/**. En la inspección pública del 13-10-2026 esta URL todavía mostraba «Lechona» en la portada, aunque la última rama `main` ya había corregido el nombre a «Lechona Tolimense». Por tanto, **un enlace de Vercel activo no demuestra que los cambios actuales estén publicados**.

Para eliminar esta incertidumbre, `/release.json` devuelve únicamente `{"project":"rincon-colombiano-web","revision":"<SHA público de Git>"}`. Si Vercel no dispone del SHA legítimo, devuelve `revision:null`. Las respuestas son `no-store`; no incluyen variables privadas, claves, usuarios ni pedidos.

1. En **GitHub → Actions** seleccionar [Audit Live Vercel Alias Before Domain Switch (manual)](../.github/workflows/audit-vercel-live-alias.yml) y ejecutarlo sobre `main`. Es de solo lectura, sin secretos ni cambios de DNS y verifica estrictamente la versión anunciada en el perfil público del repositorio.
2. Si falla con 404 en `/release.json` o `STALE DEPLOYMENT`, la URL Vercel todavía sirve una versión antigua o no auditable. **No sustituir SumUp**. Si el proveedor devuelve `Deployment rate limited`, resolver la cuota y desplegar `main` antes de repetir la verificación.
3. Los workflows de preview y staging también comprueban la **misma revisión Git** que está siendo evaluada. Una compilación verde, un Deployment antiguo que figura `success` o una URL `.vercel.app` accesible no son evidencias suficientes de que está publicado el último commit.
4. Un resultado positivo solo confirma coincidencia del commit en el sitio consultado. Aún se deben comprobar RC ORDERA, pagos, panel CEO, teléfonos, consentimiento/cookies, documentos legales y planes de reversión. **La publicación en `rinconcolombiano.pl` necesita un corte separado aprobado por el propietario.**

## 2. Preparar preview en Vercel (SIN cortar dominio)

### Qué corregimos en el release gate (13 octubre de 2026)

La aplicación ya protegía las previews: `robots.txt` declaraba `Disallow: /` y sus páginas enviaban `noindex`.
Sin embargo, el antiguo workflow `Verify Vercel Staging` exigía equivocadamente los valores de SEO de **producción**, por lo que una preview correcta fallaba la validación.

Ahora `scripts/smoke-public.mjs` y `scripts/smoke-navigation.mjs` aceptan `--preview`: verifican que todos los enlaces locales sean válidos y que la preview esté protegida contra indexación. **El Quality Gate comprueba los dos modos mediante compilaciones reales diferentes**. No se relaja la política de indexación del sitio publicado.

### Despliegue provisional desde GitHub Actions (opcional, autorizado)

Hay un workflow manual adicional: [Deploy Rincón Web Vercel Preview (manual)](../.github/workflows/vercel-preview-deploy.yml).
Reutiliza el mismo repositorio y proyecto Vercel; no genera una web paralela.

1. El administrador de GitHub configura en **Settings → Secrets and variables → Actions** las credenciales `VERCEL_TOKEN`, `VERCEL_ORG_ID` y `VERCEL_PROJECT_ID`. No copiarlas en tickets, mensajes, workflows ni código.
2. En GitHub Actions lanzar **Deploy Rincón Web Vercel Preview (manual)** **sobre `main`**. El workflow se detiene si faltan secretos. Utiliza `vercel pull --environment=preview`, `vercel build` y `vercel deploy --prebuilt` — sin `--prod`, sin promover dominios ni tocar DNS.
3. El mismo workflow valida la URL resultante mediante un allowlist estricto `*.vercel.app`, verifica acceso anónimo, PWA, tres idiomas, SEO `noindex` de preview, sitemap, vínculos y secciones públicas.
4. Si el proyecto Vercel está limitado por cuota, devuelve error: **`--prebuilt` no evita necesariamente el límite de despliegues**. Resolver la cuota con Vercel antes de insistir.
5. No se aceptan pruebas como válidas si el preview responde 401/403, aunque exista Deployment Protection. Se debe habilitar un mecanismo de aceptación autenticado y seguro antes de promover.
6. El workflow no prueba pedidos reales, permisos editor con sesión, móvil físico ni Windows, y jamás asigna `rinconcolombiano.pl`. El corte a producción requiere aprobación y rollback por separado.

### Preparación del entorno

1. Conectar a Vercel el repositorio GitHub `rinconcolombiano2024-source/rincon-colombiano-web` y utilizar el framework Next.js, sin desplazar el proyecto RC ORDERA independiente.
2. Configurar variables **en Vercel**, nunca en GitHub ni en una conversación. Leer `.env.example`: `NEXT_PUBLIC_SITE_URL=https://rinconcolombiano.pl`, `NEXT_PUBLIC_APP_ENV=preview`, el endpoint/clave **pública** de Supabase web, `SUPABASE_SERVICE_ROLE_KEY` solo en servidor, `RC_ORDERA_SUPABASE_URL`, `RC_ORDERA_SUPABASE_ANON_KEY`, y `RC_ORDERA_PUBLIC_APP_URL`. Comprobar si otras funciones habilitadas necesitan variables adicionales. Las variables públicas no deben contener claves privilegiadas.
3. Configurar los roles reales de administración en `web_private.admin_members` y sus políticas RPC. La variable obsoleta `ADMIN_ALLOWED_EMAILS` **no otorga permisos**.
4. Crear un despliegue **Preview** y copiar su dominio único `https://<proyecto>-<hash>.vercel.app`. No enviar credenciales ni tokens en el enlace.
5. En GitHub abrir **Actions → Verify Vercel Staging (read-only) → Run workflow**; pegar exclusivamente el URL de preview. El flujo acepta solo HTTPS `*.vercel.app`, sin rutas, puertos, query o credenciales.
6. Exigir todas las pruebas verdes: manifiesto PWA, redirecciones a login del panel privado, HTML PL/ES/EN, sitemap, canonical, títulos, robots y enlaces/anchors públicos. **Este flujo no hace pedidos, no modifica datos y no despliega código**.
7. Si Vercel Deployment Protection responde 401/403, el flujo debe quedar rojo: establecer una forma de prueba autorizada por el administrador del proyecto. No desactivar la protección global ni compartir tokens solo para que una prueba pase.

## 3. Pruebas manuales que GitHub no sustituye

El propietario debe verificar en la URL preview, con dispositivos reales:
- Diseño Android/iPhone/tablet, focos accesibles, menú móvil y Rincón AI sin tapar formularios/botones.
- Cada flujo de producto y menú desde RC ORDERA, precios, disponibilidad, traducciones, fotos, categorías y estaciones; acciones de modificación exclusivamente con permiso propietario.
- Crear un **pedido de prueba aprobado por la empresa**, comprobar flujo cliente-restaurante-estaciones-repartidor, método de pago, caja/fiscal, reversión y notificaciones. No introducir pedidos ni cobros reales sin autorización.
- Inicio/cierre de sesión admin y roles owner/editor/publisher, subida/publicación/retirada de fotografía, campaña, SEO y textos, así como fallos de red y desincronización.
- Aplicación Windows: instalar artefacto compilado en PC, probar WebView2, navegación, autenticación y el instalador sin claves o datos embebidos. El ejecutable actual carece de firma digital corporativa.
- Google Search Console: verificar propiedad de dominio por DNS TXT **sin cambiar A/CNAME** y enviar `https://rinconcolombiano.pl/sitemap.xml` **después** de publicar el sitio nuevo.

### Protección de enlaces históricos de SumUp

Se comprobaron URLs reales de la tienda actual: `/produkty`, `/product/tamal-tolimense`, `/product/arepa-80gr`, `/produkt/chocolate-con-queso-1` y `/kategoria/entradas-przystawki`. El nuevo Next.js redirige el índice del catálogo de forma permanente (`308`) a `/pl/menu`. Las fichas individuales y categorías van al mismo menú de forma **temporal (`307`)**, ya que aún no hay una equivalencia confirmada 1:1 con los productos y los precios reales de RC ORDERA. Todos los flujos ejecutan pruebas HTTP en CI y en staging, sin crear pedidos.

**No trasladar automáticamente** `/cart`, `/koszyk`, `/checkout`, pedidos pagados, cuentas ni sesiones de SumUp. Mantener SumUp y sus datos disponibles para operaciones/pedidos previos según la política comercial; esos enlaces requieren decisión del titular y un plan de continuidad. Para recuperar posicionamiento de cada producto, verificar identificadores de RC ORDERA y diseñar páginas de producto específicas antes de convertir redirecciones individuales en permanentes.

## 4. Publicación controlada y reversión

- Respaldar la configuración DNS, confirmar acceso a SumUp/Vercel, TLS, roles, fotografías y métodos de pedido ANTES de cortar.
- Planificar una ventana comercial de bajo tráfico y un responsable de reversión; pedir autorización explícita del CEO antes de tocar DNS o transferir dominio.
- Tras el cambio comprobar HTTPS, `/pl`, `/es`, `/en`, páginas /menu, sede Czapelska abierta, Brzeska aún próxima, `/admin/login`, `/admin/manifest.webmanifest`, robots y sitemap.
- Validar el flujo RC ORDERA de extremo a extremo, canales de contacto y que los compradores siguen llegando a la app.
- Si fallan pedidos, pagos, login, SEO canónico o seguridad, volver al estado DNS anterior y mantener la página SumUp operativa mientras se diagnostica. Anotar horario/TTL de propagación.

## 5. Interpretación correcta de los controles

| Evidencia | Qué demuestra | Qué **no** demuestra |
|---|---|---|
| GitHub Quality Gate verde | Código compila, pasa pruebas unitarias y smoke local real | Despliegue Vercel o ventas reales |
| Staging Gate verde | HTTP de páginas, sitemap y PWA en URL preview accesible | Pago, pedidos autenticados o funcionamiento del ejecutable Windows |
| Windows Actions verde | EXE x64 compilado y artefacto generado | Firma digital, instalación o prueba manual en PC |
| Revisión RC ORDERA | Puede mostrar catálogo público real | Escribir menú/pedidos/pagos sin sesión propietaria |
| Dominio oficial operativo | Sitio mostrado públicamente | Pérdida cero o todas las operaciones certificadas |

**No declarar 100 % hasta combinar: pruebas automatizadas + staging + cuenta propietaria real + validación de clientes/pagos + control de DNS + revisión manual de Windows y móviles.**
