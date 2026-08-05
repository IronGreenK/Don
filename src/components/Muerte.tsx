import type { EstadoJugador } from '../game/types';

export function Muerte({ s, onRenacer }: { s: EstadoJugador; onRenacer: () => void }) {
  return (
    <div id="muerte" className="abierto">
      <h2>{s.causaMuerte?.titulo}</h2>
      <p>
        {s.causaMuerte?.texto} Pero dejaste enseñado a alguien. El Don no muere: cambia de manos.
      </p>
      <div id="herencia">
        <div className="h-lbl">Tu aprendiz hereda</div>
        <div className="h-val">{s.herencia} de Don</div>
      </div>
      <button type="button" className="acc dorado" style={{ opacity: 1, width: '100%' }} onClick={onRenacer}>
        Encender la vela de nuevo
      </button>
    </div>
  );
}
