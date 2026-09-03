import { api } from './api';

// Suporte a Web Push exige service worker + PushManager + Notification API.
// iOS só habilita isso quando o PWA está instalado na tela inicial (16.4+).
export const isPushSupported = (): boolean =>
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window;

export const getPushPermission = (): NotificationPermission | 'unsupported' =>
  isPushSupported() ? Notification.permission : 'unsupported';

// Converte a chave pública VAPID (base64url) para o formato Uint8Array que a
// PushManager.subscribe exige.
function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const normalized = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(normalized);
  const output = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

/** Já existe uma inscrição de push ativa neste dispositivo? */
export async function isPushSubscribed(): Promise<boolean> {
  if (!isPushSupported()) return false;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  return !!sub;
}

/** Pede permissão, cria a inscrição e registra no backend. Lança erro com
 *  mensagem amigável em caso de bloqueio/indisponibilidade. */
export async function enablePush(): Promise<void> {
  if (!isPushSupported()) {
    throw new Error(
      'Seu dispositivo não suporta notificações push aqui. No iPhone, instale o app na tela inicial primeiro.',
    );
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Permissão de notificações negada. Habilite nas configurações do navegador.');
  }

  const { publicKey } = await api.getVapidPublicKey();
  if (!publicKey) {
    throw new Error('Notificações push ainda não configuradas no servidor.');
  }

  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }

  await api.savePushSubscription(sub.toJSON());
}

/** Cancela a inscrição neste dispositivo e remove do backend. */
export async function disablePush(): Promise<void> {
  if (!isPushSupported()) return;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (sub) {
    const endpoint = sub.endpoint;
    await sub.unsubscribe().catch(() => {});
    await api.removePushSubscription(endpoint).catch(() => {});
  }
}
