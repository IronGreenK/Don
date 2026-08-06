import type { Grado } from './types';

// §4 del diseño: umbral de Don + prueba con % visible.
export const GRADOS: Grado[] = [
  { n: 'Curioso', req: 0, prob: 1 },
  {
    n: 'Aprendiz',
    req: 60,
    prob: 0.64,
    prueba: 'Debes pasar la noche entera en el cementerio sin nombrar a Dios.',
  },
  {
    n: 'Iniciado',
    req: 250,
    prob: 0.55,
    prueba: 'Debes lavarte doce noches en la cascada hasta que el agua borre el bautismo.',
  },
  {
    n: 'Compadre',
    req: 800,
    prob: 0.45,
    prueba: 'Debes entrar a la cueva y salir con lo que te entreguen, sin mirar atrás.',
  },
];

// Fallar una prueba: pierdes 40% del Don y 15 de Alma (§4).
export const CASTIGO_FALLO = { donRestante: 0.6, alma: 15 };

// Muerte por vejez: ~58 + 8·grado (§5).
export const EDAD_BASE = 58;
export const EDAD_POR_GRADO = 8;

// Herencia: 25% del Don + 20·grado (§5).
export const HERENCIA_DON = 0.25;
export const HERENCIA_POR_GRADO = 20;
