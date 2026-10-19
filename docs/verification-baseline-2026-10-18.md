# Informe inicial de verificación — 2026-10-18

## Evidencia inspeccionada
- Repositorio GitHub accesible; rama base `main`.
- `package.json`: Next.js 16.3.8, React 19.3.0, Supabase SSR y JS; scripts `build`, `lint` y `typecheck`.
- `README.md`: documenta panel administrativo PWA, editor de menú RC ORDERA con autenticación independiente, CMS, campañas y fotografías comerciales. Estas descripciones no sustituyen pruebas E2E.

## Bloqueos explícitos del README
- La aplicación administrativa es PWA; **no** existe instalador EXE certificado.
- El editor de menú requiere validación de escritura real con cuenta propietaria y pruebas en staging.
- Migraciones Supabase Web documentadas requieren comprobar aplicación por entorno.
- Biblioteca multimedia editorial completa pendiente.
- CI verde no demuestra pagos, pedidos, despliegue público ni pruebas con cuentas reales.
- Dominio comercial y variables de Vercel deben comprobarse antes de cualquier cambio de producción.

## Condiciones obligatorias para declarar 100 %
1. Capturar inventario verificable de rutas, endpoints, esquemas y permisos.
2. Ejecutar lint, typecheck, build, tests y flujos E2E en staging.
3. Probar pagos con eventos del proveedor, idempotencia y conciliación.
4. Probar RLS y permisos por rol; confirmar migraciones y respaldos.
5. Probar integración RC ORDERA y asistente IA con datos reales, sin permisos excesivos.
6. Compilar y probar instalador Windows si se requiere EXE.
7. Registrar resultados, evidencias, fecha, versión y responsables de aprobación.

## Política de cambios
No alterar producción, no ejecutar migraciones destructivas, no exponer secretos, no afirmar que los módulos están certificados sin evidencias. Este documento es un punto de control inicial, **no una auditoría integral completada**.
