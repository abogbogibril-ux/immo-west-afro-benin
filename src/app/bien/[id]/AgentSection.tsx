'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface Agent {
  id: string
  nom: string
  prenom: string
  telephone?: string
  whatsapp?: string
  email?: string
  avatar_url?: string
  role?: string
}

interface Props {
  agent?: Agent
  bienId: string
  bienTitre: string
  userId?: string
}

const SUJETS = [
  "Demande d'informations",
  'Je souhaite visiter ce bien',
  'Négociation du prix',
  'Disponibilité du bien',
  'Autre question',
]

export default function AgentSection({ agent, bienId, bienTitre, userId }: Props) {
  const [form, setForm] = useState({ sujet: SUJETS[0], message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const router = useRouter()

  const waText = encodeURIComponent(
    `Bonjour ${agent?.prenom ?? ''}, je suis intéressé(e) par votre annonce "${bienTitre}" sur Immo West Afro.`
  )
  const whatsappNum = agent?.whatsapp ?? agent?.telephone

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.message.trim()) return
    if (!userId) { router.push(`/connexion?redirect=/bien/${bienId}`); return }
    setStatus('loading')
    try {
      const { error } = await supabase.from('messages').insert({
        expediteur_id: userId,
        destinataire_id: agent?.id,
        bien_id: bienId,
        sujet: form.sujet,
        contenu: form.message,
        lu: false,
      })
      if (error) throw error
      setStatus('success')
      setForm(p => ({ ...p, message: '' }))
    } catch {
      setStatus('error')
    }
  }

  if (!agent) return null

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-5 md:px-7 md:py-6">
      <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2.5">
        <span className="w-1 h-6 bg-green-500 rounded-full"></span>
        Contacter l'agent
      </h2>

      {/* Profil agent */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl mb-5">
        {agent.avatar_url ? (
          <img src={agent.avatar_url} alt={`${agent.prenom} ${agent.nom}`}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white shadow-sm flex-shrink-0" />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-sm flex-shrink-0">
            {(agent.prenom?.[0] ?? '').toUpperCase()}{(agent.nom?.[0] ?? '').toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-base">{agent.prenom} {agent.nom}</h3>
          <p className="text-sm text-gray-400 mb-2">
            {agent.role === 'agent' ? '🏢 Agent immobilier' : '👤 Particulier'}
          </p>
          <div className="flex flex-wrap gap-2">
            {agent.telephone && (
              <a href={`tel:${agent.telephone}`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 7V5z" />
                </svg>
                {agent.telephone}
              </a>
            )}
            {whatsappNum && (
              <a href={`https://wa.me/${whatsappNum.replace(/[\s+\-()]/g, '')}?text=${waText}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] text-white rounded-lg text-xs font-semibold hover:bg-[#1fba59] transition-colors">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Formulaire */}
      {status === 'success' ? (
        <div className="text-center py-8">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <p className="font-bold text-gray-900 mb-1">Message envoyé !</p>
          <p className="text-sm text-gray-500">{agent.prenom} vous répondra prochainement.</p>
          <button onClick={() => setStatus('idle')} className="mt-4 text-sm text-green-600 hover:underline">
            Envoyer un autre message
          </button>
        </div>
      ) : (
        <form onSubmit={send} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Sujet</label>
            <select value={form.sujet} onChange={e => setForm(p => ({ ...p, sujet: e.target.value }))}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-400">
              {SUJETS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Message *</label>
            <textarea rows={4} value={form.message}
              onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
              placeholder={`Bonjour ${agent.prenom}, je suis intéressé(e) par ce bien...`}
              required maxLength={500}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-400 resize-none" />
            <p className="text-right text-xs text-gray-400 mt-1">{form.message.length}/500</p>
          </div>
          {status === 'error' && (
            <p className="text-sm text-red-500 bg-red-50 px-3.5 py-2.5 rounded-xl border border-red-100">
              ⚠️ Une erreur est survenue. Réessayez ou contactez l'agent par téléphone.
            </p>
          )}
          <button type="submit" disabled={status === 'loading' || !form.message.trim()}
            className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-semibold text-sm hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {status === 'loading' ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Envoi en cours...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                </svg>
                Envoyer le message
              </>
            )}
          </button>
          {!userId && (
            <p className="text-center text-xs text-gray-400">
              <a href={`/connexion?redirect=/bien/${bienId}`} className="text-green-600 hover:underline font-medium">
                Se connecter
              </a>
              {' '}pour envoyer un message
            </p>
          )}
        </form>
      )}
    </div>
  )
}