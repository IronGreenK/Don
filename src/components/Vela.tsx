import { useRef, useState } from 'react';

interface Flotante {
  id: number;
  x: number;
  y: number;
  texto: string;
}

export function Vela({
  ganancia,
  pie,
  pactosInfo,
  onTocar,
}: {
  ganancia: number;
  pie: string;
  pactosInfo: string;
  onTocar: () => void;
}) {
  const [flotantes, setFlotantes] = useState<Flotante[]>([]);
  const siguienteId = useRef(0);

  function tocar(e: React.PointerEvent) {
    onTocar();
    const id = siguienteId.current++;
    setFlotantes((f) => [...f, { id, x: e.clientX - 10, y: e.clientY - 30, texto: `+${ganancia}` }]);
    setTimeout(() => setFlotantes((f) => f.filter((m) => m.id !== id)), 1000);
  }

  return (
    <div id="escena">
      <div id="pactos-info">{pactosInfo}</div>
      {flotantes.map((m) => (
        <div key={m.id} className="mas-uno" style={{ left: m.x, top: m.y, position: 'fixed' }}>
          {m.texto}
        </div>
      ))}
      <div id="vela" onPointerDown={tocar}>
        <div className="halo" />
        <div className="flama" />
        <div className="cuerpo-vela" />
      </div>
      <div id="pie-vela">{pie}</div>
    </div>
  );
}
