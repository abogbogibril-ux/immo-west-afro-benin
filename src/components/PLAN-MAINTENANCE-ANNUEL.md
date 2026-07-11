# Plan de Maintenance Annuel
**Immo West Afro Bénin** — benin.immowestafro.com

*Période couverte : Juillet 2026 → Juillet 2027*

---

## 🔴 Priorité immédiate (avant tout le reste)

### Migration Next.js 14 → 15.5.18 minimum

**Pourquoi c'est prioritaire :** Next.js 14.x ne reçoit plus aucun correctif de sécurité (annonce officielle Vercel, mai 2026). C'est la seule action de sécurité encore en attente après l'audit complet du 11/07/2026.

**Contexte technique :**
- Risque réel actuellement modéré (hébergement Vercel + architecture du projet limitent l'exposition), mais non nul et non durable
- Changement principal à gérer : `params`/`searchParams` deviennent asynchrones dans les routes dynamiques
- Fichiers concernés estimés : `/bien/[id]/page.tsx`, `/dashboard/agent/apercu/[id]/page.tsx`, autres routes avec paramètres

**Méthode recommandée :**
1. Codemod automatique officiel Next.js
2. Correction manuelle des routes async
3. Tests complets (auth, publication, messagerie, notifications, PWA, dark mode)
4. Déploiement avec possibilité de rollback rapide

**Délai cible : à réaliser dans le mois suivant la reprise des sessions de développement** (ne pas dépasser fin du 1er trimestre de ce plan annuel)

**Estimation :** 1 à 3 jours de travail effectif, répartis sur plusieurs sessions

**Statut :** ⏳ Non commencé — priorité n°1

---

## 📅 Calendrier annuel des tâches récurrentes

### Chaque semaine
- [ ] Vérifier Google Analytics (trafic, comportement utilisateurs, taux de conversion)
- [ ] Vérifier les Runtime Logs Vercel (erreurs imprévues)
- [ ] Traiter les signalements d'annonces en attente (`ReportButton`)
- [ ] Répondre aux messages/demandes de visite en attente côté agents (suivi qualité)

### Chaque mois
- [ ] Exécuter `npm audit` et mettre à jour les dépendances mineures/patchs
- [ ] Nettoyer les annonces expirées, vendues ou obsolètes
- [ ] Vérifier les sauvegardes Supabase (export ou vérification du point de restauration)
- [ ] Revoir les nouveaux comptes agents (vérification anti-fraude basique)
- [ ] Vérifier l'espace Storage utilisé (photos) vs quota Supabase

### Chaque trimestre
- [ ] Réexécuter un audit complet PageSpeed Insights (objectif : rester >80 mobile)
- [ ] Réexécuter l'audit RLS complet (requête SQL de détection des tables sans policy)
- [ ] Vérifier la validité des clés API (GA4, VAPID, Supabase) et leur date d'expiration éventuelle
- [ ] Revoir le contenu des pages légales (CGU, confidentialité) — mise à jour si évolution du service
- [ ] Vérifier les liens et boutons de partage (WhatsApp/Facebook/Email) toujours fonctionnels

### Chaque semestre
- [ ] Évaluation UX : recueillir les retours utilisateurs/agents accumulés et prioriser les ajustements
- [ ] Vérifier la pertinence du catalogue de villes couvertes (extension géographique éventuelle)
- [ ] Revoir la stratégie de contenu YouTube/réseaux sociaux

### Une fois par an
- [ ] Mise à jour majeure des dépendances (React, Tailwind, Supabase JS client) avec tests complets
- [ ] Audit de sécurité complet renouvelé (comme celui du 11/07/2026)
- [ ] Revue complète du plan de maintenance (ce document) et mise à jour pour l'année suivante

---

## 🗓️ Répartition suggérée par trimestre

| Trimestre | Focus principal |
|---|---|
| **T1** (Juil–Sept 2026) | Migration Next.js (priorité 1) + stabilisation post-lancement |
| **T2** (Oct–Déc 2026) | Consolidation contenu réel, suivi des premiers agents/utilisateurs, ajustements UX |
| **T3** (Jan–Mars 2027) | Audit sécurité intermédiaire, optimisations performance, revue des tâches mensuelles/trimestrielles |
| **T4** (Avr–Juin 2027) | Bilan annuel, mise à jour des dépendances majeures, préparation du plan de l'année suivante |

---

## 📌 Historique des interventions

| Date | Intervention | Résultat |
|---|---|---|
| 11/07/2026 | Refonte majeure (dashboard, page bien, PWA, pages légales) + audit sécurité complet | XSS corrigé, 2 failles RLS corrigées, policies Storage sécurisées |

*Ajouter une ligne à chaque intervention future.*

---

## Rappel des décisions prises

- **CAPTCHA (Cloudflare Turnstile)** : compte créé, clés disponibles, mais **volontairement non activé** pour préserver l'accessibilité aux utilisateurs peu familiers avec l'informatique. À reconsidérer uniquement si du spam réel est constaté.
- **Duplication multi-pays** (ex. Togo) : chaque pays doit avoir sa propre instance complète (Supabase, Vercel, domaine) — voir `RAPPORT-GLOBAL-PROJET.md` pour le guide détaillé.

---

*Ce plan sert de feuille de route pour l'année à venir. La priorité n°1 (migration Next.js) doit être traitée avant toute nouvelle fonctionnalité majeure.*
