'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Demande {
  id: string
  sujet: string
  contenu: string
  created_at: string
  lu: boolean
  bien_id?: string
  destinataire_id: string
  biens?: { titre: string; ville: string; prix: number }
  profiles?: { nom: string; prenom: string; telephone?: string; role?: string }
}

const STATUT_STEPS = ['Envoyée', 'En attente', 'Répondue', 'Clôturée']

const FILTERS = ['Toutes', 'En attente', 'Répondues', 'Archivées']

function getStatut(demande: Demande) {
  if (demande.sujet?.startsWith('Re:')) return 'Répondue'
  return demande.lu ? 'Répondue' : 'En attente'
}

function getStatutColor(statut: string) {
  switch (statut) {
    case 'En attente': return 'bg-yellow-100 text-yellow-700'
    case 'Répondue': return 'bg-[#00bcd4]/20 text-[#00bcd4]'
    case 'Archivée': return 'bg-gray-100 text-gray-500'
    default: return 'bg-blue-100 text-blue-700'
  }
}

function getStatutStep(statut: string) {
  switch (statut) {
    case 'En attente': return 1
    case 'Répondue': return 2
    case 'Clôturée': return 3
    default: return 1
  }
}

export default function DemandesPage() {
  const [demandes, setDemandes] = useState<Demande[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('Toutes')
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('messages')
        .select(`
          *,
          biens (titre, ville, prix),
          profiles!messages_destinataire_id_fkey (nom, prenom, telephone, role)
        `)
        .eq('expediteur_id', user.id)
        .order('created_at', { ascending: false })

      setDemandes(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = demandes.filter(d => {
    const statut = getStatut(d)
    if (filter === 'Toutes') return true
    if (filter === 'En attente') return statut === 'En attente'
    if (filter === 'Répondues') return statut === 'Répondue'
    return false
  })

  const stats = {
    total: demandes.length,
    enAttente: demandes.filter(d => getStatut(d) === 'En attente').length,
    repondues: demandes.filter(d => getStatut(d) === 'Répondue').length,
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#0f172a] min-h-screen">

      {/* En-tête */}
      <div>
        <h1 className="text-xl font-bold text-white">Mes demandes</h1>
        <p className="text-sm text-gray-400 mt-0.5">Suivez le statut de vos demandes auprès des agents</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'text-gray-900', bg: 'bg-white' },
          { label: 'En attente', value: stats.enAttente, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Répondues', value: stats.repondues, color: 'text-[#00bcd4]', bg: 'bg-[#00bcd4]/10' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl border border-[#334155] p-3.5 text-center`}>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-400 mt-0.5 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
              filter === f
                ? 'bg-[#00bcd4] text-white'
                : 'bg-[#0f172a] border border-[#334155] text-gray-500 hover:border-green-300 hover:text-[#00bcd4]'
            }`}>
            {f}
          </button>
        ))}
      </div>

      {/* Liste demandes */}
      {loading ? (
        <div className= text-white"space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="bg-[#1e293b] rounded-2xl border border-[#334155] p-5 animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/2"/>
              <div className="h-3 bg-gray-100 rounded w-3/4"/>
              <div className="h-3 bg-gray-100 rounded w-1/3"/>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] shadow-sm p-10 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-semibold text-gray-700 mb-1">Aucune demande</p>
          <p className="text-sm text-gray-400 mb-4">Parcourez nos annonces et contactez un agent</p>
          <Link href="/recherche"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#00bcd4] text-white text-sm font-semibold rounded-xl hover:bg-[#0097a7] transition-colors">
            Parcourir les annonces
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(demande => {
            const statut = getStatut(demande)
            const step = getStatutStep(statut)
            const isOpen = expanded === demande.id

            return (
              <div key={demande.id}
                className="bg-[#1e293b] rounded-2xl border border-[#334155] shadow-sm overflow-hidden">

                {/* Header carte */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatutColor(statut)}`}>
                          {statut}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(demande.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric', month: 'long', year: 'numeric'
                          })}
                        </span>
                      </div>
                      {demande.biens && (
                        <Link href={`/bien/${demande.bien_id}`}
                          className="font-semibold text-white hover:text-[#00bcd4] transition-colors">
                          🏠 {demande.biens.titre}
                        </Link>
                      )}
                      <p className="text-sm text-gray-500 mt-0.5">
                        {demande.biens?.ville && `📍 ${demande.biens.ville}`}
                        {demande.biens?.prix && ` · ${new Intl.NumberFormat('fr-FR').format(demande.biens.prix)} FCFA`}
                      </p>
                    </div>
                    {demande.profiles && (
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-medium text-gray-700">
                          {demande.profiles.prenom} {demande.profiles.nom}
                        </p>
                        <p className="text-[10px] text-gray-400 capitalize">{demande.profiles.role ?? 'Agent'}</p>
                      </div>
                    )}
                  </div>

                  {/* Sujet */}
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-3 py-2 mb-4">
                    <span className="font-medium text-gray-700">Objet : </span>{demande.sujet}
                  </p>

                  {/* Barre de statut */}
                  <div className="mb-4">
                    <div className="flex items-center gap-0">
                      {STATUT_STEPS.map((s, i) => (
                        <div key={s} className="flex items-center flex-1 last:flex-none">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                            i < step
                              ? 'bg-[#00bcd4] border-[#00bcd4] text-white'
                              : i === step
                              ? 'border-green-600 text-[#00bcd4] bg-white'
                              : 'border-[#334155] text-gray-300 bg-white'
                          }`}>
                            {i < step ? '✓' : i + 1}
                          </div>
                          {i < STATUT_STEPS.length - 1 && (
                            <div className={`flex-1 h-0.5 ${i < step - 1 ? 'bg-green-600' : 'bg-gray-200'}`}/>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between mt-1">
                      {STATUT_STEPS.map((s, i) => (
                        <span key={s} className={`text-[10px] ${i < step ? 'text-[#00bcd4] font-medium' : 'text-gray-400'} ${i === 0 ? '' : i === STATUT_STEPS.length - 1 ? 'text-right' : 'text-center'}`}
                          style={{ width: i === 0 || i === STATUT_STEPS.length - 1 ? 'auto' : '100%' }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Message (expandable) */}
                  {isOpen && (
                    <div className="bg-[#0f172a] rounded-xl p-4 mb-4">
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{demande.contenu}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setExpanded(isOpen ? null : demande.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-[#334155] text-gray-600 text-sm rounded-lg hover:border-green-300 hover:text-[#00bcd4] transition-all">
                      {isOpen ? '▲ Réduire' : '▼ Voir le message'}
                    </button>

                    {demande.bien_id && (
                      <Link href={`/bien/${demande.bien_id}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-[#334155] text-gray-600 text-sm rounded-lg hover:border-green-300 hover:text-[#00bcd4] transition-all">
                        🏠 Voir le bien
                      </Link>
                    )}

                    <Link href={`/dashboard/client/messages`}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00bcd4] text-white text-sm font-medium rounded-lg hover:bg-[#0097a7] transition-colors">
                      💬 Répondre
                    </Link>

                    {demande.profiles?.telephone && (
                      <a href={`https://wa.me/${demande.profiles.telephone.replace(/[\s+\-()]/g, '')}?text=${encodeURIComponent(`Bonjour, suite à ma demande du ${new Date(demande.created_at).toLocaleDateString('fr-FR')}...`)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] text-white text-sm font-medium rounded-lg hover:bg-[#1fba59] transition-colors">
                        WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}