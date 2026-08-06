# El Don

Idle-narrativo de brujería folclórica latinoamericana: encarnas a un brujo de pueblo que asciende por los grados de la brujería; cuando mueres, tu aprendiz hereda parte de tu poder y el linaje continúa.

Diseño completo en [`docs/EL-DON-diseno.md`](docs/EL-DON-diseno.md) · prototipo de referencia en [`docs/el-don.html`](docs/el-don.html).

## Stack (§9 del diseño)

- **Cliente:** React 19 + TypeScript + Vite + Tailwind → Capacitor 8 → AAB para Play Store
- **Backend:** Supabase (Postgres + Auth + Edge Functions)
- **Ads/IAP (v2):** AdMob y Play Billing vía plugins de Capacitor

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # credenciales de Supabase (Project Settings → API)
npm run dev
```

El juego corre **offline-first**: la partida se guarda en `localStorage` y el Don pasivo por pactos se acumula aunque la app esté cerrada. Con Supabase configurado, además: cuenta anónima automática, respaldo de la partida en la tabla `runs` (cada 15 s y al morir), restauración en dispositivos nuevos, y el mazo de cartas se carga desde la tabla `cards` (contenido actualizable sin release). Sin credenciales o sin red, todo sigue funcionando en local.

> Requisito en Supabase: habilitar **Authentication → Sign In / Providers → Anonymous sign-ins** para que el respaldo funcione.

## Scripts

| Script | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Compila TypeScript y genera `dist/` |
| `npm run lint` | Linter (oxlint) |
| `npm run cap:sync` | Compila y sincroniza con las plataformas nativas |
| `npm run cap:android` | Sincroniza y abre Android Studio |
| `npm run cap:ios` | Sincroniza y abre Xcode |

Para añadir las plataformas nativas por primera vez: `npx cap add android` / `npx cap add ios`.

## Estructura

```
docs/                      # Diseño aprobado + prototipo HTML de referencia
src/
  game/
    types.ts               # Tipos del juego (cartas, estado, grados)
    grados.ts              # Grados, pruebas y constantes de balance (§4-5)
    useJuego.ts            # Motor: reducer, persistencia, Don pasivo offline
  data/cartas.json         # 41 cartas data-driven (§6) — fuente del seed SQL
  components/              # Vela, Stats, CartaModal, Muerte
  lib/supabase.ts          # Cliente Supabase (VITE_SUPABASE_URL / _ANON_KEY)
  hooks/useSession.ts      # Sesión de autenticación reactiva
supabase/
  migrations/              # Esquema: profiles, runs, cards, inventory (con RLS)
  seed_cartas.sql          # Seed de la tabla cards (generado desde cartas.json)
capacitor.config.ts        # appId com.irongreenk.eldon
```

## Estado del roadmap (§13)

**Semana 1-2**
- [x] Proyecto React + Capacitor + Supabase
- [x] Prototipo portado a React (vela, stats, cartas, apuesta, carta-ad demo, pruebas de grado, muerte y herencia)
- [x] Persistencia local + Don pasivo offline
- [x] ~40 cartas (41 en `src/data/cartas.json`)
- [x] Esquema Supabase con RLS (`supabase/migrations/`) + seed de cartas
- [x] Migración y seed aplicados al proyecto remoto `el-don` (sa-east-1)
- [x] Sincronización runs ↔ Supabase con cuentas anónimas + cartas desde la DB
- [ ] Habilitar Anonymous sign-ins en el panel de Supabase (un clic)

**Semana 3:** AdMob real + build AAB + closed testing (12 testers × 14 días — reclutar YA, §11)
