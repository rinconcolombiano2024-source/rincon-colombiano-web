# Release RINCÓN COLOMBIANO WEB — SumUp y diagnóstico CPU (13-10-2026)

## Cambios reales
- CEO `/admin/operations`: nueva señal SumUp explícitamente **bloqueada** hasta que la cadena financiera RC ORDERA se compruebe. No confundimos el código de Checkout con cobros reales.
- Límite de **2 consultas simultáneas** para los seis activos de marca y después para los tres idiomas de campañas, en lugar de nueve accesos concurrentes. El catálogo de RC ORDERA y la consulta del dominio se ejecutan de forma independiente. No se cambian textos publicados, menús, precios, clientes, pagos ni pedidos.
- Pruebas de 100 tareas: máximo 2 activas, mismos datos y orden; estados SumUp sin falsos positivos.
- Cero claves SumUp en Next.js, PWA o ejecutable Windows. SumUp procesa sólo desde el backend seguro de RC ORDERA; sin duplicación de pedidos.

## Para activar cobros de verdad
La cuenta SumUp que usa actualmente `rinconcolombiano.pl` es un producto hospedado separado. No significa que la integración del libro de pedidos RC ORDERA esté lista. El adaptador seguro existente `sumup-checkout` de RC ORDERA está desactivado. Antes de habilitarlo hay que validar su migración financiera con datos de staging, sus secretos y política de restauración, comprobación de PAID en proveedor, pago de prueba/reversión y control de double charge.

## Publicación
El dominio oficial sigue mostrando la web hospedada por SumUp, no este Next.js. Aun con GitHub Actions verde, **no** es una publicación en Vercel ni un cambio de DNS. Mantener el sitio anterior operativo hasta enlazar Vercel y obtener autorización explícita para cortar tráfico.
