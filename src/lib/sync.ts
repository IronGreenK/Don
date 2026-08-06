import { supabase } from './supabase';
import type { Carta, EstadoJugador } from '../game/types';

// Sincronización MVP (§9): cuenta anónima + respaldo de la partida en `runs`.
// El cliente manda; el servidor guarda. Anti-cheat y economía servidor: v2.

let usuarioId: string | null = null;

export async function asegurarSesion(): Promise<string | null> {
  if (!supabase) return null;
  if (usuarioId) return usuarioId;
  try {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      usuarioId = data.session.user.id;
      return usuarioId;
    }
    const { data: anon, error } = await supabase.auth.signInAnonymously();
    if (error) {
      console.warn('Sin cuenta anónima (¿está habilitado Anonymous sign-in?):', error.message);
      return null;
    }
    usuarioId = anon.user?.id ?? null;
    return usuarioId;
  } catch (e) {
    console.warn('Supabase no disponible, seguimos en local:', e);
    return null;
  }
}

export async function guardarRun(estado: EstadoJugador): Promise<void> {
  if (!supabase) return;
  const uid = await asegurarSesion();
  if (!uid) return;
  const { error } = await supabase.from('runs').upsert(
    {
      user_id: uid,
      generacion: estado.gen,
      don: estado.don,
      temor: estado.temor,
      alma: estado.alma,
      plata: estado.plata,
      edad: estado.edad,
      grado: estado.grado,
      pactos: estado.pactos,
      muerto: estado.muerto,
      causa_muerte: estado.causaMuerte?.titulo ?? null,
      herencia: estado.muerto ? estado.herencia : null,
      ended_at: estado.muerto ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
      estado,
    },
    { onConflict: 'user_id,generacion' }
  );
  if (error) console.warn('No se pudo respaldar la partida:', error.message);
}

export async function cargarRunRemota(): Promise<EstadoJugador | null> {
  if (!supabase) return null;
  const uid = await asegurarSesion();
  if (!uid) return null;
  const { data, error } = await supabase
    .from('runs')
    .select('estado')
    .eq('user_id', uid)
    .order('generacion', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data?.estado) return null;
  return data.estado as EstadoJugador;
}

export async function cargarCartasRemotas(): Promise<Carta[] | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('cards')
      .select('id, region, tipo, requisitos, texto, opciones')
      .eq('activa', true);
    if (error || !data?.length) return null;
    return data as Carta[];
  } catch {
    return null;
  }
}
