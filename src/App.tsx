import { useEffect, useState } from 'react';
import './App.css';
import {
  cargarBeneficios,
  guardarBeneficios,
  hoy,
  ofrendaDisponible,
} from './game/beneficios';
import { GRADOS } from './game/grados';
import type { Opcion } from './game/types';
import { elegirCarta, useJuego } from './game/useJuego';
import { comprar, verComercial, type Producto } from './lib/monetizacion';
import { CartaModal, type ContenidoModal } from './components/CartaModal';
import { Linaje } from './components/Linaje';
import { Muerte } from './components/Muerte';
import { Stats } from './components/Stats';
import { Tienda } from './components/Tienda';
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
  const [beneficios, setBeneficios] = useState(cargarBeneficios);
  const [tiendaAbierta, setTiendaAbierta] = useState(false);
  const [linajeAbierto, setLinajeAbierto] = useState(false);

  useEffect(() => {
    guardarBeneficios(beneficios);
  }, [beneficios]);

  // Los primeros toques cuentan una historia: la vela despierta de a poco.
  useEffect(() => {
    if (estado.monteAbierto && estado.toques === 18) {
      setPie('Algo se mueve entre los árboles, allá afuera.');
      return;
    }
    if (estado.monteAbierto || estado.gen > 1) return;
    if (estado.toques === 1) setPie('La abuela decía que no se le habla a la llama. Tú igual la tocas.');
    else if (estado.toques === 6) setPie('La llama se estira hacia tu mano, como reconociéndote.');
    else if (estado.toques === 12) setPie('Así despierta el Don, dicen: de a poco, y sin pedir permiso.');
  }, [estado.monteAbierto, estado.toques, estado.gen]);

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
    const carta = elegirCarta(estado, beneficios.sinAds);
    despachar({ tipo: 'abrirCarta', carta });
    setModal({ clase: 'carta', carta });
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

  async function verAd() {
    const completo = await verComercial();
    if (!completo) {
      setResultado('El trago se derramó antes de llegar a tu boca. Otra vez será.');
      return;
    }
    const ganancia = Math.max(5, Math.floor(estado.ultimaGanancia * 2));
    despachar({ tipo: 'cobrarAd', ganancia });
    setResultado(`El trago quema bonito. +${ganancia} de Don.`);
  }

  async function comercialDeTienda(): Promise<string> {
    const completo = await verComercial();
    if (!completo) return 'El comercial no llegó a destaparse. Otra vez será.';
    const ganancia = Math.max(10, Math.floor(estado.ultimaGanancia * 2));
    despachar({ tipo: 'cobrarAd', ganancia });
    return `El trago quema bonito. +${ganancia} de Don.`;
  }

  async function comprarProducto(producto: Producto): Promise<string> {
    const r = await comprar(producto);
    if (r.ok) {
      setBeneficios((b) =>
        producto === 'sin_ads' ? { ...b, sinAds: true } : { ...b, suscripcion: true },
      );
    }
    return r.mensaje;
  }

  function cobrarOfrenda() {
    if (!ofrendaDisponible(beneficios)) return;
    const ganancia = 25 + estado.grado * 25;
    despachar({ tipo: 'cobrarAd', ganancia });
    setBeneficios((b) => ({ ...b, ultimaOfrenda: hoy() }));
    setPie(`La ofrenda amanece en tu puerta: +${ganancia} de Don.`);
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
        {ofrendaDisponible(beneficios) && (
          <button type="button" className="acc dorado" onClick={cobrarOfrenda}>
            La ofrenda del día
            <small>tu sociedad con el Mercachifle rinde</small>
          </button>
        )}
        {estado.monteAbierto && (
          <button type="button" className="acc" onClick={() => setTiendaAbierta(true)}>
            El Mercachifle
            <small>tratos y mercedes</small>
          </button>
        )}
        {estado.monteAbierto && (
          <button type="button" className="acc" onClick={() => setLinajeAbierto(true)}>
            El libro del linaje
            <small>guarda o recupera tu partida</small>
          </button>
        )}
      </div>

      {linajeAbierto && !estado.muerto && (
        <Linaje
          onRestaurar={(e) => despachar({ tipo: 'restaurar', estado: e })}
          onCerrar={() => setLinajeAbierto(false)}
        />
      )}

      {tiendaAbierta && !estado.muerto && (
        <Tienda
          beneficios={beneficios}
          onVerComercial={comercialDeTienda}
          onComprar={comprarProducto}
          onCerrar={() => setTiendaAbierta(false)}
        />
      )}

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
