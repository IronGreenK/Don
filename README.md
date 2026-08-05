# El Don

App móvil/web construida con **React + Vite + TypeScript**, empaquetada con **Capacitor** y con backend en **Supabase**.

> ⚠️ **Archivos de diseño pendientes:** el documento de diseño aprobado (`EL-DON-diseno.md`) y el prototipo (`el-don.html`) no están en este repositorio (estaba vacío al iniciar el proyecto). Hay que añadirlos para portar la UI del prototipo y seguir la sección 9 del diseño al pie de la letra. La estructura actual es un andamiaje estándar del stack acordado.

## Stack

- **Frontend:** React 19 + Vite + TypeScript
- **Móvil:** Capacitor 8 (Android / iOS)
- **Backend:** Supabase (`@supabase/supabase-js`)

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # y completar las credenciales de Supabase
npm run dev
```

Las credenciales se obtienen en el panel de Supabase: *Project Settings → API*.

## Scripts

| Script | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Compila TypeScript y genera `dist/` |
| `npm run lint` | Linter (oxlint) |
| `npm run cap:sync` | Compila y sincroniza con las plataformas nativas |
| `npm run cap:android` | Sincroniza y abre Android Studio |
| `npm run cap:ios` | Sincroniza y abre Xcode |

Para añadir las plataformas nativas por primera vez:

```bash
npx cap add android
npx cap add ios
```

## Estructura

```
src/
  lib/supabase.ts     # Cliente Supabase (usa VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)
  hooks/useSession.ts # Sesión de autenticación reactiva
  App.tsx             # Shell provisional (pendiente portar el prototipo)
capacitor.config.ts   # Configuración de Capacitor (appId: com.irongreenk.eldon)
```

## Pendiente (semana 1-2 del roadmap)

- [x] Proyecto React + Vite + TypeScript
- [x] Capacitor configurado
- [x] Cliente Supabase con variables de entorno
- [x] Hook de sesión de autenticación
- [ ] Añadir `EL-DON-diseno.md` y `el-don.html` al repositorio
- [ ] Portar la UI del prototipo `el-don.html`
- [ ] Esquema de base de datos y RLS según el diseño
- [ ] Reactivar el proyecto Supabase (está en estado INACTIVE)
