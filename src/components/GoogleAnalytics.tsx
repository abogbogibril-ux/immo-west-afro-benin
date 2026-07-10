"use client";

/**
 * GoogleAnalytics — GA4 pour Immo West Afro Bénin
 *
 * Usage dans app/layout.tsx :
 *   import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
 *   <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!} />
 *
 * Variable d'env requise :
 *   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
 *
 * Événements trackés :
 *   - page_view (automatique)
 *   - property_view
 *   - contact_agent
 *   - favorite_add / favorite_remove
 *   - search
 *   - share
 *   - publish_click
 */

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

// ── Types GA4 ───────────────────────────────────────────────
declare global {
  interface Window {
    gtag: (
      command: "config" | "event" | "js" | "set",
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void;
    dataLayer: unknown[];
  }
}

// ── Helpers exports pour les autres composants ──────────────
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function trackEvent(
  action: string,
  params?: Record<string, string | number | boolean>
) {
  if (typeof window === "undefined" || !window.gtag || !GA_MEASUREMENT_ID) return;
  window.gtag("event", action, {
    ...params,
    country: "BJ",           // Bénin
    app_name: "ImmoWestAfro",
  });
}

// ── Événements métier immobilier ────────────────────────────
export const Analytics = {
  /** Quand un utilisateur ouvre une fiche de bien */
  propertyView: (id: string, title: string, type: string, ville: string) => {
    trackEvent("property_view", {
      item_id: id,
      item_name: title,
      item_category: type,
      item_list_name: ville,
    });
  },

  /** Quand un utilisateur clique sur "Contacter l'agent" */
  contactAgent: (agentId: string, bienId: string) => {
    trackEvent("contact_agent", {
      agent_id: agentId,
      bien_id: bienId,
    });
  },

  /** Ajout aux favoris */
  favoriteAdd: (bienId: string, bienTitle: string) => {
    trackEvent("favorite_add", {
      item_id: bienId,
      item_name: bienTitle,
    });
  },

  /** Suppression des favoris */
  favoriteRemove: (bienId: string) => {
    trackEvent("favorite_remove", { item_id: bienId });
  },

  /** Recherche immobilière */
  search: (query: string, filters?: Record<string, string>) => {
    trackEvent("search", {
      search_term: query,
      ...filters,
    });
  },

  /** Partage d'une annonce */
  share: (bienId: string, method: "native" | "copy" | "whatsapp" | "facebook") => {
    trackEvent("share", {
      content_type: "bien",
      item_id: bienId,
      method,
    });
  },

  /** Clic sur "Publier une annonce" */
  publishClick: (userRole: "agent" | "client" | "guest") => {
    trackEvent("publish_click", { user_role: userRole });
  },

  /** Inscription complétée */
  signUp: (method: "email" | "google", role: "agent" | "client") => {
    trackEvent("sign_up", { method, role });
  },

  /** Score Lighthouse / performance (manuel) */
  lighthouseScore: (score: number) => {
    trackEvent("lighthouse_score", { value: score });
  },
};

// ── Composant principal ─────────────────────────────────────
interface GoogleAnalyticsProps {
  gaId: string;
}

function PageViewTracker({ gaId }: { gaId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!gaId || typeof window === "undefined" || !window.gtag) return;

    const url = pathname + (searchParams.toString() ? `?${searchParams}` : "");

    window.gtag("config", gaId, {
      page_path: url,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname, searchParams, gaId]);

  return null;
}

export default function GoogleAnalytics({ gaId }: GoogleAnalyticsProps) {
  if (!gaId || process.env.NODE_ENV !== "production") {
    // En dev, on log les events dans la console
    if (process.env.NODE_ENV === "development") {
      if (typeof window !== "undefined" && !window.gtag) {
        window.dataLayer = window.dataLayer || [];
        window.gtag = function () {
          console.log("[GA4 Dev]", ...arguments);
        };
      }
    }
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              page_path: window.location.pathname,
              send_page_view: false,
              country: 'BJ',
              currency: 'XOF',
              cookie_flags: 'SameSite=None;Secure',
              anonymize_ip: true
            });
          `,
        }}
      />
      <PageViewTracker gaId={gaId} />
    </>
  );
}
