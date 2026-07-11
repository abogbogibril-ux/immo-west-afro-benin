# Plan de Maintenance
**Immo West Afro Bénin** — benin.immowestafro.com

*Document de suivi pour les actions de maintenance planifiées après le lancement*

---

## 🔴 Priorité haute — À traiter en session dédiée

### 1. Migration Next.js 14 → 15.5.18 (minimum)

**Contexte :** Next.js 14.x ne recevra plus aucun correctif de sécurité (annonce officielle Vercel, mai 2026). La version 15.5.18 corrige l'ensemble des 13 failles identifiées.

**Niveau d'urgence réel :** modéré (pas critique immédiat) — le site est hébergé sur Vercel, qui neutralise déjà plusieurs vecteurs d'attaque (SSRF WebSocket, contrebande de requêtes HTTP) au niveau infrastructure, et le projet n'utilise ni `middleware.ts`, ni WebSocket personnalisé, ni Cache Components, ni nonces CSP — réduisant l'exposition réelle aux failles les plus graves.

**Étapes prévues :**
1. Exécuter le codemod officiel Next.js pour automatiser les changements de syntaxe
2. Adapter manuellement les routes dynamiques (`params`/`searchParams` deviennent asynchrones) — fichiers concernés estimés : `/bien/[id]/page.tsx`, `/dashboard/agent/apercu/[id]/page.tsx`, et autres routes avec paramètres
3. Tests complets avant déploiement : authentification, publication d'annonce, messagerie temps réel, notifications push, mode hors-ligne (PWA), dark/light mode
4. Déploiement progressif avec possibilité de rollback rapide (`git revert`) en cas de problème

**Estimation :** 1 à 3 jours de travail effectif, répartis sur plusieurs sessions courtes plutôt qu'une session unique.

**Statut :** ⏳ Non commencé

---

### 2. Limitation de débit (rate limiting) sur les formulaires publics

**Contexte :** aucune protection anti-spam/anti-bot n'est actuellement en place sur l'inscription, la connexion, l'envoi de messages et les demandes de visite.

**Actions prévues :**
- Activer la protection CAPTCHA native de Supabase Auth (Authentication → Settings)
- Évaluer l'ajout d'un rate limiting applicatif (Vercel Edge Middleware ou table de suivi par IP dans Supabase)

**Statut :** ⏳ Non commencé

---

### 3. Audit complet des policies RLS (Row Level Security)

**Contexte :** un précédent oubli a été détecté et corrigé sur la table `localites` (RLS activé sans aucune policy, bloquant silencieusement les lectures). Ce type d'erreur peut exister ailleurs sans symptôme visible immédiat.

**Résultat de l'audit (11/07/2026) :** deux tables supplémentaires présentaient le même défaut :
- `favoris` — RLS activé, 0 policy → le bouton Favori échouait probablement silencieusement depuis le début
- `notifications` — RLS activé, 0 policy → table non encore utilisée activement, sécurisée par précaution

**Correctif appliqué :** policies `FOR ALL USING/WITH CHECK (auth.uid() = user_id)` ajoutées sur les deux tables. Nouvel audit confirmé : plus aucune table à risque.

**Statut :** ✅ **Terminé** (11/07/2026)

---

### 4. Vérification des policies du bucket Storage (photos d'annonces)

**Contexte :** la validation du type de fichier et de la taille maximale lors de l'upload de photos n'a pas été vérifiée en profondeur.

**Action prévue :** vérifier/configurer les policies du bucket `biens-images` (types MIME acceptés, taille max par fichier) côté Supabase Storage, en complément de la validation client existante.

**Statut :** ⏳ Non commencé

---

## 🟢 Maintenance récurrente recommandée

| Tâche | Fréquence suggérée |
|---|---|
| Vérifier `npm audit` et mettre à jour les dépendances mineures | Mensuelle |
| Vérifier Google Analytics (trafic, pages populaires, taux de conversion) | Hebdomadaire |
| Vérifier les logs d'erreurs Vercel (Runtime Logs) | Hebdomadaire |
| Nettoyer les annonces expirées/obsolètes | Mensuelle |
| Vérifier les sauvegardes Supabase (si configurées) | Mensuelle |
| Revue des signalements d'annonces (`ReportButton`) | Hebdomadaire |
| Réexécuter un audit PageSpeed Insights | Trimestrielle |

---

## 📌 Historique des sessions de maintenance

| Date | Session | Résumé |
|---|---|---|
| 11/07/2026 | Refonte majeure + audit sécurité | Refonte page bien, dashboard agent, notifications push, PWA, pages légales, correction XSS JSON-LD, analyse Next.js CVE |

*Ajouter une ligne à chaque session future pour garder une trace de l'évolution du projet.*

---

**Pour reprendre le travail à la prochaine session**, ce document sert de point de départ : consulter la section "Priorité haute" ci-dessus pour savoir où reprendre exactement.
