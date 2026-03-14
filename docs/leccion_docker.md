# 🎓 Guía de Ingeniería: Despliegue con Docker

¡Hola futuro Senior! Desplegar una aplicación no es solo "hacer que funcione", es asegurar que sea **reproducible**, **aislada** y **escalable**. Aquí aprenderás cómo lo hacen los profesionales.

## 1. La Filosofía Docker: "Si funciona en mi máquina, funciona en la tuya"
En el software tradicional, instalar una app dependía de la versión de Node, de si tenías MongoDB instalado, de los permisos, etc. Docker soluciona esto mediante **Contenedores**.

### Conceptos Clave:
*   **Dockerfile:** Es la "receta". Describe paso a paso cómo construir la imagen de tu aplicación (instalar Node, copiar código, instalar dependencias).
*   **Imagen:** Es el "pastel" ya horneado. Un paquete estático que contiene todo lo necesario para ejecutar la app.
*   **Contenedor:** Es una "porción" de ese pastel ejecutándose. Puedes tener muchos contenedores de la misma imagen.
*   **Docker Compose:** Es el "director de orquesta". Se encarga de levantar varios contenedores (Web + Base de Datos) y conectarlos entre sí.

## 2. Estrategia de Despliegue Profesional
Para este proyecto, usaremos un enfoque de **Multi-stage Build** en el `Dockerfile`.

### ¿Por qué Multi-stage?
1.  **Seguridad:** El contenedor final no contiene el código fuente, solo los archivos compilados.
2.  **Tamaño:** Pasamos de una imagen de ~1GB a una de ~150MB.
3.  **Rendimiento:** Solo se mantienen los archivos necesarios para la ejecución.

## 3. Flujo de Trabajo (Pipeline)
1.  **Build:** Compilamos Next.js (genera la carpeta `.next`).
2.  **Network:** Docker crea una red virtual privada donde la App y Mongo se hablan sin exponerse a internet directamente.
3.  **Persistencia:** Usamos **Volumes** para que, si el contenedor de Mongo se apaga, tus horas registradas no se borren.

---

*“Un ingeniero de software no solo escribe código que funciona; escribe sistemas que se pueden desplegar con un solo comando.”*
