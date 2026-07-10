# ✅ Checklist Lancement — Immo West Afro Bénin
**benin.immowestafro.com** | Supabase: `huvtgaunkcglyeypdtws`

---

## 🔴 PRIORITÉ 1 — Toggle Dark/Light dashboards

### Test de protection
```
# Ouvrir le site en mode light, naviguer vers /admin
# Vérifier que le dashboard reste sombre
# Si pas protégé, ajouter à chaque layout dashboard :
```

```tsx
// Dans /admin/layout.tsx, /agent/layout.tsx, /client/layout.tsx
// Le div racine doit avoir data-theme="dark"
<div data-theme="dark" className="min-h-screen bg-gray-900 text-white">
  {/* contenu */}
</div>
```

### Vérification CSS (globals.css)
Le sélecteur `html.light [data-theme="dark"]` doit exister avec `!important`.
→ Copier le fichier `styles/globals.css` fourni.

---

## 🟡 PRIORITÉ 2 — Optimisations Mobile

### 2.1 Migrer `<img>` vers `<Image>` Next.js

```powershell
# Trouver tous les <img> restants
Select-String -Path "app\**\*.tsx","components\**\*.tsx" -Pattern "<img " -Recurse
```

**Pattern de migration :**
```tsx
// AVANT
<img src={bien.photo} alt={bien.titre} className="w-full h-48 object-cover" />

// APRÈS
import Image from "next/image"
<Image
  src={bien.photo || "/placeholder.jpg"}
  alt={bien.titre}
  width={400}
  height={200}
  className="w-full h-48 object-cover"
  sizes="(max-width: 768px) 100vw, 400px"
  loading="lazy"
/>
```

### 2.2 SwipeGallery — Remplacer dans /biens/[id]
```tsx
// Dans app/biens/[id]/page.tsx
import SwipeGallery from "@/components/mobile/SwipeGallery"

// Remplacer la galerie existante par :
<SwipeGallery
  images={bien.photos || [bien.photo_principale]}
  title={bien.titre}
  aspectRatio="16/9"
  showThumbnails={true}
/>
```

### 2.3 Bottom Navigation — Dans layout public
```tsx
// Dans app/(public)/layout.tsx
import BottomNav from "@/components/mobile/BottomNav"

export default function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <BottomNav />  {/* ← Ajouter ici */}
    </>
  )
}
```

### 2.4 Vérification touch targets (audit)
```powershell
# Chercher les boutons sans min-height
Select-String -Path "app\**\*.tsx","components\**\*.tsx" -Pattern "<button" -Recurse |
  Where-Object { $_.Line -notmatch "min-h" }
```

---

## 🟡 PRIORITÉ 3 — Google Analytics 4

### Installation
```powershell
# Aucun package requis, Script next/script suffit
```

### Variables d'environnement (.env.local)
```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Intégration dans layout.tsx
```tsx
// Déjà inclus dans le layout.tsx fourni
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics"
<GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!} />
```

### Tracking d'événements métier
```tsx
// Dans les pages/composants
import { Analytics } from "@/components/analytics/GoogleAnalytics"

// Dans la page d'un bien :
useEffect(() => {
  Analytics.propertyView(bien.id, bien.titre, bien.type, bien.ville)
}, [])

// Bouton favori :
Analytics.favoriteAdd(bien.id, bien.titre)

// Bouton contact :
Analytics.contactAgent(agent.id, bien.id)
```

---

## 🟢 PRIORITÉ 4 — Fonctionnalités restantes

### 4.1 Messagerie temps réel

**Migrations Supabase** (obligatoire d'abord) :
```
Copier le contenu de supabase-migrations.sql
Ouvrir : https://supabase.com/dashboard/project/huvtgaunkcglyeypdtws/sql
Coller et exécuter
```

**Activer Realtime** :
```
Supabase Dashboard > Database > Replication
Cocher : messages, conversations
```

**Usage dans /client/messages/page.tsx** :
```tsx
import RealtimeMessages from "@/components/messaging/RealtimeMessages"

export default function MessagesPage() {
  const { user } = useUser() // votre hook auth
  return (
    <div className="h-[calc(100vh-64px)]">
      <RealtimeMessages
        userId={user.id}
        userRole="client"
      />
    </div>
  )
}
```

### 4.2 Notifications Push

**Installation** :
```powershell
npm install web-push
npm install --save-dev @types/web-push

# Générer les clés VAPID
npx web-push generate-vapid-keys
```

**Variables d'env** :
```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=votre_clé_publique
VAPID_PRIVATE_KEY=votre_clé_privée
VAPID_SUBJECT=mailto:calavi_immo@immowestafro.com
```

**Bouton d'activation dans les paramètres** :
```tsx
import { subscribeToPush, getPushPermission } from "@/lib/push-notifications"

function NotifButton({ userId }) {
  const [status, setStatus] = useState(getPushPermission())

  return (
    <button
      onClick={async () => {
        const sub = await subscribeToPush(userId)
        if (sub) setStatus("granted")
      }}
      disabled={status === "granted"}
      className="btn-primary"
    >
      {status === "granted" ? "✓ Notifications activées" : "Activer les notifications"}
    </button>
  )
}
```

### 4.3 Page 404

```
→ Copier app/not-found.tsx fourni dans votre projet
→ Next.js App Router le détecte automatiquement
→ Aucune configuration supplémentaire
```

### 4.4 PWA Offline

```
→ Copier public/sw.js fourni
→ Le layout.tsx fourni enregistre automatiquement le SW
→ Créer app/offline/page.tsx pour la page hors ligne
```

**Créer /app/offline/page.tsx** :
```tsx
export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-8">
      <p className="text-5xl mb-6">📡</p>
      <h1 className="text-2xl font-bold mb-3">Vous êtes hors ligne</h1>
      <p className="text-gray-500 mb-6">Vérifiez votre connexion internet</p>
      <button onClick={() => window.location.reload()} className="btn-primary">
        Réessayer
      </button>
    </div>
  )
}
```

---

## 🔵 PRIORITÉ 5 — Finalisation & Lancement

### 5.1 next.config.js — Optimisations
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400, // 24h
  },
  compress: true,
  poweredByHeader: false,
  // Headers de sécurité
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ]
  },
}
module.exports = nextConfig
```

### 5.2 Tests mobile 3G

```
Chrome DevTools > Network > Slow 3G
→ Tester chargement page accueil (< 5s)
→ Tester recherche
→ Tester fiche bien avec galerie
→ Tester envoi message
```

### 5.3 Score Lighthouse > 80

```powershell
# Installer Lighthouse CLI
npm install -g lighthouse

# Audit en mode mobile (réseau simulé Bénin)
lighthouse https://benin.immowestafro.com `
  --preset=mobile `
  --output=html `
  --output-path=lighthouse-report.html `
  --throttling-method=simulate `
  --throttling.rttMs=150 `
  --throttling.throughputKbps=1600
```

**Points critiques pour score > 80 :**
- ✅ Images Next/Image avec sizes
- ✅ Fonts avec display=swap
- ✅ Service Worker cache
- ⚠️ LCP < 2.5s — prioriser l'image hero
- ⚠️ CLS < 0.1 — réserver l'espace images avec aspect-ratio

### 5.4 Déploiement PowerShell

```powershell
# Depuis C:\Users\H P\Documents\immo-west-afro-benin
cd "C:\Users\H P\Documents\immo-west-afro-benin"

# Vérifier tout est OK
npm run build

# Déployer
git add .
git commit -m "feat: mobile optimizations, realtime messaging, PWA offline"
git push origin main

# Vercel déploie automatiquement depuis GitHub
```

### 5.5 Variables d'environnement Vercel

```
Vercel Dashboard > immo-west-afro-benin > Settings > Environment Variables

Vérifier que ces variables sont définies :
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_GA_MEASUREMENT_ID
- NEXT_PUBLIC_VAPID_PUBLIC_KEY
- VAPID_PRIVATE_KEY
- VAPID_SUBJECT
- RESEND_API_KEY
```

---

## 📊 Tableau de bord du projet

| Composant | Fichier | Statut |
|---|---|---|
| CSS dark protection | `styles/globals.css` | ✅ Prêt |
| Bottom Nav mobile | `components/mobile/BottomNav.tsx` | ✅ Prêt |
| Galerie swipe | `components/mobile/SwipeGallery.tsx` | ✅ Prêt |
| Google Analytics 4 | `components/analytics/GoogleAnalytics.tsx` | ✅ Prêt |
| Page 404 | `app/not-found.tsx` | ✅ Prêt |
| Messagerie Realtime | `components/messaging/RealtimeMessages.tsx` | ✅ Prêt |
| Notifications Push | `lib/push-notifications.ts` + `app/api/push/send/route.ts` | ✅ Prêt |
| Service Worker PWA | `public/sw.js` | ✅ Prêt |
| Layout root | `app/layout.tsx` | ✅ Prêt |
| Migrations SQL | `supabase-migrations.sql` | ✅ Prêt |

---

## 🚀 Ordre d'intégration recommandé

```
1. globals.css → remplacer le fichier existant
2. layout.tsx → mettre à jour le layout root
3. Supabase migrations → exécuter le SQL
4. Tester dashboard protection (ouvrir en light mode)
5. SwipeGallery → remplacer dans /biens/[id]
6. BottomNav → ajouter dans layout public
7. not-found.tsx → copier dans /app
8. RealtimeMessages → créer la page /client/messages
9. sw.js → copier dans /public
10. push-notifications → configurer VAPID + route API
11. GA4 → ajouter NEXT_PUBLIC_GA_MEASUREMENT_ID dans Vercel
12. Lighthouse audit → corriger les points faibles
13. Tests 3G sur mobile réel (Samsung Galaxy, Tecno, Infinix)
14. 🎉 Lancement officiel
```
