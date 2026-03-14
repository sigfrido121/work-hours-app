# 🐙 Guía de Ingeniería: Git, GitHub y Versionado (v1.0)

¡Excelente decisión! En el desarrollo profesional, **nunca** empiezas una nueva funcionalidad sin antes asegurar el estado actual. Esto se llama **Commitment** y **Baselining**.

## 1. ¿Por qué versionar ahora?
Imagina que vas a reformar tu cocina. Antes de tirar la primera pared, haces una "copia de seguridad" de cómo está la casa. Si la reforma sale mal, puedes volver atrás. En software, el "v1.0" es tu casa terminada y funcional.

### Conceptos Clave:
*   **Repository (Repo):** La carpeta del proyecto bajo el control de Git.
*   **Commit:** Una "foto" del estado de tu código en un momento exacto. Tiene un mensaje que explica *qué* cambió.
*   **Branch (Rama):** Caminos paralelos. `main` es la carretera principal (producción). Si quieres probar algo nuevo, creas una rama `feature/nueva-idea` para no romper la principal.
*   **Tag (Etiqueta):** Una marca especial en un commit. Decimos: "Este commit exacto es la Versión 1.0".

## 2. GitHub: Tu Almacén en la Nube
Git es la herramienta en tu Mac. **GitHub** es el servidor donde guardas el código para:
1.  **Backup:** Si tu Mac se rompe, tu código sobrevive.
2.  **Colaboración:** Otros pueden ver tu código o trabajar contigo.
3.  **Portafolio:** Los reclutadores verán cómo escribes código y cómo versionas (mensajes de commit claros = ingeniero serio).

## 3. El Proceso de Liberación (Release)
Para llegar a la v1.0, seguiremos estos pasos:
1.  **Stage:** Seleccionar qué archivos vamos a guardar (todos los que no estén en `.gitignore`).
2.  **Commit:** Guardar la foto con el mensaje "Initial Release v1.0".
3.  **Push:** Subir esa foto a GitHub.
4.  **Tag:** Ponerle la etiqueta física de "v1.0".

---

*“Un desarrollador guarda código. Un ingeniero gestiona versiones.”*
