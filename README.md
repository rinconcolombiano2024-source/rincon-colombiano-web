# 🇨🇴 Rincón Colombiano Web

Sitio web oficial de **Rincón Colombiano**, restaurante de gastronomía colombiana en Varsovia, Polonia.

Este proyecto será la plataforma web pública de Rincón Colombiano y estará integrado con **RC ORDERA** para pedidos en línea, domicilios, menú, reservas y otras funciones digitales del restaurante.

---

## 🌐 Dominio oficial

https://rinconcolombiano.pl

> El dominio se conectará a esta aplicación únicamente cuando la nueva web esté completamente probada y lista para producción.

---

## 🎯 Objetivo del proyecto

Crear una página web moderna, rápida, segura y optimizada para Google que permita a los clientes:

- Conocer Rincón Colombiano
- Consultar el menú
- Realizar pedidos en línea
- Solicitar domicilio
- Recoger pedidos en el restaurante
- Consultar horarios
- Encontrar nuestros locales
- Reservar mesa
- Solicitar catering
- Contactar con el restaurante
- Conocer nuestra historia
- Acceder a promociones
- Utilizar la página en varios idiomas

---

## 🛒 Integración con RC ORDERA

RC ORDERA será el sistema encargado de gestionar funciones como:

- Productos
- Categorías
- Precios
- Disponibilidad
- Pedidos
- Clientes
- Restaurantes
- Delivery
- Recogida en local

La web pública de Rincón Colombiano consumirá la información necesaria desde RC ORDERA para evitar duplicar datos.

### Arquitectura general

```text
Google
   │
   ▼
rinconcolombiano.pl
   │
   ├── Información
   ├── Menú
   ├── Locales
   ├── Catering
   ├── Reservas
   │
   └── Pedidos online
           │
           ▼
       RC ORDERA
           │
           ▼
        Supabase


---

## Administracion de escritorio (PWA)

El panel en `/admin` incluye manifiesto, iconos 192/512 PNG y un
service worker **network-only**. En Chrome/Edge, despues de iniciar
sesion, puede instalarse como aplicacion de escritorio desde el menu
del navegador o mediante el boton de instalacion cuando aparezca.
No es un instalador EXE. Requiere HTTPS, conexion y sesion autorizada.

El worker **nunca almacena** datos de clientes, respuestas de API,
HTML privado, tokens o cookies. Instalacion no otorga ningun permiso.

## Catalogo conectado con RC ORDERA

`/admin/menu` proporciona una vista protegida del catalogo publico de
Czapelska, con productos, precios y disponibilidad. Su lectura utiliza
la configuracion del conector RC ORDERA ya existente y una cache de
hasta cinco minutos. Si el backend no esta disponible se muestra un
estado de error en vez de datos ficticios.

**Importante:** este modulo es de SOLO LECTURA. Para editar productos,
precios, imagenes del menu y stock desde aqui falta establecer una API
de escritura autenticada, autorizada por sede y auditada en RC ORDERA.
Las claves anon/publicas no se deben usar para dichas mutaciones.

El CMS de contenido y el gestor de imagenes de marca ya tienen
pantallas administrativas en este repositorio, pero la biblioteca
multimedia editorial completa sigue pendiente.

## Verificacion automatizada

Quality Gate comprueba TypeScript, ESLint, build de Next.js y ahora
tambien hace un smoke test de HTTP del manifiesto, iconos, worker,
login y rechazo de acceso al menu privado sin sesion.

```bash
node scripts/smoke-admin-pwa.mjs http://127.0.0.1:3100
```

Una ejecucion verde **no garantiza** que se hayan validado pedidos,
pagos, despliegue en el dominio publico ni flujos E2E con cuentas
reales. Esas pruebas requieren un entorno operativo de RC ORDERA.


## Campañas comerciales multilingües

El administrador autorizado abre `/admin/marketing` para preparar
una campaña destacada independiente en **polaco, español e inglés**.
El editor reutiliza `web_cms_drafts`, el control de revisión y la
publicación del CMS existente; no hay tablas duplicadas.

1. Un `owner` o `editor` crea/edita un borrador por idioma.
2. Un `owner` o `publisher` lo publica tras revisar los textos.
3. La portada `/<idioma>` muestra el banner `home_campaign` cuando
   está publicado como tipo `promotion`; enlaza al menú del idioma.
4. Un `owner` o `publisher` puede retirar la campaña publicada
   sin borrar su borrador mediante `web_campaign_unpublish`.

La operación de retirada exige rol activo, idioma permitido y revisión
exacta, registra auditoría y niega acceso anónimo. Ejecutar la
migración `202610120001_web_campaign_unpublish.sql` en cada entorno
de Supabase Web antes de activar retirada en ese entorno. Las
publicaciones pueden tardar hasta cinco minutos en actualizar la caché.

Las fotos principales se gestionan hoy con `/admin/brand`.
La biblioteca multimedia editorial general aún necesita desplegar
el pipeline completo de las migraciones `20261007*` / `20261008*`,
con procesado, control de malware y permisos antes de exponer subida
de archivos de clientes. No se habilitan imágenes arbitrarias
sin ese proceso de seguridad.

**Nota importante:** pasar CI no publica automáticamente este nuevo
sitio en `rinconcolombiano.pl`; el dominio y las variables de Vercel
se deberán verificar antes de sustituir la web pública existente.


## Galería comercial de fotografías

`/admin/brand` permite ahora subir, revisar y publicar imágenes en
los slots `hero_primary`, `campaign_primary`,
`food_featured_1`, `food_featured_2` y `food_featured_3`
además de los logotipos, favicons y recursos Open Graph.

Un administrador autorizado sube una imagen PNG/JPEG/WebP/AVIF
validada por firma binaria y límite de tamaño. El panel la deja como
borrador hasta que se publique. La web pública muestra únicamente
recursos publicados: la foto de campaña aparece junto al anuncio, y
las tres fotos de platos forman una galería responsive y localizada.
Sin fotos publicadas no se generan falsos platos ni espacios vacíos.

La migración `supabase/migrations/202610120002_web_brand_commercial_slots.sql`
corrige un problema real de la base de datos: `hero_primary` ya
estaba declarado en el código pero no permitido por el CHECK SQL ni
por la RPC `web_brand_register_asset`. Se requiere su aplicación
en Supabase **Web** antes de subir esas imágenes.

**Límite de alcance:** son cinco espacios para fotografías editoriales
de la web; no reemplazan una biblioteca ilimitada de archivos ni el
editor autenticado de las imágenes de productos en RC ORDERA.


## Editor de productos RC ORDERA desde Rincón Admin

La ruta protegida `/admin/menu` incluye un editor de productos ya
existentes, con precio, nombre, descripción, disponibilidad e imágenes.
No utiliza una copia del menú: consulta `app_settings` en el proyecto
Supabase de RC ORDERA (sede Czapelska), aplica cambios inmutables y
guarda mediante su RPC existente `save_current_restaurant_menu`.

**Autorización en dos niveles:**

1. El servidor web exige iniciar sesión como propietario/editor de
   Rincón Admin. Una cuenta `publisher` sólo puede consultar el menú.
2. Dentro del editor se autentica **por separado** el propietario
   del restaurante en Supabase de RC ORDERA. El usuario autenticado
   debe coincidir con el ID de la sede. La RLS de `app_settings` sólo
   permite leer su propia fila y la RPC comprueba el rol de propietario.
3. Nunca se utiliza `service_role` para escribir en RC ORDERA ni se
   transmiten credenciales de una instancia Supabase a la otra. La
   sesión RC ORDERA vive sólo en memoria: sin localStorage persistente.
4. Los guardados incluyen `menu_revision` optimista para impedir que
   otro dispositivo sobrescriba cambios. La función RC ORDERA también
   rechaza el borrado accidental de todo el menú.

La edición requiere en el despliegue de Next.js (variables de entorno
**sólo de servidor**, no `NEXT_PUBLIC_`):

```env
RC_ORDERA_SUPABASE_URL=https://<proyecto-rc-ordera>.supabase.co
RC_ORDERA_SUPABASE_ANON_KEY=<clave-publica-rc-ordera>
```

La clave publicable/anon no concede autorización por sí sola; los
permisos se validan con la sesión real RC ORDERA y sus RPC/RLS.

### Subida de fotografías de productos

Usa el bucket preexistente `restaurant-media` de RC ORDERA.
Valida firma binaria PNG, JPG o WebP, máximo 2 MiB. El archivo se
guarda bajo `<owner_id>/products/...` según la política de Storage
del propietario. La URL se incorpora al borrador; queda efectivamente
asociada al producto al pulsar «Guardar en RC ORDERA».

Al subir una foto y luego abandonar la edición puede quedar un
archivo todavía no referenciado; un proceso de limpieza deberá
administrar estos objetos temporales, sin borrar imágenes en uso.

### Respaldo y cambios seguros

- Descargar copia JSON con revisión antes de empezar.
- Actualizar sólo campos comerciales de productos existentes.
- Conservar ID, categorías, orden, traducciones, modificadores,
  estaciones y otros metadatos de RC ORDERA.
- Recargar si hay conflicto de revisión; no sobrescribir a ciegas.
- No se pueden crear o eliminar productos desde este módulo todavía.
- No se modifica la base de datos ni los pedidos durante el build/CI.

Pruebas: `node --experimental-strip-types scripts/check-rc-menu-editor.mjs`.
La validación end-to-end de login propietario y guardado real debe
hacerse en un entorno controlado con una cuenta RC ORDERA autorizada
antes de considerarlo completamente certificado.
