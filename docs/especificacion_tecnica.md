# Especificación Técnica: Work Hours Manager

**Role:** Technical Reference for Development Team (AI & Human)
**Stack:** Next.js (App Router), MongoDB (Docker), Mongoose.

## 1. Estructura de Proyecto (Next.js App Router)

```
/app
  /api              # API Endpoints
    /entries        # CRUD para registros de horas
      route.js      # GET, POST
      /[id]
        route.js    # PUT, DELETE
  /components       # Componentes React Reutilizables
    ui/             # Botones, Inputs, Cards
    dashboard/      # Componentes específicos del dashboard
  /lib              # Lógica de Negocio y Configuración
    db.js           # Conexión a MongoDB (Singleton)
    models/         # Modelos Mongoose
      Entry.js      # Modelo de registro de horas
  /styles           # Estilos Globales y variables CSS
  layout.js         # Layout principal
  page.js           # Dashboard principal
```

## 2. Modelo de Datos (Mongoose Schema)

### `Entry` Model
Representa la jornada laboral de un día.

```javascript
/* lib/models/Entry.js */
{
  date: { type: Date, unique: true }, // Día del registro
  morning: {
    start: { type: String, default: "08:00" },
    end: { type: String, default: "12:00" }
  },
  afternoon: {
    start: { type: String, default: "14:00" },
    end: { type: String, default: "17:00" }
  },
  note: String,
  createdAt: Date
}
```

## 3. Plan de Implementación de API

### POST `/api/entries`
- **Body:** `{ date, morning, afternoon, note }`
- **Acción:** Crea o actualiza el registro para una fecha específica.
- **Retorno:** Objeto Entry.

### GET `/api/entries`
- **Acción:** Retorna lista de registros ordenados por fecha.

## 4. Estrategia de CSS (Professional Aesthetics)
- Uso de **Variables CSS** para tokens de diseño (Colores, Espaciado).
- Diseño **Mobile-First**.
- **Dark Mode** support nativo vía media query o clase en `body`.
- Animaciones sutiles (transitions) en hover y estados de carga.

## 5. Base de Datos
- **Entorno Local:** MongoDB ejecutándose en contenedor Docker (`mongodb_project`).
- **URI de Conexión:** `mongodb://localhost:27017/work-hours`
- **Variable**: `MONGODB_URI` en `.env.local`.

