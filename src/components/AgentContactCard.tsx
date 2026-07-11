'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Props {
  prix: number
  transaction: string
  surface?: number
  statut: string
  agent?: {
    id: string
    nom: string
    prenom: string
    telephone?: string
    whatsapp?: string
    avatar_url?: string
    role?: string
    nom_agence?: string
    ville?: string
  }
  bienId: string
  bienTitre: string
  userId?: string
  isFavorited?: boolean
  compact?: boolean
}

const STATUT_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  'publié':     { label: 'Disponible',  color: 'text-green-700 bg-green-100',   dot: 'bg-green-500' },
  'vendu':      { label: 'Vendu',       color: 'text-red-700 bg-red-100',       dot: 'bg-red-500'   },
  'loué':       { label: 'Loué',        color: 'text-orange-700 bg-orange-100', dot: 'bg-orange-500' },
  'sous-offre': { label: 'Sous offre',  color: 'text-yellow-700 bg-yellow-100', dot: 'bg-yellow-500' },
  'archivé':    { label: 'Archivé',     color: 'text-gray-600 bg-gray-100',     dot: 'bg-gray-400'  },
}

export default function AgentContactCard({
  prix, transaction, surface, statut, agent,
  bienId, bienTitre, userId, compact = false
}: Props) {
  const [showVisit, setShowVisit] = useState(false)
  const [visitMsg, setVisitMsg] = useState('')
  const [visitSent, setVisitSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const statConfig = STATUT_CONFIG[statut] ?? STATUT_CONFIG['publié']
  const formattedPrice = new Intl.NumberFormat('fr-FR').format(prix)
  const prixSuffix = transaction === 'location' ? ' FCFA/mois' : ' FCFA'
  const whatsappNum = agent?.whatsapp ?? agent?.telephone
  const waText = encodeURIComponent(
    `Bonjour, je suis intéressé(e) par votre annonce "${bienTitre}" sur Immo West Afro. Pouvez-vous me donner plus d'informations ?`
  )
  const annonceurNom = agent ? `${agent.prenom} ${agent.nom}` : "l'annonceur"

  const sendVisitRequest = async () => {
    if (!userId) { router.push(`/connexion?redirect=/bien/${bienId}`); return }
    setLoading(true)
    try {
      await supabase.from('messages').insert({
        expediteur_id: userId,
        destinataire_id: agent?.id,
        bien_id: bienId,
        sujet: 'Demande de visite',
        contenu: visitMsg || `Je souhaite visiter ce bien : "${bienTitre}".`,
        lu: false,
      })
      setVisitSent(true)
    } catch { }
    finally { setLoading(false) }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">

      {/* Prix */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-700 px-4 py-3.5">
        <p className="text-green-200 text-[10px] font-medium uppercase tracking-widest mb-0.5">
          {transaction === 'vente' ? 'Prix de vente' : 'Loyer mensuel'}
        </p>
        <div className="text-white">
          <span className="text-xl md:text-2xl font-bold">{formattedPrice}</span>
          <span className="text-green-200 text-xs ml-1">{prixSuffix}</span>
        </div>
        {surface && (
          <p className="text-green-300 text-[10px] mt-0.5">
            ≈ {Math.round(prix / surface).toLocaleString('fr-FR')} FCFA/m²
          </p>
        )}
      </div>

      <div className="px-4 py-3 flex flex-col gap-2.5 flex-1">

        {/* Statut */}
        <span className={`self-start inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${statConfig.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statConfig.dot} inline-block`}></span>
          {statConfig.label}
        </span>

        {/* Agent — compact : nom, agence, siège */}
        {agent && (
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-gray-100">
            {agent.avatar_url ? (
              <img src={agent.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover ring-2 ring-green-100 flex-shrink-0" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-xs shadow-sm flex-shrink-0">
                {(agent.prenom?.[0] ?? '').toUpperCase()}{(agent.nom?.[0] ?? '').toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-900 text-xs truncate leading-tight">{agent.prenom} {agent.nom}</p>
              {agent.nom_agence && (
                <p className="text-[11px] text-gray-500 truncate leading-tight">{agent.nom_agence}</p>
              )}
              {agent.ville && (
                <p className="text-[10px] text-gray-400 truncate leading-tight flex items-center gap-0.5">
                  <svg className="w-2.5 h-2.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  </svg>
                  {agent.ville}
                </p>
              )}
            </div>
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col gap-2">
          {whatsappNum && (
            <a href={`https://wa.me/${whatsappNum.replace(/[\s+\-()]/g, '')}?text=${waText}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#25D366] text-white rounded-lg font-semibold text-xs hover:bg-[#1fba59] transition-colors shadow-sm min-h-[40px]">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </a>
          )}

          {agent?.telephone && (
            <a href={`tel:${agent.telephone}`}
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-600 text-white rounded-lg font-semibold text-xs hover:bg-green-700 transition-colors shadow-sm min-h-[40px]">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 7V5z" />
              </svg>
              {agent.telephone}
            </a>
          )}

          {!visitSent ? (
            !showVisit ? (
              <button onClick={() => setShowVisit(true)}
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-white border-2 border-gray-200 text-gray-700 rounded-lg font-semibold text-xs hover:border-green-400 hover:text-green-700 transition-all min-h-[40px]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Demander une visite
              </button>
            ) : (
              <div className="space-y-1.5">
                <textarea rows={2} placeholder="Précisez vos disponibilités..."
                  value={visitMsg} onChange={e => setVisitMsg(e.target.value)}
                  className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-xs resize-none focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50" />
                <div className="flex gap-1.5">
                  <button onClick={() => setShowVisit(false)}
                    className="flex-1 py-2 border border-gray-200 text-gray-500 rounded-lg text-xs hover:bg-gray-50 font-medium min-h-[36px]">
                    Annuler
                  </button>
                  <button onClick={sendVisitRequest} disabled={loading}
                    className="flex-1 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 disabled:opacity-60 flex items-center justify-center gap-1.5 min-h-[36px]">
                    {loading ? (
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                    ) : 'Envoyer'}
                  </button>
                </div>
              </div>
            )
          ) : (
            <div className="flex items-center gap-2 p-2.5 bg-green-50 rounded-lg border border-green-100">
              <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
              </svg>
              <p className="text-xs text-green-700 font-medium">Demande envoyée !</p>
            </div>
          )}
        </div>

        {/* Disclaimer court */}
        <p className="text-[10px] text-gray-400 leading-snug pt-2 border-t border-gray-100 mt-0.5">
          Cette page est une publicité. Tout contenu, service ou produit affiché est la
          propriété de <span className="font-medium text-gray-500">{annonceurNom}</span> et
          Immo West Afro n'en est pas responsable -{' '}
          <Link href="/cgu" className="text-green-600 hover:underline font-medium">
            Conditions Générales d'Utilisation
          </Link>
        </p>
      </div>
    </div>
  )
}
