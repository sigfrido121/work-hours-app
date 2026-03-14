# Arquitectura del Proyecto: Gestor de Horas de Trabajo

Este documento describe la arquitectura y las decisiones técnicas para el desarrollo de la aplicación web de gestión de horas.

## 1. Visión General
El objetivo es construir una aplicación web robusta, escalable y profesional que permita a un usuario registrar, visualizar y gestionar sus horas de trabajo.

## 2. Stack Tecnológico (La Selección Profesional)

Para cumplir con los estándares de la industria actual, hemos seleccionado las siguientes tecnologías:

### **Frontend & Backend Framework: Next.js**
- **Por qué:** Next.js es el framework de React más utilizado profesionalmente. Ofrece renderizado híbrido (Server-Side y Client-Side), excelente rendimiento y manejo de rutas integrado.
- **Beneficio:** Permite tener el Frontend y la API en un solo proyecto mantenible, ideal para equipos ágiles y proyectos que buscan escalabilidad.

### **Base de Datos: MongoDB (Docker)**
- **Por qué:** Base de datos NoSQL orientada a documentos. Es flexible y se adapta perfectamente a estructuras de datos JSON como los registros de tiempo.
- **Docker:** Utilizamos un contenedor Docker para aislar la base de datos, garantizando que el entorno sea consistente y fácil de gestionar sin instalar servicios globales en el sistema.

### **Estilos: CSS Modules / Vanilla CSS Moderno**
- **Por qué:** Para demostrar dominio real del desarrollo web, utilizaremos CSS estándar (con CSS Modules para modularidad).
- **Beneficio:** Control total sobre el diseño, alto rendimiento y sin dependencia de frameworks pesados de UI, lo cual es muy valorado en perfiles de ingeniería senior.

## 3. Diagrama de Arquitectura

```mermaid
graph TD
    User[Usuario] -->|Navegador Web| Client[Cliente Next.js (React)]
    Client -->|API REST| API[API Routes (Next.js Server)]
    API -->|Mongoose ODM| DB[(MongoDB Docker Container)]
```

## 4. Estándares Profesionales a Seguir
Para asegurar que este proyecto te ayude a formarte como profesional:
- **Clean Architecture:** Separación clara de responsabilidades (UI, Lógica de Negocio, Acceso a Datos).
- **Git Flow:** Uso de control de versiones con mensajes de commit semánticos.
- **Tipado Estático:** Aunque usaremos Javascript inicialmente (o TypeScript si lo prefieres en el futuro), mantendremos estructuras de datos estrictas.
