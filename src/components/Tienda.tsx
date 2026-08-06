import { useState } from 'react';
import type { Beneficios } from '../game/beneficios';
import { esNativo, type Producto } from '../lib/monetizacion';

export function Tienda({
  beneficios,
  onVerComercial,
  onComprar,
  onCerrar,
}: {
  beneficios: Beneficios;
  onVerComercial: () => Promise<string>;
  onComprar: (p: Producto) => Promise<string>;
  onCerrar: () => void;
}) {
  const [ocupado, setOcupado] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  async function ejecutar(fn: () => Promise<string>) {
    if (ocupado) return;
    setOcupado(true);
    setMensaje(null);
    setMensaje(await fn());
    setOcupado(false);
  }

  return (
    <div id="velo" className="abierto">
      <div id="carta" className="tienda">
        <div className="tipo">EL MERCACHIFLE</div>
        <div className="texto">
          Tiende su manta al borde del camino. 'Todo se paga', dice, 'pero no todo se paga igual.'
        </div>

        <div className="ofertas">
          <button
            type="button"
            className="oferta"
            disabled={ocupado}
            onClick={() => ejecutar(onVerComercial)}
          >
            <span className="o-nombre">Un trago del compadre</span>
            <span className="o-detalle">Ver un comercial · dobla tu última ganancia de Don</span>
          </button>

          <button
            type="button"
            className="oferta"
            disabled={ocupado || beneficios.sinAds}
            onClick={() => ejecutar(() => onComprar('sin_ads'))}
          >
            <span className="o-nombre">
              {beneficios.sinAds ? 'Sin anuncios ✓' : 'Que no vuelva el del trago'}
            </span>
            <span className="o-detalle">Pago único · quitar los anuncios para siempre</span>
          </button>

          <button
            type="button"
            className="oferta dorada"
            disabled={ocupado || beneficios.suscripcion}
            onClick={() => ejecutar(() => onComprar('suscripcion'))}
          >
            <span className="o-nombre">
              {beneficios.suscripcion ? 'Sociedad sellada ✓' : 'Sociedad con el Mercachifle'}
            </span>
            <span className="o-detalle">
              Suscripción mensual · tus pactos rinden doble mientras no juegas + la ofrenda del día
            </span>
          </button>
        </div>

        {mensaje && <div id="resultado" style={{ display: 'block' }}>{mensaje}</div>}
        {!esNativo && (
          <div className="edad-nota">
            Versión web: compras en modo demo. Los precios reales se fijan en Play Store.
          </div>
        )}

        <button type="button" className="acc cerrar-tienda" onClick={onCerrar} disabled={ocupado}>
          Seguir tu camino
        </button>
      </div>
    </div>
  );
}
