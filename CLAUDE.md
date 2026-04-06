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

### Bugs conocidos (ya corregidos, no revertir)
1. `findOneAndUpdate` debe usar `{ $set: {...} }` — sin `$set` causa E11000 duplicate key en upsert aunque el documento ya exista
2. `docker-compose.vps.yml` no debe tener bloque `environment:` con `MONGODB_URI=${MONGODB_URI}` — sobrescribe el valor de `env_file` con cadena vacía si la variable no existe en el shell

### Generales
- Leer el archivo antes de modificarlo
- No crear archivos `.md` salvo que se pida explícitamente
- No refactorizar código que no se pidió tocar
- No añadir dependencias sin preguntar
- Commits en español, mensajes concisos en imperativo
