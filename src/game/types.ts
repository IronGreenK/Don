export interface Efectos {
  don?: number;
  temor?: number;
  alma?: number;
  plata?: number;
  pacto?: number;
}

export interface Opcion {
  label: string;
  fx: Efectos;
  resultado?: string;
}

export type TipoCarta = 'normal' | 'apuesta' | 'ad';

export interface MediaCarta {
  tipo: 'imagen' | 'video';
  url: string;
}

export interface Carta {
  id: string;
  region: string;
  tipo: TipoCarta;
  requisitos: { grado_min?: number };
  texto: string;
  opciones: Opcion[];
  media?: MediaCarta | null;
}

export interface Grado {
  n: string;
  req: number;
  prob: number;
  prueba?: string;
}

export interface EstadoJugador {
  don: number;
  temor: number;
  alma: number;
  plata: number;
  edad: number;
  grado: number;
  gen: number;
  bonus: number;
  pactos: number;
  muerto: boolean;
  toques: number;
  monteAbierto: boolean;
  herencia: number;
  causaMuerte: { titulo: string; texto: string } | null;
  ultimaGanancia: number;
  guardadoEn: number;
}
