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
    email?: string
  }
  bienId: string
  bienTitre: string
  userId?: string
  isFavorited?: boolean
  compact?: boolean
}

export default function AgentContactCard({
  agent, bienId, bienTitre, userId
}: Props) {
  const [showVisit, setShowVisit] = useState(false)
  const [visitMsg, setVisitMsg] = useState('')
  const [visitSent, setVisitSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

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
    <div className="h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      <div className="flex-1 flex flex-col px-5 py-5 gap-4">

        {agent && (
          <div className="space-y-3.5">

            {/* Nom */}
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-sm font-semibold text-gray-900">{agent.prenom} {agent.nom}</span>
            </div>

            {/* Siège (ville) */}
            {agent.ville && (
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span className="text-sm text-gray-700">{agent.ville}</span>
              </div>
            )}

            {/* Nom agence */}
            {agent.nom_agence && (
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="text-sm text-gray-700">{agent.nom_agence}</span>
              </div>
            )}

            {/* Email */}
            {agent.email && (
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href={`mailto:${agent.email}`} className="text-sm text-gray-700 hover:text-green-600 transition-colors truncate">
                  {agent.email}
                </a>
              </div>
            )}

            {/* Téléphone — pill orange */}
            {agent?.telephone && (
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 7V5z" />
                </svg>
                <a href={`tel:${agent.telephone}`}
                  className="inline-flex items-center px-4 py-2 bg-orange-500 text-white text-sm font-semibold rounded-full hover:bg-orange-600 transition-colors min-h-[36px]">
                  {agent.telephone}
                </a>
              </div>
            )}

            {/* WhatsApp — pill bleu */}
            {whatsappNum && (
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                </svg>
                <a href={`https://wa.me/${whatsappNum.replace(/[\s+\-()]/g, '')}?text=${waText}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#25D366] text-white text-sm font-semibold rounded-full hover:bg-[#1fba59] transition-colors min-h-[36px]">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>
              </div>
            )}
          </div>
        )}

        {/* Demander une visite */}
        <div>
          {!visitSent ? (
            !showVisit ? (
              <button onClick={() => setShowVisit(true)}
                className="flex items-center justify-center gap-2 w-full py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-lg font-semibold text-sm hover:border-green-400 hover:text-green-700 transition-all min-h-[44px]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Demander une visite
              </button>
            ) : (
              <div className="space-y-2">
                <textarea rows={3} placeholder="Précisez vos disponibilités..."
                  value={visitMsg} onChange={e => setVisitMsg(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50" />
                <div className="flex gap-2">
                  <button onClick={() => setShowVisit(false)}
                    className="flex-1 py-2.5 border border-gray-200 text-gray-500 rounded-lg text-sm hover:bg-gray-50 font-medium min-h-[40px]">
                    Annuler
                  </button>
                  <button onClick={sendVisitRequest} disabled={loading}
                    className="flex-1 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-60 flex items-center justify-center gap-1.5 min-h-[40px]">
                    {loading ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                    ) : 'Envoyer'}
                  </button>
                </div>
              </div>
            )
          ) : (
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-100">
              <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
              </svg>
              <p className="text-sm text-green-700 font-medium">Demande envoyée !</p>
            </div>
          )}
        </div>

        {/* Disclaimer — juste après le bouton visite */}
        <div className="flex items-start gap-2.5 pt-3 border-t border-gray-100">
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-xs text-orange-500 font-bold leading-relaxed">
            Cette page est une publicité. Tout contenu, service ou produit affiché est la
            propriété de <span className="font-medium text-gray-500">{annonceurNom}</span> et
            Immo West Afro n'en est pas responsable -{' '}
            <Link href="/cgu" className="text-green-600 hover:underline font-medium">
              Conditions Générales d'Utilisation
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
