# RINCÓN COLOMBIANO WEB × SUMUP — CONTROL DE ACEPTACIÓN

Fecha: 2026-10-12. **No se cobran tarjetas ni se modifica la información financiera desde este proyecto**.

## Responsabilidad única

- **RINCÓN COLOMBIANO WEB**: contenido, SEO, marketing, catálogo público y enlace al flujo de pedidos; panel CEO para mostrar el estado sin afirmar que existe un cobro probado.
- **RC ORDERA**: pedidos, propietarios, precios efectivos de la base de datos, identificadores, cocina, historial, intentos de cobro y conciliación. En este repositorio se aloja el adaptador futuro SumUp `supabase/functions/_shared/sumup-hosted.ts`.
- **SUMUP Hosted Checkout**: pasarela externa para captura de pago. Claves solo en **Supabase Edge secrets**, nunca en páginas Next.js, JS público, PWA, Windows, README ni variables `NEXT_PUBLIC_*`.

## No sustituir Stripe Connect mecánicamente

RC ORDERA conserva un modelo existente de liquidaciones por vendedor/repartidor. SumUp Hosted Checkout **no equivale a Stripe Connect**; cobrar una compra no implementa reparto de fondos, conciliación de comisiones o devoluciones. Mantener el proveedor actual desactivado en los restaurantes que no cumplan las condiciones de producción. Cualquier uso de SumUp inicialmente debe diferenciar **ventas del restaurante propio** de marketplace con terceros.

## Obligatorio antes de aceptar dinero real

1. El negocio aprueba y configura su cuenta SumUp de comercio en Polonia; se valida el método de pago BLIK contra **la cuenta y producto** habilitados.
2. RC ORDERA reserva el intento de pago de forma transaccional por pedido con referencia única, precio calculado en servidor y autorización del cliente; nunca se acepta `amount` ni `orderId` como prueba aislada de acceso.
3. Una Edge Function registra el checkout y su URL validada. Los timeouts no se reintentan a ciegas.
4. Un webhook sin confiar en la carga recibida consulta a SumUp para comprobar `PAID`, el ID, el comercio, la moneda, el importe, la referencia y el pedido. La vuelta desde navegador **no confirma pago**.
5. Eventos repetidos y solicitudes concurrentes no crean dobles cobros, cambios de estado duplicados ni notificaciones repetidas a cocina.
6. Cancelaciones, pagos fallidos, caducidad, devoluciones, disputa, conciliación financiera, tasas y extractos bancarios cuentan con procedimientos probados.
7. La implementación está sometida a tests automáticos, sandbox y pruebas manuales firmadas; solo entonces se habilita por restaurante. **No activar ningún proveedor desde esta web pública**.

## Estado al crear este cambio

- Existe panel CEO de estado; muestra **SumUp no activo**.
- Existe adaptador aislado de RC ORDERA con pruebas simuladas de red. No hay checkout SumUp público ni webhook ni conciliador desplegados.
- No se han subido claves API, no se han emitido transacciones y no se ha modificado el comportamiento de RC ORDERA en producción.
- El estado de GitHub Actions acredita pruebas de código; **no** pagos reales.

Fuentes oficiales: https://developer.sumup.com/online-payments/checkouts/hosted-checkout ; https://developer.sumup.com/online-payments/webhooks
