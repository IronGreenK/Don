# EL DON — Documento de diseño (v0.1)

Juego móvil idle/narrativo de brujería folclórica latinoamericana. Para Play Store. Este documento es el punto de partida para el desarrollo con Claude Code.

---

## 1. Concepto en una frase

Un idle-narrativo donde encarnas a un brujo de pueblo que asciende por los grados de la brujería latinoamericana; cuando mueres, tu aprendiz hereda parte de tu poder y el linaje continúa.

**Fórmula:** esqueleto de progresión xianxia + piel de folclore latinoamericano + clicker/idle + cartas de decisión estilo Reigns + muerte como prestigio (roguelite).

## 2. Pilares de diseño

1. **El cerebro del jugador hace los gráficos.** Todo es texto, tipografía y una vela. Referencia: A Dark Room.
2. **Revelación progresiva.** El juego empieza siendo solo una vela. Cada grado desbloquea una mecánica nueva, no números más grandes.
3. **Toda ganancia tiene precio.** Don quema Alma; Temor abre puertas y atrae la hoguera.
4. **La muerte es la mecánica principal.** Prestigio narrado: el aprendiz hereda. Morir tiene que dar ganas de volver a empezar.
5. **Sesión de 90 segundos.** Se juega en la fila del banco.

## 3. Stats

| Stat | Rango | Qué es | Riesgo |
|---|---|---|---|
| Don | 0–∞ | Poder. Se gana tocando la vela, con pactos (pasivo) y eventos | Moneda de progresión |
| Temor | 0–100 | Lo que el pueblo siente por ti | A 100: el pueblo te quema (muerte) |
| Alma | 0–100 | Lo que te queda de humano | A 0: te pierdes (muerte) |
| Plata | 0–∞ | Dinero | Compra ingredientes, favores, apuestas |

## 4. Grados (progresión vertical, estilo reinos xianxia)

Cada grado: umbral de Don + prueba con % de éxito visible + desbloquea una mecánica nueva.

| # | Grado | Don req. | Prueba | Desbloquea |
|---|---|---|---|---|
| 0 | Curioso | — | — | Vela + cartas |
| 1 | Aprendiz | 60 | Noche en el cementerio sin nombrar a Dios (64%) | Pactos (Don pasivo) |
| 2 | Iniciado | 250 | Doce noches en la cascada (55%) | Gacha (baúl del brujo muerto) |
| 3 | Compadre | 800 | La cueva (45%) | Mapa / viajar |
| 4 | Brujo | 2 500 | (por diseñar) | Secta / Recta Provincia |
| 5+ | Escalones regionales | — | — | Ver §7 |

Fallar una prueba: pierdes 40% del Don y 15 de Alma. La tensión del "¿intento o me preparo más?" es un momento clave.

## 5. El loop

1. **Tocar la vela** → +Don (clicker). Bonus permanente por grados alcanzados en vidas anteriores.
2. **Salir al monte** → carta de texto con 2 opciones (swipe izq/der). Cada carta = 1 año de edad.
3. **Pactos** → Don por segundo, también offline (idle).
4. **Prueba de grado** → apuesta de progresión con % visible.
5. **Muerte** (Alma 0 / Temor 100 / vejez ~58+8·grado) → pantalla de herencia → nueva generación con 25% del Don + 20·grado + bonus de toque.

## 6. Cartas (contenido data-driven)

Todo el contenido vive en JSON/DB, NUNCA hardcodeado. Estructura:

```json
{
  "id": "llorona_vado",
  "region": "pueblo",
  "requisitos": {"grado_min": 0},
  "texto": "Una mujer llora en el vado del río...",
  "opciones": [
    {"label": "Seguir de largo", "fx": {}, "resultado": "..."},
    {"label": "Escuchar qué pide", "fx": {"alma": -10, "pacto": 1}, "resultado": "..."}
  ]
}
```

Tipos de carta: normal, apuesta (doble o nada con % visible), ad-recompensa, encadenada (una decisión hace reaparecer la carta mutada más adelante), de grado (pruebas).

Tono de escritura: elipsis y ambigüedad, nunca gore explícito (clasificación de edad). Registro oral latinoamericano: "pa' que rinda", "mal echado", "entierro". Criaturas del canon compartido primero: Llorona, perro negro (Cadejo), lechuza, entierros, el cura como antagonista humano.

## 7. Estructura de mundo (expansión live-ops)

Los "mundos" NO se reparten por geografía del jugador (rechazado: fragmenta comunidad). Se reparten por progresión — el brujo viaja:

1. El pueblo y el monte (canon pan-latino: Llorona, Cadejo, Sombrerón, Ciguapa)
2. Chiloé — la Recta Provincia (macuñ, invunche, voladora, Caleuche, cueva de Quicaví)
3. Los Andes (apus, huacas)
4. Amazonía
5. Caribe
6. Mesoamérica
7. (Global después: África, Asia, Europa — cada región = parche de contenido + gacha nueva + evento de temporada)

Localización cosmética permitida: nombres regionales de criaturas, eventos de temporada (Día de Muertos, San Juan, Inti Raymi), modismos. Universos separados por país: NO.

## 8. Monetización

| Vía | Implementación | Nota legal |
|---|---|---|
| Ads recompensados (AdMob) | Carta "un compadre te ofrece un trago" → x2 última ganancia. Voluntario siempre | — |
| Gacha | "Baúl del brujo muerto": hierbas/objetos/pactos. Se paga con moneda del juego | Probabilidades visibles ANTES de abrir (política Play). Evitar gacha de pago directo (Bélgica lo prohíbe; PEGI 16 desde jun 2026 para ítems aleatorios pagados) |
| Suscripción | Don offline x2 + evento diario extra | Play Billing |
| Pago único | Quitar ads para siempre | La que más convierte en juegos de texto |

## 9. Stack técnico (decidido)

- **Cliente:** React + TypeScript + Vite + Tailwind → **Capacitor** → AAB para Play Store
- **Backend:** **Supabase** (Postgres + Auth + Edge Functions)
  - Lógica sensible en servidor: gacha, economía, validación de compras (anti-cheat)
  - Contenido (cartas, balance) en tablas → actualizable sin release
- **Ads:** plugin Capacitor AdMob · **IAP:** plugin Play Billing
- El MVP puede correr offline-first con sync; cuentas anónimas de Supabase al inicio

## 10. MVP (alcance cerrado — NO agregar más)

- Vela clicker + 4 stats
- ~40 cartas del escalón 1 (12 ya escritas en el prototipo)
- 4 grados con pruebas
- Pactos (idle pasivo, incluido offline)
- Muerte + herencia generacional
- Carta-ad simulada (integrar AdMob real después del closed testing)
- SIN: gacha real, suscripción, mapa, sectas, tower defense (todo eso es v2+)

## 11. Requisitos Play Store a tener presentes

- Cuenta personal: closed testing con 12 testers × 14 días continuos antes de publicar → **empezar a reclutar testers YA**
- Cuota única $25 USD
- Gachas: odds visibles pre-compra
- Data safety form + política de privacidad (Supabase + AdMob recolectan datos)

## 12. Estética (del prototipo, mantener)

- Paleta: humo #0D0A08, papel #1C1512, llama #E8A33D/#F5C56B, sangre #8C2F2F, ánima #6E8FA3, hueso #D9CBB3
- Tipos: IM Fell English (display, sabor imprenta colonial) + Crimson Text (cuerpo)
- Firma visual: la vela animada en CSS es el botón principal del juego
- Prototipo de referencia: `el-don.html` (mismo directorio)

## 13. Roadmap sugerido

1. **Semana 1-2:** proyecto React+Capacitor, portar prototipo, Supabase schema (users, runs, cards, inventory), 40 cartas
2. **Semana 3:** AdMob + build AAB + closed testing con 12 testers
3. **Semana 4-5:** iterar con feedback de testers, balance
4. **Lanzamiento:** producción + ficha de Play (screenshots, descripción ASO en español)
5. **v2:** gacha (odds visibles), suscripción, escalón 2 (Chiloé), sectas
6. **v3:** tower defense de la secta, escalones 3+
