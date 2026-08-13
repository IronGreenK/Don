import { useEffect, useState } from 'react';
import type { EstadoJugador } from '../game/types';
import {
  correoVinculado,
  enviarCodigo,
  recuperarLinaje,
  vincularCorreo,
} from '../lib/sync';

type Modo = 'menu' | 'vincular' | 'recuperar' | 'codigo';

export function Linaje({
  onRestaurar,
  onCerrar,
}: {
  onRestaurar: (estado: EstadoJugador) => void;
  onCerrar: () => void;
}) {
  const [modo, setModo] = useState<Modo>('menu');
  const [correo, setCorreo] = useState('');
  const [codigo, setCodigo] = useState('');
  const [vinculado, setVinculado] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    correoVinculado().then(setVinculado);
  }, []);

  async function ejecutar(fn: () => Promise<void>) {
    if (ocupado) return;
    setOcupado(true);
    setMensaje(null);
    await fn();
    setOcupado(false);
  }

  return (
    <div id="velo" className="abierto">
      <div id="carta">
        <div className="tipo">EL LIBRO DEL LINAJE</div>

        {modo === 'menu' && (
          <>
            <div className="texto">
              {vinculado
                ? `Tu linaje está escrito a nombre de ${vinculado}. Aunque el cuerpo cambie de manos, el Don sabrá volver.`
                : 'Lo que no se escribe, se pierde. Deja tu nombre en el libro y tu linaje sobrevivirá a cualquier celular.'}
            </div>
            <div className="ofertas">
              {!vinculado && (
                <button type="button" className="oferta dorada" onClick={() => setModo('vincular')}>
                  <span className="o-nombre">Escribir tu nombre</span>
                  <span className="o-detalle">Vincula tu correo para guardar el linaje</span>
                </button>
              )}
              <button type="button" className="oferta" onClick={() => setModo('recuperar')}>
                <span className="o-nombre">Reclamar un linaje</span>
                <span className="o-detalle">
                  ¿Celular nuevo? Recupera tu partida con tu correo. Reemplaza la partida de este
                  dispositivo.
                </span>
              </button>
            </div>
          </>
        )}

        {modo === 'vincular' && (
          <>
            <div className="texto">El libro pide un nombre que el correo reconozca.</div>
            <input
              className="campo"
              type="email"
              placeholder="tu@correo.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              disabled={ocupado}
            />
            <div className="ofertas">
              <button
                type="button"
                className="oferta dorada"
                disabled={ocupado || !correo.includes('@')}
                onClick={() =>
                  ejecutar(async () => {
                    setMensaje(await vincularCorreo(correo.trim()));
                  })
                }
              >
                <span className="o-nombre">Sellar el vínculo</span>
              </button>
            </div>
          </>
        )}

        {modo === 'recuperar' && (
          <>
            <div className="texto">Dime el correo del linaje y te mandaré la seña.</div>
            <input
              className="campo"
              type="email"
              placeholder="tu@correo.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              disabled={ocupado}
            />
            <div className="ofertas">
              <button
                type="button"
                className="oferta dorada"
                disabled={ocupado || !correo.includes('@')}
                onClick={() =>
                  ejecutar(async () => {
                    const error = await enviarCodigo(correo.trim());
                    if (error) {
                      setMensaje(error);
                    } else {
                      setModo('codigo');
                      setMensaje('Seña enviada. Revisa tu correo y copia el código.');
                    }
                  })
                }
              >
                <span className="o-nombre">Enviar la seña</span>
              </button>
            </div>
          </>
        )}

        {modo === 'codigo' && (
          <>
            <div className="texto">Escribe la seña que llegó a {correo}.</div>
            <input
              className="campo"
              inputMode="numeric"
              placeholder="123456"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              disabled={ocupado}
            />
            <div className="ofertas">
              <button
                type="button"
                className="oferta dorada"
                disabled={ocupado || codigo.trim().length < 6}
                onClick={() =>
                  ejecutar(async () => {
                    const r = await recuperarLinaje(correo.trim(), codigo.trim());
                    if ('error' in r) {
                      setMensaje(r.error);
                      return;
                    }
                    if (r.estado) {
                      onRestaurar(r.estado);
                      setMensaje('El linaje vuelve a tus manos. La vela recuerda.');
                      setVinculado(correo.trim());
                      setModo('menu');
                    } else {
                      setMensaje('Ese linaje no tiene partidas guardadas todavía.');
                    }
                  })
                }
              >
                <span className="o-nombre">Reclamar</span>
              </button>
            </div>
          </>
        )}

        {mensaje && <div id="resultado" style={{ display: 'block' }}>{mensaje}</div>}

        <button
          type="button"
          className="acc cerrar-tienda"
          onClick={() => (modo === 'menu' ? onCerrar() : setModo('menu'))}
          disabled={ocupado}
        >
          {modo === 'menu' ? 'Cerrar el libro' : 'Volver'}
        </button>
      </div>
    </div>
  );
}
