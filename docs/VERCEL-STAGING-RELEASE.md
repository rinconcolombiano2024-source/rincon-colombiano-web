# Rincón Colombiano Web — publicación controlada con Vercel

**Regla de negocio:** La web de SumUp puede estar recibiendo visitas y pedidos. No modificar DNS, no apagar SumUp, no tocar pagos ni escrituras de RC ORDERA hasta completar la aceptación.

## 1. Separar los tres sistemas

- **Rincón Colombiano Web:** este repositorio Next.js. Vercel debe contener su build y sus variables privadas por entorno.
- **RC ORDERA:** servicio de pedidos independiente, con su aplicación actual. Este repositorio solo lee el catálogo público y redirige a la app de pedidos; el editor de menú necesita autorización explícita adicional del propietario RC ORDERA.
- **Rincón Colombiano CEO:** PWA + wrapper Windows para el panel /admin. El wrapper Windows abre el dominio HTTPS **oficial**, no un preview aleatorio; por tanto, la aplicación no validará la nueva administración hasta que el dominio oficial publique Next.js.

## 2. Preparar preview en Vercel (SIN cortar dominio)

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
