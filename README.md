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
