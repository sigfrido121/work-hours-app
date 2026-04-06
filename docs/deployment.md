# Arquitectura y Despliegue — Work Hours App

## Infraestructura

```
Internet
   │
   ▼
Cloudflare (horas.elchuloflaco.org)
   │
   ▼
VPS Ubuntu — 158.179.212.168
   │
   ├── nginx-proxy (proxy-net)          ← enruta tráfico HTTPS
   │
   ├── work-hours-app (puerto 3005)     ← Next.js 16
   │     redes: gasolina-app_app-network, proxy-net
   │
   └── gasolina_db                      ← MongoDB
         red: gasolina-app_app-network
```

## Ruta de despliegue en el VPS

```
/mnt/miDisco/apps/work-hours-app/
  ├── .env.production      ← variables secretas (NO en repo)
  ├── docker-compose.vps.yml
  ├── Dockerfile
  └── src/ ...             ← código sincronizado por git pull
```

## Flujo de despliegue (GitHub Actions)

```
Desarrollador
   │
   └─ git push origin main
           │
           ▼
   GitHub Actions (.github/workflows/deploy.yml)
           │
           ├─ Checkout código
           ├─ Set up SSH (secret: SSH_PRIVATE_KEY, VPS_HOST)
           └─ SSH al VPS:
                 cd /mnt/miDisco/apps/work-hours-app
                 git pull origin main
                 docker compose -f docker-compose.vps.yml down
                 docker compose -f docker-compose.vps.yml build --no-cache
                 docker compose -f docker-compose.vps.yml up -d
```

## docker-compose.vps.yml (configuración correcta)

```yaml
services:
  web:
    container_name: work-hours-app
    build:
      context: /mnt/miDisco/apps/work-hours-app
    image: work-hours-web
    ports:
      - "3005:3000"
    env_file:
      - .env.production       # ← ÚNICA fuente de variables. NO añadir bloque environment:
    networks:
      - gasolina-app_app-network
      - proxy-net
    restart: unless-stopped
```

**CRÍTICO**: No añadir un bloque `environment:` con `MONGODB_URI=${MONGODB_URI}`.
Si la variable no existe en el shell cuando se ejecuta `docker compose`, se inyecta como
cadena vacía y sobrescribe el valor de `env_file`, rompiendo la conexión a MongoDB.

## Conexión a MongoDB

El contenedor `work-hours-app` se conecta a `gasolina_db` (contenedor MongoDB de otro
proyecto) a través de la red Docker `gasolina-app_app-network`. La URI es:

```
mongodb://admin:<password>@gasolina_db:27017/work-hours?authSource=admin
```

`gasolina_db` es el hostname dentro de la red Docker. No es accesible desde fuera
del VPS ni desde la máquina local del desarrollador.

## Variables de entorno en el VPS

Fichero: `/mnt/miDisco/apps/work-hours-app/.env.production`
Este fichero **no está en el repositorio** y debe mantenerse manualmente en el VPS.
Si se pierde, la app no arranca. Contiene:

```
NEXTAUTH_URL=https://horas.elchuloflaco.org
NEXTAUTH_SECRET=<valor>
GOOGLE_CLIENT_ID=<valor>
GOOGLE_CLIENT_SECRET=<valor>
MONGODB_URI=mongodb://admin:<password>@gasolina_db:27017/work-hours?authSource=admin
```

## Secrets de GitHub Actions

En `github.com/sigfrido121/work-hours-app → Settings → Secrets`:
- `SSH_PRIVATE_KEY`: clave privada SSH para acceder al VPS
- `VPS_HOST`: IP del VPS (158.179.212.168)

## Diagnóstico rápido

```bash
# Ver logs en tiempo real
ssh -i .git/maquina_ppal.key ubuntu@158.179.212.168 "docker logs work-hours-app --tail 50 -f"

# Verificar variables de entorno del contenedor
ssh -i .git/maquina_ppal.key ubuntu@158.179.212.168 \
  "docker inspect work-hours-app --format '{{range .Config.Env}}{{println .}}{{end}}'"

# Comprobar estado
ssh -i .git/maquina_ppal.key ubuntu@158.179.212.168 "docker ps --filter name=work-hours-app"

# Ver último run de GitHub Actions
curl -s -H "Authorization: token <GITHUB_TOKEN>" \
  "https://api.github.com/repos/sigfrido121/work-hours-app/actions/runs?per_page=3"
```

## Errores frecuentes y soluciones

### `MONGODB_URI` vacío → `MongooseServerSelectionError: ECONNREFUSED 127.0.0.1:27017`
**Causa**: Bloque `environment:` en docker-compose sobrescribe `env_file` con cadena vacía.
**Fix**: Eliminar el bloque `environment:` del `docker-compose.vps.yml`.

### `E11000 duplicate key error` en POST de entries
Puede tener dos causas:

**Causa A**: `findOneAndUpdate` sin `$set` en el update. MongoDB intenta insertar en vez de actualizar.
**Fix**: Usar `{ $set: { ...body, date, userId } }` como segundo argumento.

**Causa B**: Índice obsoleto `date_1` (único solo por fecha) que sobrevive de la versión sin auth.
El nuevo schema usa un índice compuesto `{ userId, date }` — el índice viejo bloquea cualquier
fecha ya registrada aunque sea de otro usuario.
**Fix** (operación única en la BD, ya aplicada):
```bash
docker exec gasolina_db mongosh 'mongodb://admin:<pass>@localhost:27017/work-hours?authSource=admin' \
  --eval 'db.entries.dropIndex("date_1")'
```
Índices correctos resultantes: `_id_`, `userId_1`, `userId_1_date_1` (unique).

### GitHub Actions falla con `Conflict. The container name "/work-hours-app" is already in use`
**Causa**: Existe un contenedor con ese nombre creado por fuera del compose de Actions
(deploy manual previo desde otra ruta).
**Fix**:
```bash
# Identificar qué compose controla el contenedor
ssh ubuntu@VPS "docker inspect work-hours-app --format '{{index .Config.Labels \"com.docker.compose.project.working_dir\"}}'"
# Parar el contenedor intruso
ssh ubuntu@VPS "cd <ruta-del-compose-intruso> && docker compose down"
# Re-lanzar Actions via workflow_dispatch o nuevo push
```

### Actions despliega pero la app sigue igual (caché de imagen)
El workflow usa `--no-cache` en build, así que siempre reconstruye. Si parece que no cambia,
verificar que el `git pull` en el VPS cogió los últimos commits:
```bash
ssh ubuntu@VPS "cd /mnt/miDisco/apps/work-hours-app && git log --oneline -3"
```

## Lo que NO hacer

- **NO** copiar archivos al VPS con `scp` y reconstruir Docker manualmente. Desincroniza
  el repo del VPS con lo que Actions espera y puede dejar un contenedor "huérfano" que
  bloquea el siguiente deploy de Actions.
- **NO** hacer `docker compose up` desde `/home/ubuntu/...` u otra ruta — solo desde
  `/mnt/miDisco/apps/work-hours-app`.
- **NO** modificar `.env.production` en el VPS sin documentar el cambio (el fichero no
  está en el repo, si se pierde hay que reconstruirlo manualmente).
