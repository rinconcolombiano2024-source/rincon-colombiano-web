RINCÓN COLOMBIANO — CEO & ADMINISTRACIÓN (WINDOWS)
===================================================

APLICACIÓN DE ESCRITORIO — distribución x64 portable

El archivo RinconColombianoAdmin.exe es una aplicación nativa para
Windows 10/11. Abre el panel administrativo de Rincón Colombiano en una
ventana independiente con Microsoft Edge WebView2.

CÓMO ABRIR
1. Extraer todo el ZIP descargado desde GitHub Actions.
2. Abrir RinconColombianoAdmin.exe desde la carpeta extraída.
3. Si Windows solicita instalar Microsoft Edge WebView2 Runtime, obtenerlo
   únicamente desde el sitio oficial de Microsoft.
4. La app comprueba que https://rinconcolombiano.pl/admin contiene el
   manifiesto propio de administración antes de mostrar cualquier login.
5. Iniciar sesión con una cuenta autorizada de Rincón Admin.
6. Para cambiar menú/productos, el editor requiere una segunda sesión
   con la cuenta propietaria de RC ORDERA.

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
El workflow .github/workflows/windows-ceo-desktop.yml construye la
distribución portable y publica el ZIP como artefacto de GitHub Actions.
El artefacto generado se conserva durante 30 días; guardar una copia
en una versión (Release) firmada antes de distribución general.
