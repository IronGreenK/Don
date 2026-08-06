import type { Carta, Grado, Opcion } from '../game/types';

const TIPO_POR_REGION: Record<string, string> = {
  monte: 'EN EL MONTE',
  pueblo: 'EN EL PUEBLO',
  camino: 'EN EL CAMINO',
};

export type ContenidoModal = { clase: 'carta'; carta: Carta } | { clase: 'prueba'; grado: Grado };

export function CartaModal({
  contenido,
  edad,
  plata,
  resultado,
  onOpcion,
  onApostar,
  onAd,
  onPrueba,
  onCerrar,
}: {
  contenido: ContenidoModal;
  edad: number;
  plata: number;
  resultado: string | null;
  onOpcion: (o: Opcion) => void;
  onApostar: (monto: number) => void;
  onAd: () => void;
  onPrueba: () => void;
  onCerrar: () => void;
}) {
  const esPrueba = contenido.clase === 'prueba';
  const carta = contenido.clase === 'carta' ? contenido.carta : null;

  const tipo = esPrueba
    ? `LA PRUEBA · ${contenido.grado.n.toUpperCase()}`
    : carta!.tipo === 'apuesta'
      ? 'EN LA CANTINA'
      : (TIPO_POR_REGION[carta!.region] ?? 'EN EL MONTE');

  const texto = esPrueba ? (contenido.grado.prueba ?? '') : carta!.texto;
  const montoApuesta = Math.min(Math.floor(plata), 30);

  return (
    <div id="velo" className="abierto">
      <div id="carta">
        <div className="tipo">{tipo}</div>
        <div className="texto">{texto}</div>
        {esPrueba && !resultado && (
          <div className="prob">{Math.round(contenido.grado.prob * 100)}%</div>
        )}
        {!resultado && (
          <div id="opciones">
            {esPrueba && (
              <>
                <Boton titulo="→ Intentarlo" sub="Si fallas: pierdes Don y Alma" onClick={onPrueba} />
                <Boton titulo="← Todavía no" onClick={onCerrar} />
              </>
            )}
            {carta?.tipo === 'normal' &&
              carta.opciones.map((o, i) => (
                <Boton
                  key={o.label}
                  titulo={`${i === 0 ? '←' : '→'} ${o.label}`}
                  onClick={() => onOpcion(o)}
                />
              ))}
            {carta?.tipo === 'apuesta' &&
              (montoApuesta < 5 ? (
                <Boton
                  titulo="→ Irte"
                  sub="No tienes plata que apostar"
                  onClick={() =>
                    onOpcion({ label: 'Irte', fx: {}, resultado: 'Sin plata no hay juego.' })
                  }
                />
              ) : (
                <>
                  <Boton
                    titulo={`→ Doble o nada (${montoApuesta})`}
                    sub="55% de ganar"
                    onClick={() => onApostar(montoApuesta)}
                  />
                  <Boton
                    titulo="← No jugar"
                    onClick={() =>
                      onOpcion({
                        label: 'No jugar',
                        fx: {},
                        resultado: 'Hay noches para jugar y noches para irse.',
                      })
                    }
                  />
                </>
              ))}
            {carta?.tipo === 'ad' && (
              <>
                <Boton
                  titulo="→ Aceptar el trago"
                  sub="(aquí iría un anuncio con recompensa)"
                  onClick={onAd}
                />
                <Boton
                  titulo="← Seguir tu camino"
                  onClick={() =>
                    onOpcion({ label: 'Seguir', fx: {}, resultado: 'Le agradeces y sigues.' })
                  }
                />
              </>
            )}
          </div>
        )}
        {resultado && (
          <div id="resultado" style={{ display: 'block' }}>
            {resultado}
          </div>
        )}
        {!esPrueba && <div className="edad-nota">{edad} años</div>}
      </div>
    </div>
  );
}

function Boton({ titulo, sub, onClick }: { titulo: string; sub?: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}>
      <span className="flecha">{titulo}</span>
      {sub && <small>{sub}</small>}
    </button>
  );
}
