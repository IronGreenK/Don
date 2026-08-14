export interface Efectos {
  don?: number;
  temor?: number;
  alma?: number;
  plata?: number;
  pacto?: number;
  /** Deja una marca: una decisión que el monte recordará (§6, cartas encadenadas). */
  marca?: string;
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
  /** marca: la carta solo aparece si el jugador lleva esa marca (y la consume). */
  requisitos: { grado_min?: number; marca?: string };
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
  marcas: string[];
  vistas: string[];
  herencia: number;
  causaMuerte: { titulo: string; texto: string } | null;
  ultimaGanancia: number;
  guardadoEn: number;
}
