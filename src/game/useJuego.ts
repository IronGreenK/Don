import { useEffect, useReducer, useRef } from 'react';
import type { Carta, EstadoJugador, Opcion } from './types';
import {
  CASTIGO_FALLO,
  EDAD_BASE,
  EDAD_POR_GRADO,
  HERENCIA_DON,
  HERENCIA_POR_GRADO,
} from './grados';
import CARTAS from '../data/cartas.json';
import { cargarCartasRemotas, cargarRunRemota, guardarRun } from '../lib/sync';
import { cargarBeneficios } from './beneficios';

const CLAVE_GUARDADO = 'el-don:partida:v1';
const TOQUES_PARA_MONTE = 18;
const PROB_CARTA_AD = 0.16;
const INTERVALO_SYNC_MS = 15000;

// Mazo local como base; si Supabase responde, el contenido remoto lo reemplaza
// (contenido actualizable sin release, §9).
let mazo: Carta[] = CARTAS as Carta[];

function nuevoEstado(don0: number, gen: number, bonus: number): EstadoJugador {
  return {
    don: don0,
    temor: 0,
    alma: 100,
    plata: 10,
    edad: 16,
    grado: 0,
    gen,
    bonus,
    pactos: 0,
    muerto: false,
    toques: 0,
    monteAbierto: false,
    herencia: 0,
    causaMuerte: null,
    ultimaGanancia: 0,
    guardadoEn: Date.now(),
  };
}

function cargar(): EstadoJugador {
  try {
    const crudo = localStorage.getItem(CLAVE_GUARDADO);
    if (!crudo) return nuevoEstado(0, 1, 0);
    const s = JSON.parse(crudo) as EstadoJugador;
    // Don pasivo acumulado mientras la app estuvo cerrada (§5: idle offline).
    // La suscripción duplica el rendimiento offline (§8).
    if (!s.muerto && s.pactos > 0 && s.guardadoEn) {
      const segundosFuera = Math.max(0, Math.floor((Date.now() - s.guardadoEn) / 1000));
      const multiplicador = cargarBeneficios().suscripcion ? 2 : 1;
      s.don += s.pactos * segundosFuera * multiplicador;
    }
    return s;
  } catch {
    return nuevoEstado(0, 1, 0);
  }
}

function chequearMuerte(s: EstadoJugador): EstadoJugador {
  if (s.muerto) return s;
  let causa: EstadoJugador['causaMuerte'] = null;
  if (s.alma <= 0) {
    causa = {
      titulo: 'Te quedaste sin alma',
      texto:
        'Lo que quedaba de ti se fue con el último pacto. Tu cuerpo camina, pero ya no eres tú quien mira por esos ojos.',
    };
  } else if (s.temor >= 100) {
    causa = {
      titulo: 'El pueblo vino de noche',
      texto: 'Traían antorchas y traían miedo, que es peor. Nadie defendió tu puerta.',
    };
  } else if (s.edad >= EDAD_BASE + s.grado * EDAD_POR_GRADO) {
    causa = {
      titulo: 'Te alcanzó la edad',
      texto: 'Ni el Don detiene todos los inviernos. Te apagas despacio, como vela que cumplió.',
    };
  }
  if (!causa) return s;
  const herencia = Math.floor(s.don * HERENCIA_DON) + s.grado * HERENCIA_POR_GRADO;
  return { ...s, muerto: true, causaMuerte: causa, herencia };
}

function aplicarFx(s: EstadoJugador, o: Opcion): EstadoJugador {
  const fx = o.fx ?? {};
  return {
    ...s,
    don: Math.max(0, s.don + (fx.don ?? 0)),
    temor: Math.min(100, Math.max(0, s.temor + (fx.temor ?? 0))),
    alma: Math.min(100, Math.max(0, s.alma + (fx.alma ?? 0))),
    plata: Math.max(0, s.plata + (fx.plata ?? 0)),
    pactos: s.pactos + (fx.pacto ?? 0),
  };
}

export type Accion =
  | { tipo: 'restaurar'; estado: EstadoJugador }
  | { tipo: 'tocarVela' }
  | { tipo: 'tick' }
  | { tipo: 'envejecer' }
  | { tipo: 'resolverOpcion'; opcion: Opcion }
  | { tipo: 'resolverApuesta'; gana: boolean; monto: number }
  | { tipo: 'cobrarAd'; ganancia: number }
  | { tipo: 'resolverPrueba'; exito: boolean }
  | { tipo: 'cerrarCarta' }
  | { tipo: 'renacer' };

function reducir(s: EstadoJugador, a: Accion): EstadoJugador {
  if (a.tipo === 'restaurar') return a.estado;
  if (s.muerto && a.tipo !== 'renacer') return s;
  switch (a.tipo) {
    case 'tocarVela': {
      const ganancia = 1 + s.bonus;
      return {
        ...s,
        don: s.don + ganancia,
        toques: s.toques + 1,
        ultimaGanancia: ganancia,
        monteAbierto: s.monteAbierto || s.toques + 1 >= TOQUES_PARA_MONTE,
      };
    }
    case 'tick':
      return s.pactos > 0 ? { ...s, don: s.don + s.pactos } : s;
    case 'envejecer':
      return { ...s, edad: s.edad + 1 };
    case 'resolverOpcion':
      return aplicarFx(s, a.opcion);
    case 'resolverApuesta':
      return a.gana
        ? { ...s, plata: s.plata + a.monto }
        : { ...s, plata: s.plata - a.monto, temor: Math.min(100, s.temor + 3) };
    case 'cobrarAd':
      return { ...s, don: s.don + a.ganancia };
    case 'resolverPrueba':
      return a.exito
        ? { ...s, grado: s.grado + 1, pactos: s.pactos + 1 }
        : {
            ...s,
            don: Math.floor(s.don * CASTIGO_FALLO.donRestante),
            alma: Math.max(0, s.alma - CASTIGO_FALLO.alma),
          };
    case 'cerrarCarta':
      return chequearMuerte(s);
    case 'renacer':
      return nuevoEstado(s.herencia, s.gen + 1, s.grado);
    default:
      return s;
  }
}

export function elegirCarta(s: EstadoJugador, sinAds = false): Carta {
  const esAd = !sinAds && Math.random() < PROB_CARTA_AD && s.ultimaGanancia > 2;
  if (esAd) {
    const ad = mazo.find((c) => c.tipo === 'ad');
    if (ad) return ad;
  }
  const disponibles = mazo.filter(
    (c) => c.tipo !== 'ad' && (c.requisitos.grado_min ?? 0) <= s.grado,
  );
  return disponibles[Math.floor(Math.random() * disponibles.length)];
}

export function useJuego() {
  const [estado, despachar] = useReducer(reducir, undefined, cargar);

  // Don pasivo por pactos, cada segundo.
  useEffect(() => {
    const id = setInterval(() => despachar({ tipo: 'tick' }), 1000);
    return () => clearInterval(id);
  }, []);

  // Persistencia local (offline-first, §9).
  useEffect(() => {
    localStorage.setItem(CLAVE_GUARDADO, JSON.stringify({ ...estado, guardadoEn: Date.now() }));
  }, [estado]);

  // Al arrancar: cartas frescas desde Supabase y, si es un dispositivo nuevo,
  // restaurar la última partida respaldada.
  useEffect(() => {
    const habiaGuardadoLocal = localStorage.getItem(CLAVE_GUARDADO) !== null;
    cargarCartasRemotas().then((remotas) => {
      if (remotas?.length) mazo = remotas;
    });
    if (!habiaGuardadoLocal) {
      cargarRunRemota().then((remota) => {
        if (remota) despachar({ tipo: 'restaurar', estado: remota });
      });
    }
    // Solo al montar: decide con el estado de ese momento.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Respaldo remoto: como mucho cada INTERVALO_SYNC_MS, e inmediato al morir.
  const ultimoSync = useRef(0);
  useEffect(() => {
    const ahora = Date.now();
    if (estado.muerto || ahora - ultimoSync.current > INTERVALO_SYNC_MS) {
      ultimoSync.current = ahora;
      void guardarRun(estado);
    }
  }, [estado]);

  return { estado, despachar };
}
