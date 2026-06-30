'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const MOTIFS = [
  'Annonce frauduleuse',
  'Bien déjà vendu/loué',
  'Prix incorrect',
  'Photos non conformes',
  'Coordonnées invalides',
  'Contenu inapproprié',
  'Autre',
]

export default function ReportButton({ bienId, floating = false }: { bienId: string; floating?: boolean }) {
  const [open, setOpen] = useState(false)
  const [motif, setMotif] = useState('')
  const [description, setDescription] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [erreur, setErreur] = useState('')

  const reset = () => {
    setMotif('')
    setDescription('')
    setEmail('')
    setSuccess(false)
    setErreur('')
  }

  const close = () => {
    setOpen(false)
    setTimeout(reset, 300)
  }

  const handleSubmit = async () => {
    if (!motif) {
      setErreur('Veuillez sélectionner un motif.')
      return
    }
    setLoading(true)
    setErreur('')

    const { error } = await supabase.from('signalements').insert({
      bien_id: bienId,
      motif,
      description: description || null,
      email_signaleur: email || null,
    })

    setLoading(false)
    if (error) {
      setErreur('Une erreur est survenue. Veuillez réessayer.')
      return
    }
    setSuccess(true)
  }

  return (
    <>
      {floating ? (
        <button
          onClick={(e) => { e.stopPropagation(); setOpen(true) }}
          className="absolute bottom-3 right-3 w-9 h-9 bg-black/55 hover:bg-red-500/90 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all z-10"
          aria-label="Signaler cette annonce"
          title="Signaler cette annonce"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 3v18h2v-7h4.5l.5 1h7V5h-7l-.5-1H5V3H3z"/>
          </svg>
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 text-gray-400 hover:text-red-500 text-xs font-medium transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 3v18h2v-7h4.5l.5 1h7V5h-7l-.5-1H5V3H3z"/>
          </svg>
          Signaler cette annonce
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
          onClick={close}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            {success ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Signalement envoyé</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Notre équipe va examiner cette annonce sous peu.
                </p>
                <button
                  onClick={close}
                  className="px-5 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors text-sm"
                >
                  Fermer
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Signaler cette annonce</h3>
                  <button onClick={close} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
                      Motif *
                    </label>
                    <select
                      value={motif}
                      onChange={e => { setMotif(e.target.value); setErreur('') }}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400/30 bg-gray-50"
                    >
                      <option value="">Sélectionner un motif...</option>
                      {MOTIFS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
                      Détails (optionnel)
                    </label>
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Expliquez le problème..."
                      rows={3}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400/30 bg-gray-50 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
                      Votre email (optionnel)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="pour vous tenir informé"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-400/30 bg-gray-50"
                    />
                  </div>

                  {erreur && (
                    <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-red-600 text-xs">
                      {erreur}
                    </div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full py-3 bg-red-500 text-white font-bold text-sm rounded-xl hover:bg-red-600 disabled:opacity-60 transition-colors"
                  >
                    {loading ? 'Envoi en cours...' : 'Envoyer le signalement'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}