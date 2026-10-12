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
