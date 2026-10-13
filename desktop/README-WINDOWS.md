RINCÓN COLOMBIANO — CEO & ADMINISTRACIÓN (WINDOWS)
===================================================

APLICACIÓN DE ESCRITORIO — distribución x64 portable

El archivo RinconColombianoAdmin.exe es una aplicación nativa para
Windows 10/11. Abre el panel administrativo de Rincón Colombiano en una
ventana independiente con Microsoft Edge WebView2.

DOS VERSIONES INDEPENDIENTES — EL DOMINIO SE CAMBIA AL FINAL
================================================================
El workflow de Windows entrega DOS ZIP separados:

1. RinconColombiano-CEO-Windows-x64
   Ejecutable: RinconColombianoAdmin.exe
   Origen fijado en la compilación: https://rinconcolombiano.pl/admin
   Uso: PRODUCCIÓN únicamente después de la migración final del dominio.

2. RinconColombiano-CEO-Windows-STAGING-x64
   Ejecutable: RinconColombianoCEOStaging.exe
   Origen fijado en la compilación: https://rincon-colombiano-web.vercel.app/admin
   Uso: PRUEBAS antes de cambiar el dominio (ventana marcada
   "[PRUEBAS · VERCEL]"). No sustituye al ejecutable definitivo.

Ninguno permite escribir una dirección arbitraria ni configurar un servidor
por parámetros o variables del sistema. Ambos comprueban por HTTPS y sin
seguir redirecciones el manifiesto real de /admin antes de mostrar el login.
Si el alias de Vercel está desactualizado, bloqueado o sin manifiesto, la
aplicación de pruebas NO abre un login alternativo.

IMPORTANTE: los perfiles WebView2 son distintos, por lo que no comparten
cookies ni sesiones entre producción y pruebas. Antes de ensayar cambios
en productos, precios, usuarios o pagos, confirmar que el despliegue de
staging usa BASES DE DATOS y cuentas de PRUEBA completamente separadas.
Si Vercel tiene conectado el Supabase/RC ORDERA de producción, limitarse
a las pruebas de lectura y navegación; no guardar cambios reales.

Un ZIP compilado correctamente no acredita que el servidor staging esté
accesible, que sus credenciales funcionen ni que se hayan completado
las pruebas operativas. NO CAMBIAR el DNS de SumUp para habilitar Windows.

CÓMO ABRIR
1. Extraer todo el ZIP descargado desde GitHub Actions.
2. Abrir RinconColombianoAdmin.exe (producción) o
   RinconColombianoCEOStaging.exe (pruebas), según el ZIP descargado.
3. Si Windows solicita instalar Microsoft Edge WebView2 Runtime, obtenerlo
   únicamente desde el sitio oficial de Microsoft.
4. La app comprueba que su origen HTTPS fijo contiene el manifiesto
   propio de administración antes de mostrar cualquier login.
5. Iniciar sesión con una cuenta autorizada de Rincón Admin.
6. Para cambiar menú/productos, el editor requiere una segunda sesión
   con la cuenta propietaria de RC ORDERA.
7. La barra de accesos rápidos incluye CEO, Menú y productos, Editar web,
   SEO, Publicidad, Fotografías y Contenidos. No permite abrir direcciones
   arbitrarias: cada botón apunta a una ruta administrativa oficial.
8. Si cambias productos desde el editor, aplica cada formulario al borrador
   y luego pulsa «Guardar en RC ORDERA». Un cambio sin guardar no se envía.
   El editor avisa si intentas cerrar o recargar la pestaña con un borrador
   modificado; no confíes en el aviso para navegación interna del sitio.
9. Mientras se sube una foto de producto el selector de otros productos
   queda bloqueado; espera a finalizar para cambiar de producto.
10. Antes de modificar el menú descarga la copia de seguridad JSON.

IMPORTANTE SOBRE EL LANZAMIENTO
El dominio rinconcolombiano.pl puede continuar sirviendo la antigua web
de SumUp hasta que la nueva Next.js esté desplegada. En ese caso la
aplicación mostrará "Administración aún no publicada", sin abrir una
página distinta ni recoger credenciales. Después del despliegue, usar
"Actualizar". NO cambiar DNS para arreglar este mensaje sin antes
verificar staging, pedidos y pagos.

PRIVACIDAD Y SEGURIDAD
- Sólo navega dentro de /admin en el dominio HTTPS oficial.
- Los enlaces externos se abren en el navegador predeterminado.
- No contiene contraseñas ni claves privadas ni credenciales Supabase.
- Los permisos de acceso, roles y RPC se aplican desde la aplicación web
  y bases de datos; instalar este ejecutable no concede permisos de CEO.
- WebView2 puede almacenar cookies de sesión en el perfil local protegido
  de Windows; cerrar sesión antes de compartir el computador.
- No funciona sin conexión a Internet. No almacena offline los pedidos.
- El archivo SHA256.txt permite comprobar la integridad del ejecutable.

FIRMA DIGITAL
Este primer ejecutable se genera en GitHub Actions sin certificado
comercial de firma de código. Windows SmartScreen puede advertir sobre
un editor no verificado. Para producción empresarial se recomienda
adquirir un certificado de firma y firmar el paquete dentro de un
proceso de liberación controlado. No se recomienda desactivar la
protección SmartScreen del equipo.

REQUISITOS
- Windows x64 compatible con .NET 10 y Microsoft Edge WebView2 Runtime.
- Conexión HTTPS a rinconcolombiano.pl.
- Cuentas autorizadas de Rincón Admin y, para la edición de menú,
  cuenta propietaria de RC ORDERA.
- La web nueva tiene que estar desplegada antes de usarla de verdad.

COMPILACIÓN DESDE CÓDIGO
La carpeta desktop/RinconColombianoAdmin incluye el código fuente.
El workflow .github/workflows/windows-ceo-desktop.yml construye DOS
distribuciones portables: una para el dominio comercial y otra de pruebas
para el alias oficial de Vercel, con nombres, perfiles y SHA256 separados.
El artefacto generado se conserva durante 30 días; guardar una copia
en una versión (Release) firmada antes de distribución general.
