// Beneficios de cuenta (§8): viven aparte de la partida porque sobreviven
// a la muerte y a la herencia. La validación server-side de compras llega
// con Play Billing real (v2); mientras, se persisten en el dispositivo.

export interface Beneficios {
  sinAds: boolean;
  suscripcion: boolean;
  ultimaOfrenda: string | null; // fecha (YYYY-MM-DD) del último evento diario cobrado
}

const CLAVE = 'el-don:beneficios:v1';

export function cargarBeneficios(): Beneficios {
  try {
    const crudo = localStorage.getItem(CLAVE);
    if (crudo) return { sinAds: false, suscripcion: false, ultimaOfrenda: null, ...JSON.parse(crudo) };
  } catch {
    // guardado corrupto: se parte de cero
  }
  return { sinAds: false, suscripcion: false, ultimaOfrenda: null };
}

export function guardarBeneficios(b: Beneficios): void {
  localStorage.setItem(CLAVE, JSON.stringify(b));
}

export function hoy(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ofrendaDisponible(b: Beneficios): boolean {
  return b.suscripcion && b.ultimaOfrenda !== hoy();
}
