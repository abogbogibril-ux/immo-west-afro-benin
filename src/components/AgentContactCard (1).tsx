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
      <div className="flex-1 flex flex-col justify-between px-5 py-5 gap-4">

        {/* Agent — nom, agence, siège */}
        {agent && (
          <div className="space-y-1.5">
            <p className="font-bold text-gray-900 text-base md:text-lg leading-snug">
              {agent.prenom} {agent.nom}
            </p>
            {agent.nom_agence && (
              <p className="text-sm text-gray-600 leading-snug">{agent.nom_agence}</p>
            )}
            {agent.ville && (
              <p className="text-sm text-gray-400 leading-snug flex items-center gap-1.5">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                </svg>
                {agent.ville}
              </p>
            )}
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col gap-2.5">

          {/* WhatsApp + Téléphone — même ligne */}
          <div className="grid grid-cols-2 gap-2.5">
            {whatsappNum && (
              <a href={`https://wa.me/${whatsappNum.replace(/[\s+\-()]/g, '')}?text=${waText}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-3 bg-[#25D366] text-white rounded-lg font-semibold text-sm hover:bg-[#1fba59] transition-colors shadow-sm min-h-[44px]">
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
            )}

            {agent?.telephone && (
              <a href={`tel:${agent.telephone}`}
                className="flex items-center justify-center gap-1.5 py-3 bg-green-600 text-white rounded-lg font-semibold text-sm hover:bg-green-700 transition-colors shadow-sm min-h-[44px]">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 7V5z" />
                </svg>
                Appeler
              </a>
            )}
          </div>

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

        {/* Disclaimer */}
        <p className="text-xs text-gray-400 leading-relaxed pt-3 border-t border-gray-100">
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
