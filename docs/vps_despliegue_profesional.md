# 🌐 Guía de Ingeniería: Despliegue en Servidor (VPS)

Pasar de "mi máquina" a "un servidor en la nube" es el rito de iniciación de todo ingeniero. Aquí la seguridad y la disponibilidad son lo primero.

## 1. ¿Qué es un VPS? (Virtual Private Server)
Imagina que alquilas una habitación en un hotel (el servidor físico). Tienes tus propias llaves, tus muebles y nadie puede entrar sin tu permiso. Es una máquina Linux (normalmente Ubuntu) corriendo 24/7 en un centro de datos.

### Conceptos Crueciales para este nivel:
*   **SSH (Secure Shell):** Es el "túnel" seguro para entrar a tu servidor desde tu Mac. Todo comando que lances va cifrado.
*   **Reverse Proxy (Nginx):** Es el "recepcionista". Tu app corre internamente en el puerto 3000, pero el usuario entra por el puerto 80 (HTTP) o 443 (HTTPS). Nginx recibe la visita y la redirige a tu app.
*   **DNS:** El sistema que traduce `tu-app.com` a la dirección IP de tu servidor.
*   **SSL (Certbot/Let's Encrypt):** El candadito verde. Cifra los datos entre el usuario y tu servidor. Sin esto, hoy en día una aplicación no es profesional.

## 2. La Estrategia Profesional: Git-Directed Deployment
No vamos a copiar archivos con "Arrastrar y Soltar" (eso es de aficionados). Usaremos **Git** y **Docker Compose**.

### El Flujo de Trabajo:
1.  **Preparación:** instalamos Docker y Nginx en el VPS una sola vez.
2.  **Entrega:** Sincronizamos el código vía GitHub o Git directo.
3.  **Ejecución:** Docker Compose recrea el entorno exacto que tienes en local.
4.  **Exposición:** Configuramos Nginx para que el mundo vea tu app.

## 3. Seguridad Básica (The Firewall)
En un VPS, estamos expuestos a ataques. Como ingeniero, debes:
1.  Cerrar todos los puertos excepto 22 (SSH), 80 y 443.
2.  Usar llaves SSH en lugar de contraseñas.
3.  Mantener el sistema actualizado con `sudo apt update`.

---

*“La nube no es más que el ordenador de otro, configurado por un experto.”*
