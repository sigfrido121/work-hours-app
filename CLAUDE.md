# Work Hours App — Claude Code Project

## Stack
- **Framework**: Next.js 16 (App Router) + React 19
- **Base de datos**: MongoDB via Mongoose
- **Estilos**: Tailwind CSS v4
- **Tests**: Jest + Testing Library
- **Lint**: ESLint (next/core-web-vitals)

## Estructura del proyecto
```
src/
  app/
    api/entries/        # API routes (GET, POST, PUT, DELETE)
    page.js             # Página principal
    layout.js
  components/           # Componentes React de cliente
    CalendarView.js
    EntryModal.js
    EntryList.js
    ShiftForm.js
    StatsDashboard.js
    TimeTracker.js
  lib/
    db.js               # Conexión MongoDB
    models/Entry.js     # Mongoose schema
    stats.js            # Lógica de cálculo de horas
    export.js           # Exportación CSV
__tests__/lib/          # Tests unitarios
```

## Modelo de datos — Entry
Cada entrada representa una jornada laboral:
- `date`: Date único por día
- `morning.start / morning.end / morning.enabled`
- `afternoon.start / afternoon.end / afternoon.enabled`
- `note`: texto libre

## Convenciones de código
- **'use client'** solo cuando sea necesario (hooks, eventos)
- Componentes en PascalCase, archivos en PascalCase
- Funciones utilitarias en camelCase, archivos en camelCase
- Sin TypeScript — JS puro con JSDoc donde ayude a la claridad
- Sin comentarios obvios; comentar solo lógica no evidente
- No añadir manejo de errores especulativo — solo en boundaries reales
- CSS: clases de Tailwind o clases semánticas en `globals.css` (patrón existente)

## Workflow de desarrollo
1. Tests antes de merge: `npm test`
2. Lint antes de commit: `npm run lint`
3. No commitear código con tests en rojo
4. Un commit por cambio lógico coherente

## Comandos útiles
```bash
npm run dev          # Servidor de desarrollo en :3000
npm test             # Tests con Jest
npm test -- --watch  # Tests en modo watch
npm run lint         # ESLint
npm run build        # Build de producción
docker compose up    # App + MongoDB en Docker
```

## Reglas para Claude
- Leer el archivo antes de modificarlo
- No crear archivos de documentación (.md) salvo que se pida explícitamente
- No refactorizar código que no se pidió tocar
- No añadir dependencias sin preguntar
- Respuestas concisas — el usuario es desarrollador, no necesita explicaciones básicas
- Commits en español, mensajes concisos en imperativo
