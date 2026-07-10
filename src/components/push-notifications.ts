/**
 * push-notifications.ts — Web Push API pour Immo West Afro Bénin
 *
 * Flow :
 *   1. L'utilisateur accepte les notifications
 *   2. On récupère le PushSubscription
 *   3. On l'envoie à Supabase (table push_subscriptions)
 *   4. Le serveur envoie des notifications via web-push
 *
 * Installation requise :
 *   npm install web-push
 *   npx web-push generate-vapid-keys
 *
 * Variables d'env :
 *   NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
 *   VAPID_PRIVATE_KEY=...
 *   VAPID_SUBJECT=mailto:calavi_immo@immowestafro.com
 */

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ── Types ───────────────────────────────────────────────────
export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
  data?: Record<string, unknown>;
}

// ── Vérification support ────────────────────────────────────
export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
}

export function getPushPermission(): NotificationPermission | "unsupported" {
  if (!isPushSupported()) return "unsupported";
  return Notification.permission;
}

// ── Demande de permission ───────────────────────────────────
export async function requestPushPermission(): Promise<boolean> {
  if (!isPushSupported()) return false;

  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;

  const result = await Notification.requestPermission();
  return result === "granted";
}

// ── Conversion clé VAPID ────────────────────────────────────
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// ── Abonnement push ─────────────────────────────────────────
export async function subscribeToPush(userId: string): Promise<PushSubscription | null> {
  try {
    const granted = await requestPushPermission();
    if (!granted) return null;

    const registration = await navigator.serviceWorker.ready;
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

    if (!vapidKey) {
      console.error("VAPID public key manquante");
      return null;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    });

    // Sauvegarder dans Supabase
    const { error } = await supabase
      .from("push_subscriptions")
      .upsert({
        user_id: userId,
        endpoint: subscription.endpoint,
        p256dh: btoa(
          String.fromCharCode(...new Uint8Array(subscription.getKey("p256dh")!))
        ),
        auth: btoa(
          String.fromCharCode(...new Uint8Array(subscription.getKey("auth")!))
        ),
        user_agent: navigator.userAgent,
        created_at: new Date().toISOString(),
      }, {
        onConflict: "endpoint",
      });

    if (error) {
      console.error("Erreur sauvegarde subscription:", error);
    }

    return subscription;
  } catch (err) {
    console.error("Erreur abonnement push:", err);
    return null;
  }
}

// ── Désabonnement ───────────────────────────────────────────
export async function unsubscribeFromPush(userId: string): Promise<void> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      await supabase
        .from("push_subscriptions")
        .delete()
        .eq("user_id", userId)
        .eq("endpoint", subscription.endpoint);
    }
  } catch (err) {
    console.error("Erreur désabonnement push:", err);
  }
}

// ── Notification locale (sans push serveur) ─────────────────
export function showLocalNotification(payload: PushPayload): void {
  if (!isPushSupported() || Notification.permission !== "granted") return;

  navigator.serviceWorker.ready.then((registration) => {
    registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon || "/icons/icon-192x192.png",
      badge: payload.badge || "/icons/badge-72x72.png",
      tag: payload.tag || "immo-notification",
      data: payload.data || {},
    });
  });
}

// ── Hook React pour les notifications ──────────────────────
// À utiliser dans un fichier .tsx
export type PushStatus = "unsupported" | "default" | "granted" | "denied" | "loading";
