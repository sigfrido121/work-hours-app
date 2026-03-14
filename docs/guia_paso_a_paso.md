# 📔 Diario de Ingeniería: Creación de WorkHours

Este documento es una bitácora técnica de cada decisión, comando y paso dado para construir esta aplicación desde cero hasta un nivel profesional.

---

## Fase 1: Cimientos y Arquitectura
Antes de escribir una sola línea de código, definimos el "plano" de la casa.
*   **Comando:** `npx create-next-app@latest .`
*   **Decisión:** Usar **Next.js App Router** por su eficiencia en el manejo de rutas y componentes de servidor.
*   **Archivos creados:** `docs/arquitectura_usuario.md` y `docs/especificacion_tecnica.md`.

## Fase 2: El Corazón de los Datos (Backend)
Configuramos la persistencia para que tus horas no se pierdan al cerrar el navegador.
1.  **Modelo de Datos:** Creamos un esquema en Mongoose (`lib/models/Entry.js`) que define exactamente qué es una "Jornada" (fecha, mañana, tarde, notas).
2.  **Conexión Singleton:** Creamos `lib/db.js` para asegurar que la app no abra miles de conexiones a la base de datos (error común de principiante).
3.  **API REST:** 
    *   `GET /api/entries`: Para listar.
    *   `POST /api/entries`: Para crear.
    *   `PUT /api/entries/[id]`: Para editar.
    *   `DELETE /api/entries/[id]`: Para borrar.

## Fase 3: La Interfaz de Usuario (UI/UX)
Buscamos que la app no solo funcione, sino que "enamore" visualmente.
1.  **Design System:** Definimos variables CSS en `globals.css` (colores, sombras, radios).
2.  **Componentización:** Creamos piezas reutilizables:
    *   `ShiftForm.js`: El formulario inteligente.
    *   `EntryList.js`: La lista dinámica.
    *   `StatsDashboard.js`: El motor de cálculos.
3.  **Estética Premium:** Aplicamos **Glassmorphism** (efecto cristal) y transiciones suaves.

## Fase 4: Funcionalidades Avanzadas
Añadimos valor real al usuario:
*   **Exportar CSV:** Creamos `lib/export.js` para que puedas descargar tus horas en Excel.
*   **Búsqueda en tiempo real:** Implementamos filtrado dinámico en `page.js`.
*   **Validaciones:** Código para evitar que la salida sea antes que la entrada.

## Fase 5: Dockerización y Despliegue
Aquí es donde estamos ahora. Estamos "empaquetando" la app para que sea indestructible.
1.  **Dockerfile:** El manual de instrucciones para construir la imagen.
2.  **docker-compose.yml:** La configuración para levantar la App y MongoDB juntas.

## Fase 6: Depuración en Producción (Troubleshooting)
Incluso a los ingenieros senior les fallan las cosas. Lo importante es saber leer los logs.
*   **Problema:** El build de Docker falló porque no encontraba la carpeta `lib`.
*   **Causa:** El alias `@/` estaba configurado solo para mirar dentro de `src/`, pero nuestra carpeta `lib` estaba en la raíz.
*   **Solución:** Modificamos `jsconfig.json` para que el alias `@/` sea inteligente y busque en ambos sitios.

## Fase 7: Conflictos de Puertos (Port Binding)
Al intentar levantar el proyecto, recibimos un error: `Bind for 0.0.0.0:27017 failed: port is already allocated`.
*   **Problema:** Ya tienes un contenedor de MongoDB corriendo en el puerto 27017. Docker no puede "atar" dos servicios al mismo puerto físico de tu Mac.
*   **Estrategia de Ingeniero:** En lugar de apagar tu otro proyecto, mapearemos nuestra base de datos al puerto **27018**.
*   **Aprendizaje:** Los servicios tienen un puerto **interno** (dentro de la red de Docker) y uno **externo** (el que tú ves en tu Mac). Podemos cambiar el externo sin afectar el código de la app.

## Fase 8: El puerto 3000 (Frontend)
Incluso tras arreglar la base de datos, el despliegue falló de nuevo.
*   **Problema:** `address already in use` en el puerto 3000.
*   **Causa:** Teníamos el comando `npm run dev` corriendo en la terminal de VS Code.
*   **Solución:** Detuvimos el proceso local (`Ctrl+C`) para liberar el puerto y permitir que Docker tomara el control.
*   **Resultado:** ¡ÉXITO! La aplicación ahora corre 100% aislada en Docker.

---

### 🎉 Conclusión del Tutor
Hemos pasado de código "suelto" en tu máquina a un **sistema profesional orquestado**. Tienes una base de datos persistente, una app optimizada y todo documentado. Este es el flujo de trabajo de una empresa de primer nivel.

---

## Fase 9: Lanzamiento de la Versión 1.0 (The Baseline)
¡Hito alcanzado! Hemos "congelado" el estado del proyecto para tener una referencia segura.
*   **Decisión:** Crear un **Tag** llamado `v1.0` que apunte al commit más estable.
*   **Comandos:**
    1.  `git init`: Iniciamos el sistema de control de versiones.
    2.  `git add .`: Seleccionamos todos los archivos del proyecto.
    3.  `git commit -m "..."`: Guardamos la "foto" oficial.
    4.  `git tag -a v1.0`: Pusimos el sello de calidad.

## Fase 10: Despliegue en el Mundo Real (VPS + Cloudflare Tunnel)
El gran salto. Hemos movido la aplicación de tu Mac a un servidor profesional.
*   **Decisión:** Usar un **Cloudflare Tunnel** para exponer la app de forma segura sin abrir puertos en el firewall del servidor.
*   **Problemas superados:**
    1.  **Permisos de SSH:** La llave tenía permisos demasiado abiertos (0755). Los ingenieros usamos `chmod 600` para asegurar que solo nosotros podamos leerla.
    2.  **Conflictos de Redes:** Tuvimos que mapear los contenedores a las redes exactas del servidor (`db-net` para la base de datos y `proxy-net` para el túnel).
    3.  **Puertos:** Evitamos el puerto 3000 por conflicto y usamos el **3005** en el host.
*   **Comandos clave:**
    1.  `rsync`: Para transferir el código de forma eficiente (solo lo que ha cambiado).
    2.  `docker compose up -d --build`: Para construir y levantar la imagen final en el servidor.
    3.  Edición de `config.yml`: Añadimos el subdominio `horas.elchuloflaco.org`.

## Fase 11: Versión 1.0.1 (Hotfixes y UX)
Primera iteración de mejora continua tras detectar errores en producción.
*   **Problema 1:** No se podía registrar solo un turno (mañana o tarde).
    *   **Solución:** Añadimos un sistema de toggles (checkboxes) para habilitar/deshabilitar turnos independientemente. Actualizamos el modelo de datos y el motor de estadísticas para ignorar turnos deshabilitados.
*   **Problema 2:** Error al actualizar registros (específicamente en versiones modernas de Next.js).
    *   **Causa:** En Next.js 15+, los `params` de las rutas dinámicas son promesas y deben ser esperados (`await`).
    *   **Solución:** Aplicamos `await params` en los controladores `PUT` y `DELETE`.
*   **Aprendizaje:** El software es un organismo vivo. Estar atento al feedback y corregir rápido es lo que hace a un equipo de ingeniería eficiente.

### 💡 Lección del Tutor:
*El software nunca está terminado. Siempre habrá un "un caso más" que no contemplaste. Diseñar para el cambio (como hicimos añadiendo el campo `enabled`) es más importante que diseñar para la perfección.*

---

## Fase 12: Versión 1.1.0 (Calendario y "Media Hora")
Evolución estética y funcional para mejorar la visualización y las finanzas.
*   **Nombre de la App:** Cambiado a **"Horas Alex"** para personalización total.
*   **Vista de Calendario:** Reemplazamos la lista infinita por un grid mensual interactivo. Permite ver de un vistazo qué días se ha trabajado y cuánto.
*   **Lógica de Redondeo:** Implementamos la regla de "media hora". Cualquier minuto extra sobre la hora se cuenta como 30 min, y cualquier minuto sobre los 30 min se cuenta como una hora completa.
*   **Reset de Formulario:** Ahora, tras guardar, el formulario se limpia automáticamente para facilitar el siguiente registro.
*   **Aprendizaje:** Las interfaces de usuario deben adaptarse a la densidad de los datos. Un calendario es mucho más eficiente para datos temporales que una lista plana.

### 💡 Lección de Ingeniería:
*No te limites a lo que el usuario pide, intenta superar su expectativa. El usuario pidió un calendario, y le hemos dado una herramienta de gestión visual con feedback inmediato.*
