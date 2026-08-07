import { supabase } from './supabase';
import type { Carta, EstadoJugador } from '../game/types';

// Sincronización MVP (§9): cuenta anónima + respaldo de la partida en `runs`.
// El cliente manda; el servidor guarda. Anti-cheat y economía servidor: v2.

let usuarioId: string | null = null;

// Si la sesión cambia (p. ej. al recuperar el linaje con otro usuario),
// el caché deja de valer.
supabase?.auth.onAuthStateChange((_evento, sesion) => {
  usuarioId = sesion?.user.id ?? null;
});

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

// ---------- linaje: vincular correo y recuperar en otro dispositivo ----------

/** Correo vinculado a la sesión actual, si lo hay. */
export async function correoVinculado(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.email ?? null;
}

/**
 * Vincula un correo a la cuenta anónima actual. Supabase envía un
 * mensaje de confirmación; al confirmarlo, el linaje queda a nombre
 * de ese correo para siempre.
 */
export async function vincularCorreo(correo: string): Promise<string> {
  if (!supabase) return 'Sin conexión con el más allá (Supabase no configurado).';
  const uid = await asegurarSesion();
  if (!uid) return 'No se pudo abrir sesión. Revisa tu conexión.';
  const { error } = await supabase.auth.updateUser({ email: correo });
  if (error) return `No se pudo vincular: ${error.message}`;
  return 'Revisa tu correo y confirma el vínculo. Tu linaje quedará guardado a tu nombre.';
}

/** Envía un código de acceso al correo para recuperar el linaje. */
export async function enviarCodigo(correo: string): Promise<string | null> {
  if (!supabase) return 'Sin conexión con el más allá (Supabase no configurado).';
  const { error } = await supabase.auth.signInWithOtp({
    email: correo,
    options: { shouldCreateUser: false },
  });
  if (error) return `No se pudo enviar el código: ${error.message}`;
  return null;
}

/**
 * Verifica el código recibido y devuelve la última partida respaldada
 * de ese linaje (o null si no hay ninguna).
 */
export async function recuperarLinaje(
  correo: string,
  codigo: string
): Promise<{ error: string } | { estado: import('../game/types').EstadoJugador | null }> {
  if (!supabase) return { error: 'Sin conexión con el más allá (Supabase no configurado).' };
  const { error } = await supabase.auth.verifyOtp({
    email: correo,
    token: codigo,
    type: 'email',
  });
  if (error) return { error: `Código no válido: ${error.message}` };
  const estado = await cargarRunRemota();
  return { estado };
}
