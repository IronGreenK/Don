import type { EstadoJugador } from '../game/types';
import { GRADOS } from '../game/grados';

export function Stats({ s }: { s: EstadoJugador }) {
  const sig = GRADOS[s.grado + 1];
  const pctDon = sig ? Math.min(100, (s.don / sig.req) * 100) : 100;
  return (
    <div id="stats">
      <Stat etiqueta="DON" valor={Math.floor(s.don)} pct={pctDon} id="b-don" />
      <Stat etiqueta="TEMOR" valor={s.temor} pct={s.temor} id="b-temor" />
      <Stat etiqueta="ALMA" valor={s.alma} pct={s.alma} id="b-alma" />
      <Stat etiqueta="PLATA" valor={Math.floor(s.plata)} pct={Math.min(100, s.plata)} id="b-plata" />
    </div>
  );
}

function Stat({ etiqueta, valor, pct, id }: { etiqueta: string; valor: number; pct: number; id: string }) {
  return (
    <div className="stat">
      <div className="lbl">
        <span>{etiqueta}</span>
        <b>{valor}</b>
      </div>
      <div className="barra" id={id}>
        <i style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
