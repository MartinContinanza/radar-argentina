# 📡 Radar Argentina – Regulaciones & Certificaciones

Landing page que agrega noticias/actualizaciones desde múltiples fuentes RSS/Atom relacionadas con regulaciones, comercio exterior, sostenibilidad, trazabilidad y certificaciones con impacto o relevancia para Argentina.

## 🚀 Levantar en 5 minutos

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000) y ya ves noticias agregadas de hasta 12 fuentes.

## 🧩 Stack

- **Next.js 14** (App Router) + TypeScript + Tailwind CSS
- Sin base de datos, sin login, sin workers, sin nada enterprise.
- Un endpoint `/api/rss?url=<encoded>` que hace el fetch server-side (evita CORS) y cachea en memoria por 30 minutos.

## 📁 Estructura

```
radar-argentina/
├── app/
│   ├── page.tsx          # Landing page completa (cliente)
│   ├── layout.tsx
│   ├── globals.css
│   └── api/rss/route.ts  # Proxy RSS con cache en memoria
├── data/
│   └── sources.json      # ← Agregar/editar fuentes acá
├── lib/
│   ├── types.ts
│   └── tagging.ts        # Reglas de auto-tagging por keywords
└── README.md
```

## ➕ Cómo agregar una nueva fuente

Abrí `data/sources.json` y agregá un objeto al array:

```json
{
  "id": "mi-fuente",
  "name": "Nombre visible",
  "url": "https://ejemplo.com/feed.rss",
  "type": "rss",
  "region": "AR",
  "tags": ["agriculture", "certification"],
  "priority": 2
}
```

Guardá y recargá la página. Listo.

### Campos de sources.json

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | Identificador único (slug) |
| `name` | string | Nombre que se muestra en la card |
| `url` | string | URL del feed RSS o Atom |
| `type` | `"rss"` \| `"atom"` | Tipo de feed |
| `region` | string | Región (ej: `"AR"`, `"UE"`, `"USA"`, `"Global"`) |
| `tags` | string[] | Tags iniciales para todos los ítems de esta fuente |
| `priority` | 1–5 | 1 = máxima prioridad (informativo, no usado en el filtro aún) |

## 🏷 Tags auto-detectados

Los tags se detectan automáticamente por keywords en el título/resumen:
`EUDR`, `CBAM`, `CSRD`, `due diligence`, `deforestation`, `organic`, `recycled`, `biofuels/ISCC`, `textiles`, `agriculture`, `forestry`, `exports/imports`

Para agregar nuevas reglas, editá `lib/tagging.ts`.

## 🌐 Deploy en Vercel

```bash
vercel deploy
```

No requiere variables de entorno ni configuración adicional.
