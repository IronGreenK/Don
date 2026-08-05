import { useEffect, useState } from 'react';
import './App.css';
import { GRADOS } from './game/grados';
import type { Opcion } from './game/types';
import { elegirCarta, useJuego } from './game/useJuego';
import { CartaModal, type ContenidoModal } from './components/CartaModal';
import { Muerte } from './components/Muerte';
import { Stats } from './components/Stats';
import { Vela } from './components/Vela';

const PIE_INICIAL = 'La vela arde. Algo en la llama te devuelve la mirada.';

function ordinal(n: number): string {
  return (
    ['Primera', 'Segunda', 'Tercera', 'Cuarta', 'Quinta', 'Sexta', 'Séptima', 'Octava', 'Novena', 'Décima'][n - 1] ??
    `${n}ª`
  );
}

function App() {
  const { estado, despachar } = useJuego();
  const [modal, setModal] = useState<ContenidoModal | null>(null);
  const [resultado, setResultado] = useState<string | null>(null);
  const [pie, setPie] = useState(PIE_INICIAL);

  useEffect(() => {
    if (estado.monteAbierto && estado.toques === 18) {
      setPie('Algo se mueve entre los árboles, allá afuera.');
    }
  }, [estado.monteAbierto, estado.toques]);

  // El resultado queda a la vista un momento y la carta se cierra sola.
  useEffect(() => {
    if (!resultado) return;
    const id = setTimeout(() => {
      setModal(null);
      setResultado(null);
      despachar({ tipo: 'cerrarCarta' });
    }, 1600);
    return () => clearTimeout(id);
  }, [resultado, despachar]);

  function salirAlMonte() {
    despachar({ tipo: 'envejecer' });
    setModal({ clase: 'carta', carta: elegirCarta(estado) });
  }

  function elegirOpcion(o: Opcion) {
    despachar({ tipo: 'resolverOpcion', opcion: o });
    setResultado(o.resultado ?? 'Sigues tu camino.');
  }

  function apostar(monto: number) {
    const gana = Math.random() < 0.55;
    despachar({ tipo: 'resolverApuesta', gana, monto });
    setResultado(
      gana
        ? `Ganas. +${monto} de plata. El del anillo deja de reír.`
        : 'Pierdes. Su risa te sigue hasta la puerta.',
    );
  }

  function verAd() {
    const ganancia = Math.max(5, Math.floor(estado.ultimaGanancia * 2));
    despachar({ tipo: 'cobrarAd', ganancia });
    setResultado(`El trago quema bonito. +${ganancia} de Don. [demo: esto sería un ad]`);
  }

  function intentarPrueba() {
    const g = GRADOS[estado.grado + 1];
    if (!g) return;
    const exito = Math.random() < g.prob;
    despachar({ tipo: 'resolverPrueba', exito });
    setResultado(
      exito
        ? `Amanece y sigues entero. Eres ${g.n}. Algo nuevo te acompaña desde hoy.`
        : 'Fallas. Vuelves al pueblo antes del alba, con menos de lo que llevabas.',
    );
  }

  function renacer() {
    despachar({ tipo: 'renacer' });
    setModal(null);
    setResultado(null);
    setPie('Otra vela. Otras manos. La misma llama.');
  }

  const siguiente = GRADOS[estado.grado + 1];

  return (
    <div id="app">
      <header>
        <div id="gen">{ordinal(estado.gen)} generación</div>
        <div id="nombre">El que mira la vela</div>
        <div id="grado">
          {GRADOS[estado.grado].n} · {estado.edad} años
        </div>
      </header>

      <Stats s={estado} />

      <Vela
        ganancia={1 + estado.bonus}
        pie={pie}
        pactosInfo={
          estado.pactos > 0
            ? `+${estado.pactos} Don/s · ${estado.pactos} ${estado.pactos > 1 ? 'pactos' : 'pacto'}`
            : ''
        }
        onTocar={() => !estado.muerto && despachar({ tipo: 'tocarVela' })}
      />

      <div id="acciones">
        {estado.monteAbierto && (
          <button type="button" className="acc" onClick={salirAlMonte}>
            Salir al monte
            <small>una carta, una decisión, un año</small>
          </button>
        )}
        {siguiente && estado.don >= siguiente.req && (
          <button
            type="button"
            className="acc dorado"
            onClick={() => setModal({ clase: 'prueba', grado: siguiente })}
          >
            La prueba de {siguiente.n}
            <small>estás listo para intentarlo</small>
          </button>
        )}
      </div>

      {modal && !estado.muerto && (
        <CartaModal
          contenido={modal}
          edad={estado.edad}
          plata={estado.plata}
          resultado={resultado}
          onOpcion={elegirOpcion}
          onApostar={apostar}
          onAd={verAd}
          onPrueba={intentarPrueba}
          onCerrar={() => setModal(null)}
        />
      )}

      {estado.muerto && <Muerte s={estado} onRenacer={renacer} />}
    </div>
  );
}

export default App;
