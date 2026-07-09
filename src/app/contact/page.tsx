'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Metadata } from 'next'

const SUJETS = [
  'Demande d\'information générale',
  'Signaler une annonce',
  'Problème technique',
  'Partenariat / Agence',
  'Presse / Médias',
  'Autre',
]

export default function ContactPage() {
  const [form, setForm] = useState({ nom: '', email: '', telephone: '', sujet: SUJETS[0], message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.message.trim() || !form.email.trim()) return
    setStatus('loading')
    try {
      const { error } = await supabase.from('messages').insert({
        expediteur_id: null,
        destinataire_id: null,
        sujet: `[Contact] ${form.sujet} — ${form.nom}`,
        contenu: `Nom: ${form.nom}\nEmail: ${form.email}\nTéléphone: ${form.telephone}\n\n${form.message}`,
        lu: false,
      })
      if (error) throw error
      setStatus('success')
      setForm({ nom: '', email: '', telephone: '', sujet: SUJETS[0], message: '' })
    } catch {
      setStatus('error')
    }
  }

  const waText = encodeURIComponent('Bonjour Immo West Afro, je souhaite vous contacter concernant...')

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <section className="bg-gradient-to-br from-green-700 to-emerald-800 py-14 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Contactez-nous</h1>
          <p className="text-green-100 text-sm md:text-base max-w-xl mx-auto">
            Une question, un problème ou une suggestion ? Notre équipe est disponible pour vous aider.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Infos contact */}
          <div className="space-y-5">

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-900 mb-4">Nos coordonnées</h2>
              <div className="space-y-4">
                {[
                  {
                    icon: '📍',
                    label: 'Adresse',
                    value: 'Abomey-Calavi, Togba',
                    sub: 'Quartier SOME',
                  },
                  {
                    icon: '📞',
                    label: 'Téléphone',
                    value: '+229 01 96 13 77 20',
                    href: 'tel:+22901961377',
                  },
                  {
                    icon: '✉️',
                    label: 'Email',
                    value: 'calavi_immo@immowestafro.com',
                    href: 'mailto:calavi_immo@immowestafro.com',
                  },
                  {
                    icon: '🕐',
                    label: 'Horaires',
                    value: 'Lun–Sam : 8h–18h',
                    sub: 'Dim : 9h–13h',
                  },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0 mt-0.5">{item.icon}</span>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{item.label}</p>
                      {item.href ? (
                        <a href={item.href} className="text-sm font-medium text-green-600 hover:underline">
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-sm font-medium text-gray-800">{item.value}</p>
                      )}
                      {item.sub && <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* WhatsApp */}
            <a href={`https://wa.me/22901961377?text=${waText}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 bg-[#25D366] text-white rounded-2xl p-5 hover:bg-[#1fba59] transition-colors">
              <svg className="w-8 h-8 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.345.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.15-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
              <div>
                <p className="font-bold text-sm">Écrire sur WhatsApp</p>
                <p className="text-green-100 text-xs mt-0.5">Réponse rapide garantie</p>
              </div>
            </a>

            {/* Réseaux sociaux */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Suivez-nous</h3>
              <div className="flex gap-3">
                {[
                  { label: 'Facebook', color: 'bg-blue-600', icon: 'f' },
                  { label: 'Instagram', color: 'bg-pink-600', icon: '📷' },
                  { label: 'LinkedIn', color: 'bg-blue-700', icon: 'in' },
                ].map(r => (
                  <div key={r.label}
                    className={`w-10 h-10 ${r.color} rounded-xl flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:opacity-80 transition-opacity`}>
                    {r.icon}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
              <h2 className="font-bold text-gray-900 text-xl mb-6">Envoyer un message</h2>

              {status === 'success' ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">Message envoyé !</h3>
                  <p className="text-gray-500 text-sm mb-6">
                    Notre équipe vous répondra dans les plus brefs délais.
                  </p>
                  <button onClick={() => setStatus('idle')}
                    className="px-6 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors">
                    Envoyer un autre message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                        Nom complet *
                      </label>
                      <input name="nom" type="text" required placeholder="Votre nom"
                        value={form.nom} onChange={handleChange}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400/30 bg-gray-50"/>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                        Email *
                      </label>
                      <input name="email" type="email" required placeholder="votre@email.com"
                        value={form.email} onChange={handleChange}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400/30 bg-gray-50"/>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                        Téléphone
                      </label>
                      <input name="telephone" type="tel" placeholder="+229 XX XX XX XX XX"
                        value={form.telephone} onChange={handleChange}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400/30 bg-gray-50"/>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                        Sujet *
                      </label>
                      <select name="sujet" value={form.sujet} onChange={handleChange}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400/30 bg-gray-50">
                        {SUJETS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                      Message *
                    </label>
                    <textarea name="message" rows={5} required
                      placeholder="Décrivez votre demande en détail..."
                      value={form.message} onChange={handleChange} maxLength={1000}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400/30 bg-gray-50 resize-none"/>
                    <p className="text-right text-xs text-gray-400 mt-1">{form.message.length}/1000</p>
                  </div>

                  {status === 'error' && (
                    <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl border border-red-100">
                      ⚠️ Une erreur est survenue. Contactez-nous directement sur WhatsApp.
                    </p>
                  )}

                  <button type="submit" disabled={status === 'loading'}
                    className="w-full py-3.5 bg-green-600 text-white font-bold text-sm rounded-xl hover:bg-green-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                        </svg>
                        Envoyer le message
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs text-gray-400">
                    Ou contactez-nous directement sur{' '}
                    <a href={`https://wa.me/22901961377?text=${waText}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-green-600 font-semibold hover:underline">
                      WhatsApp
                    </a>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}