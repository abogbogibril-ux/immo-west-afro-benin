'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Notif {
  id: string
  type: 'message' | 'visite' | 'prix' | 'demande' | 'systeme'
  titre: string
  contenu: string
  lu: boolean
  created_at: string
  lien?: string
}

// Génère des notifications depuis les messages Supabase
function msgToNotif(msg: any): Notif {
  return {
    id: msg.id,
    type: 'message',
    titre: 'Nouveau message',
    contenu: msg.sujet,
    lu: msg.lu,
    created_at: msg.created_at,
    lien: '/dashboard/client/messages',
  }
}

const NOTIFS_DEMO: Notif[] = [
  {
    id: 'n1', type: 'visite', titre: 'Rappel de visite',
    contenu: 'Votre visite de la Villa Cadjehoun est prévue demain à 10h00.',
    lu: false, created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    lien: '/dashboard/client/visites',
  },
  {
    id: 'n2', type: 'prix', titre: 'Baisse de prix',
    contenu: 'Le prix de "Villa 5p Cotonou" a baissé de 90M à 85M FCFA.',
    lu: false, created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
    lien: '/dashboard/client/favoris',
  },
  {
    id: 'n3', type: 'systeme', titre: 'Bienvenue sur Immo West Afro',
    contenu: 'Votre compte est activé. Commencez à explorer nos annonces.',
    lu: true, created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    lien: '/recherche',
  },
]

const TYPE_CONFIG = {
  message:  { icon: '💬', color: 'bg-green-100 text-green-600' },
  visite:   { icon: '🗓', color: 'bg-purple-100 text-purple-600' },
  prix:     { icon: '💰', color: 'bg-amber-100 text-amber-600' },
  demande:  { icon: '📋', color: 'bg-blue-100 text-blue-600' },
  systeme:  { icon: '🔔', color: 'bg-gray-100 text-gray-600' },
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 60) return `Il y a ${mins} min`
  if (hours < 24) return `Il y a ${hours}h`
  if (days === 1) return 'Hier'
  return `Il y a ${days} jours`
}

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notif[]>(NOTIFS_DEMO)
  const [filter, setFilter] = useState<'toutes' | 'non_lues'>('toutes')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data: msgs } = await supabase
        .from('messages')
        .select('id, sujet, lu, created_at')
        .eq('destinataire_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      const msgNotifs = (msgs ?? []).map(msgToNotif)

      // Fusionner avec les démos (en prod, tout viendrait de Supabase)
      setNotifs([...msgNotifs, ...NOTIFS_DEMO])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = notifs.filter(n => filter === 'toutes' || !n.lu)
  const unreadCount = notifs.filter(n => !n.lu).length

  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, lu: true })))

  const markRead = (id: string) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, lu: true } : n))

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl space-y-5">

      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : 'Tout est lu'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead}
            className="text-sm text-green-600 font-medium hover:underline">
            Tout marquer comme lu
          </button>
        )}
      </div>

      {/* Filtres */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {(['toutes', 'non_lues'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {f === 'toutes' ? 'Toutes' : `Non lues (${unreadCount})`}
          </button>
        ))}
      </div>

      {/* Liste */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse flex gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-xl flex-shrink-0"/>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"/>
                <div className="h-3 bg-gray-100 rounded w-3/4"/>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
          <p className="text-4xl mb-3">🔔</p>
          <p className="font-semibold text-gray-700 mb-1">Aucune notification</p>
          <p className="text-sm text-gray-400">Vous êtes à jour !</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(notif => {
            const cfg = TYPE_CONFIG[notif.type]
            return (
              <div key={notif.id}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
                  !notif.lu ? 'border-green-100' : 'border-gray-100'
                }`}>
                <div className="flex items-start gap-4 p-4">

                  {/* Icône */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${cfg.color}`}>
                    {cfg.icon}
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm ${!notif.lu ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                        {notif.titre}
                      </p>
                      <span className="text-xs text-gray-400 flex-shrink-0 mt-0.5">
                        {timeAgo(notif.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{notif.contenu}</p>

                    {/* Actions */}
                    <div className="flex items-center gap-3 mt-2.5">
                      {notif.lien && (
                        <Link href={notif.lien}
                          onClick={() => markRead(notif.id)}
                          className="text-xs text-green-600 font-semibold hover:underline">
                          {notif.type === 'message' && 'Lire le message →'}
                          {notif.type === 'visite' && 'Voir les détails →'}
                          {notif.type === 'prix' && 'Voir le bien →'}
                          {notif.type === 'demande' && 'Voir la réponse →'}
                          {notif.type === 'systeme' && 'En savoir plus →'}
                        </Link>
                      )}
                      {!notif.lu && (
                        <button onClick={() => markRead(notif.id)}
                          className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                          Marquer comme lu
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Point non lu */}
                  {!notif.lu && (
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-2"/>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Paramètres notifications */}
      <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700">Préférences de notifications</p>
          <p className="text-xs text-gray-400 mt-0.5">Gérez vos alertes email et messages</p>
        </div>
        <Link href="/dashboard/client/parametres"
          className="px-3 py-1.5 border border-gray-200 text-gray-600 text-sm rounded-lg hover:border-green-300 hover:text-green-600 transition-all">
          Configurer →
        </Link>
      </div>
    </div>
  )
}