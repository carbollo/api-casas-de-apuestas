# API Casas de Apuestas

API REST base para unificar informacion de casas de apuestas, eventos y cuotas.

## Requisitos

- Node.js 18+
- npm

## Instalacion

```bash
npm install
```

## Ejecucion

```bash
npm run dev
```

o en modo produccion:

```bash
npm start
```

## Deploy en Railway

Este proyecto ya queda listo para Railway:

- Usa `PORT` automaticamente (`src/server.js`).
- Tiene `railway.json` con `startCommand: npm start` y healthcheck en `/health`.

Pasos:

1. Crea un proyecto nuevo en Railway.
2. Conecta este repositorio de GitHub.
3. Railway detecta Node.js y construye con `npm install`.
4. Verifica que el endpoint `https://tu-app.up.railway.app/health` responda `ok`.

## Endpoints

- `GET /health` estado del servicio
- `GET /api/bookmakers` lista de casas de apuestas
- `GET /api/events` lista de eventos
- `GET /api/events?sport=football&league=LaLiga` filtra eventos
- `GET /api/odds/:eventId` cuotas de un evento por casa
- `GET /api/odds/:eventId/best` mejores cuotas por mercado/seleccion
- `GET /api/collectors/sources` lista de fuentes HTTP/WS configuradas
- `POST /api/collectors/run/http` ejecuta recoleccion desde endpoints HTTP abiertos
- `POST /api/collectors/run/ws` ejecuta captura temporal desde WebSockets abiertos
- `GET /api/collectors/snapshot` devuelve cuotas live ingeridas

## Panel de control

- URL local: `http://localhost:3000/admin`
- Desde el panel puedes:
  - Crear fuentes HTTP/WS
  - Habilitar/deshabilitar y eliminar fuentes
  - Ejecutar colectores HTTP/WS
  - Ver snapshot live de cuotas ingeridas

## Respuesta ejemplo: mejores cuotas

```json
{
  "data": {
    "event": {
      "id": "ev-001",
      "sport": "football",
      "league": "LaLiga",
      "homeTeam": "Real Madrid",
      "awayTeam": "Barcelona",
      "startsAt": "2026-04-12T19:00:00Z"
    },
    "bestOdds": {
      "1X2": {
        "home": { "value": 2.15, "bookmakerName": "Codere" },
        "draw": { "value": 3.5, "bookmakerName": "Bet365" },
        "away": { "value": 3.2, "bookmakerName": "Bwin" }
      }
    }
  }
}
```

## Siguiente paso recomendado

Reemplazar `src/data/mockData.js` por proveedores reales (API Odds, The Odds API, etc.) y mover credenciales a variables de entorno.

## Extraccion desde endpoints y WebSocket

La configuracion de fuentes esta en `src/data/sourceConfigs.js`.

1. Agrega tus URLs abiertas reales por casa (HTTP y/o WS).
2. Pon `enabled: true` en cada fuente.
3. Ejecuta:

```bash
curl -X POST http://localhost:3000/api/collectors/run/http
curl -X POST http://localhost:3000/api/collectors/run/ws -H "Content-Type: application/json" -d "{\"timeoutMs\":15000}"
```

Formato esperado por defecto:

- HTTP (array JSON): `[{ "eventId":"ev-001", "market":"1X2", "selection":"home", "odd":2.15 }]`
- WS (mensaje JSON): `{ "eventId":"ev-001", "market":"1X2", "selection":"home", "odd":2.15 }`

Si una casa usa otro formato, adapta normalizacion en `src/services/collectorsService.js`.
