# Work Hours App — Guía para Claude

## Stack
- **Framework**: Next.js 16 (App Router) + React 19
- **Auth**: NextAuth v5 con Google OAuth
- **Base de datos**: MongoDB via Mongoose (contenedor `gasolina_db` en VPS)
- **Estilos**: Tailwind CSS v4
- **Tests**: Jest + Testing Library
- **Despliegue**: GitHub Actions → VPS Ubuntu (158.179.212.168)

## Estructura del proyecto
```
src/
  app/
    api/
      entries/          # GET (lista paginada), POST (upsert por fecha+userId)
        [id]/           # PUT, DELETE
      admin/
        entries/        # GET todas las entradas (solo admin)
        users/          # GET todos los usuarios (solo admin)
      auth/[...nextauth]/ # NextAuth handlers
      user/profile/     # PUT perfil de usuario
    admin/page.js       # Vista colectiva para admin
    login/page.js       # Página de login
    setup/page.js       # Completar perfil tras primer login
    page.js             # Dashboard principal
    layout.js
  auth.js               # NextAuth config (providers, callbacks JWT/session)
  auth.config.js        # Config base (sin imports Edge-incompatibles)
  middleware.js         # Protección de rutas con NextAuth
  components/
    AppHeader.js
    AuthProvider.js
    CalendarView.js
    EntryModal.js
    StatsDashboard.js
    TimeSelect.js
  lib/
    db.js               # Conexión MongoDB singleton
    models/
      Entry.js          # Schema: date, morning, afternoon, note, userId
      User.js           # Schema: googleId, email, firstName, lastName, isAdmin
    stats.js
    export.js
__tests__/lib/          # Tests unitarios
```

## Modelo de datos

### Entry
```js
{
  date: Date,           // único por userId
  userId: ObjectId,     // referencia al User
  morning:  { start, end, enabled },
  afternoon: { start, end, enabled },
  note: String,
}
```
**Índice único compuesto: `{ userId, date }`** — permite múltiples usuarios con la misma fecha.

### User
```js
{
  googleId: String,     // único
  email: String,
  firstName, lastName: String,
  isAdmin: Boolean,     // el primer usuario en registrarse es admin
  profileComplete: Boolean,
  avatar: String,
}
```

## Variables de entorno requeridas
Definidas en `.env.production` en el VPS (NO en el repo):
```
NEXTAUTH_URL=https://horas.elchuloflaco.org
NEXTAUTH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
MONGODB_URI=mongodb://admin:password@gasolina_db:27017/work-hours?authSource=admin
```

## Convenciones de código
- `'use client'` solo cuando sea necesario (hooks, eventos)
- Componentes en PascalCase, archivos en PascalCase
- Sin TypeScript — JS puro
- Sin comentarios obvios; solo lógica no evidente
- No añadir manejo de errores especulativo

## Workflow de desarrollo
```bash
npm run dev          # :3000 (requiere MONGODB_URI en .env.local)
npm test             # Jest
npm run lint
npm run build
```

## Reglas para Claude

### Despliegue — LEER ANTES DE TOCAR NADA EN EL VPS
Ver `docs/deployment.md`. Resumen crítico:
- **Nunca** desplegar manualmente con `scp` + `docker build` en el VPS
- **Siempre** hacer cambios → commit → push a `main` → GitHub Actions despliega solo
- La ruta de despliegue en el VPS es `/mnt/miDisco/apps/work-hours-app`
- La SSH key está en `.git/maquina_ppal.key` (solo para diagnóstico, no para deploy)

### Infraestructura del VPS — leer antes de diagnosticar

**MongoDB compartido:** La app NO tiene su propio contenedor de MongoDB en producción.
Usa el contenedor `gasolina_db` que pertenece al proyecto `gasolina-app`,
conectado a través de la red Docker externa `gasolina-app_app-network`.

```
work-hours-app ──────────────────────────────────────┐
                    (gasolina-app_app-network)         │
gasolina_db ─────── MongoDB en esta red compartida ───┘
gasolina_app ────── también en esta red
asistente ────────── también en esta red
```

Si `gasolina_db` cae, TODAS las apps que dependen de él fallan, incluida esta.

**Disco del VPS:**
| Disco | Punto de montaje | Uso típico |
|-------|-----------------|------------|
| `/dev/sda1` 45G | `/` | Sistema operativo |
| `/dev/sdb` 49G | `/mnt/miDisco` | Docker root + apps |
| `/dev/sdc` 49G | `/mnt/fotos` | Fotos |
| `/dev/sdd` 49G | `/mnt/openclaw_disk` | Proyecto OpenClaw |

**El Docker root dir está en `/mnt/miDisco/docker_root`** — imágenes, volúmenes y capas overlay2 consumen este disco.

### Diagnóstico rápido de problemas de BD

Antes de buscar el bug en el código, comprobar siempre:

```bash
# 1. ¿Está gasolina_db corriendo?
docker ps --filter name=gasolina_db

# 2. ¿Hay espacio en disco?
df -h /mnt/miDisco

# 3. ¿Qué dice el log de la app?
docker logs work-hours-app --tail 30
```

**Síntomas → causa:**
| Síntoma en los logs | Causa | Solución |
|---|---|---|
| `ENOTFOUND gasolina_db` | `gasolina_db` está caído o el disco lleno | Liberar espacio + `docker restart gasolina_db` |
| `No space left on device` | Disco `/mnt/miDisco` al 100% | Ver sección "Limpiar disco" |
| `E11000 duplicate key` | `findOneAndUpdate` sin `$set` | Asegurarse de usar `{ $set: {...} }` |
| `MongoServerSelectionError` | MongoDB no responde | Comprobar contenedor + red + disco |

### Limpiar disco del VPS (cuando `/mnt/miDisco` esté lleno)

Orden de seguridad (de menos a más agresivo):

```bash
# 1. Build cache — SIEMPRE seguro, no afecta contenedores activos (~5GB)
docker builder prune -f

# 2. Imágenes huérfanas (dangling) — seguro
docker image prune -f

# 3. Imágenes no usadas por ningún contenedor activo — verificar antes
docker image prune -a -f

# Ver qué está ocupando espacio
du -sh /mnt/miDisco/docker_root/overlay2
du -sh /mnt/miDisco/docker_root/volumes
```

**Nunca borrar volúmenes sin verificar qué contienen** — ahí están los datos de MongoDB.

### Diferencias local vs VPS

| Aspecto | Local (Mac) | VPS (producción) |
|---|---|---|
| MongoDB | Contenedor propio `mongodb_project` vía `docker-compose.yml` | Contenedor compartido `gasolina_db` |
| `MONGODB_URI` | `mongodb://mongodb_project:27017/work-hours` | `mongodb://admin:pass@gasolina_db:27017/work-hours?authSource=admin` |
| Variables de entorno | `.env.local` (no está en el repo) | `.env.production` en `/mnt/miDisco/apps/work-hours-app/` (no está en el repo) |
| Puerto de la app | 3000 | 3005 (Nginx hace proxy inverso) |
| Compose file | `docker-compose.yml` | `docker-compose.vps.yml` |
| Deploy | Manual (`npm run dev`) | GitHub Actions (push a `main`) |

**Consecuencia clave:** Nunca probar en local asumiendo que MongoDB tiene los mismos datos que en producción — son bases de datos completamente separadas.

### Bugs conocidos (ya corregidos, no revertir)
1. `findOneAndUpdate` debe usar `{ $set: {...} }` — sin `$set` causa E11000 duplicate key en upsert aunque el documento ya exista
2. `docker-compose.vps.yml` no debe tener bloque `environment:` con `MONGODB_URI=${MONGODB_URI}` — sobrescribe el valor de `env_file` con cadena vacía si la variable no existe en el shell
3. Al desplegar manualmente con `scp` + `docker build` se copió código desactualizado al VPS saltándose el flujo CI/CD — **nunca repetir**

### Generales
- Leer el archivo antes de modificarlo
- No crear archivos `.md` salvo que se pida explícitamente
- No refactorizar código que no se pidió tocar
- No añadir dependencias sin preguntar
- Commits en español, mensajes concisos en imperativo
