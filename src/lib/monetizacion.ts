import { Capacitor } from '@capacitor/core';
import {
  AdMob,
  RewardAdPluginEvents,
  type AdMobRewardItem,
} from '@capacitor-community/admob';

// §8 del diseño. En Android usa AdMob real (rewarded); en web/desarrollo
// simula el anuncio para poder probar el flujo completo.
// Play Billing (suscripción y pago único) se conecta con la build Android
// de la semana 3; hasta entonces las compras son una simulación marcada.

// App ID de AdMob de Cinurna. Va también en el AndroidManifest.xml
// (meta-data com.google.android.gms.ads.APPLICATION_ID) al añadir la
// plataforma Android.
export const ADMOB_APP_ID = 'ca-app-pub-7371077264502684~1873779434';

// ID de prueba oficial de Google para rewarded. Reemplazar por el ad unit
// real (ca-app-pub-7371077264502684/...) cuando se cree el bloque
// "Recompensado" en AdMob.
const REWARDED_ID_PRUEBA = 'ca-app-pub-3940256099942544/5224354917';

export const esNativo = Capacitor.isNativePlatform();

let admobListo = false;

async function prepararAdMob(): Promise<void> {
  if (admobListo) return;
  await AdMob.initialize();
  admobListo = true;
}

/**
 * Muestra un comercial recompensado. Resuelve `true` si el jugador
 * completó el anuncio (y por tanto gana la recompensa).
 */
export async function verComercial(): Promise<boolean> {
  if (!esNativo) {
    // Web / desarrollo: simulación breve para probar el flujo.
    await new Promise((r) => setTimeout(r, 1500));
    return true;
  }
  try {
    await prepararAdMob();
    let recompensado = false;
    const escucha = await AdMob.addListener(
      RewardAdPluginEvents.Rewarded,
      (_item: AdMobRewardItem) => {
        recompensado = true;
      }
    );
    await AdMob.prepareRewardVideoAd({ adId: REWARDED_ID_PRUEBA });
    await AdMob.showRewardVideoAd();
    await escucha.remove();
    return recompensado;
  } catch (e) {
    console.warn('No se pudo mostrar el comercial:', e);
    return false;
  }
}

export type Producto = 'sin_ads' | 'suscripcion';

export interface ResultadoCompra {
  ok: boolean;
  demo: boolean;
  mensaje: string;
}

/**
 * Compra un producto. En Android esto pasará por Play Billing con
 * validación en servidor (Edge Function); en web queda en modo demo.
 */
export async function comprar(producto: Producto): Promise<ResultadoCompra> {
  if (esNativo) {
    // TODO(semana 3): integrar Play Billing + validación server-side.
    return {
      ok: false,
      demo: false,
      mensaje: 'Las compras estarán disponibles en la versión de Play Store.',
    };
  }
  await new Promise((r) => setTimeout(r, 800));
  return {
    ok: true,
    demo: true,
    mensaje:
      producto === 'sin_ads'
        ? 'Trato hecho. El compadre del trago no te molestará más. [demo]'
        : 'Trato sellado. Tus pactos trabajan doble mientras duermes. [demo]',
  };
}
