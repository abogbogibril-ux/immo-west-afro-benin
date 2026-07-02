'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const TABS = ['Profil', 'Notifications', 'Sécurité']

export default function ParametresPage() {
  const [tab, setTab] = useState('Profil')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const router = useRouter()
  const [form, setForm] = useState({
    prenom: '', nom: '', email: '', telephone: '',
    whatsapp: '', nom_agence: '', biographie: '',
    ville: '', avatar_url: '',
  })
  const [notifForm, setNotifForm] = useState({
    email_messages: true,
    email_vues: true,
    email_hebdo: true,
    newsletter: true,
    silencieux: false,
  })

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/connexion'); return }
      const { data } = await supabase
        .from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setForm({
          prenom: data.prenom ?? '',
          nom: data.nom ?? '',
          email: user.email ?? '',
          telephone: data.telephone ?? '',
          whatsapp: data.whatsapp ?? '',
          nom_agence: data.nom_agence ?? '',
          biographie: data.biographie ?? '',
          ville: data.ville ?? '',
          avatar_url: data.avatar_url ?? '',
        })
      }
      setLoading(false)
    }
    load()
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const saveProfil = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('profiles').update({
      prenom: form.prenom,
      nom: form.nom,
      telephone: form.telephone,
      whatsapp: form.whatsapp,
      nom_agence: form.nom_agence,
      biographie: form.biographie,
      ville: form.ville,
    }).eq('id', user.id)
    setSaving(false)
    if (!error) showToast('Profil mis à jour avec succès')
    else showToast('Erreur lors de la sauvegarde')
  }

  const changePassword = async () => {
    const email = form.email
    if (!email) return
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (!error) showToast('Email de réinitialisation envoyé !')
    else showToast('Erreur : ' + error.message)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-[#00bcd4] border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl bg-[#0f172a] min-h-screen">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 ${
          toast.includes('Erreur') ? 'bg-red-600' : 'bg-gray-900'
        }`}>
          <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
          </svg>
          {toast}
        </div>
      )}

      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Paramètres</h1>
        <p className="text-sm text-slate-400 mt-0.5">Gérez votre profil et vos préférences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              tab === t ? 'bg-[#0f172a] text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {/* ── Onglet Profil ── */}
      {tab === 'Profil' && (
        <div className="space-y-5">

          {/* Avatar */}
          <div className="bg-[#1e293b] rounded-2xl border border-[#334155] shadow-sm p-5">
            <h2 className="font-semibold text-white mb-4">Photo de profil</h2>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-[#00bcd4]/15 text-[#00bcd4] flex items-center justify-center text-2xl font-bold flex-shrink-0">
                {(form.prenom?.[0] ?? '').toUpperCase()}{(form.nom?.[0] ?? '').toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{form.prenom} {form.nom}</p>
                <p className="text-xs text-slate-400 mt-0.5">Agent immobilier</p>
                <p className="text-xs text-slate-400 mt-2">
                  La photo de profil sera disponible prochainement.
                </p>
              </div>
            </div>
          </div>

          {/* Infos personnelles */}
          <div className="bg-[#1e293b] rounded-2xl border border-[#334155] shadow-sm p-5">
            <h2 className="font-semibold text-white mb-4">Informations personnelles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Prénom', name: 'prenom', type: 'text', placeholder: 'Votre prénom' },
                { label: 'Nom', name: 'nom', type: 'text', placeholder: 'Votre nom' },
                { label: 'Email', name: 'email', type: 'email', placeholder: 'email@exemple.com', disabled: true },
                { label: 'Téléphone', name: 'telephone', type: 'tel', placeholder: '+229 XX XX XX XX XX' },
                { label: 'WhatsApp', name: 'whatsapp', type: 'tel', placeholder: '+229 XX XX XX XX XX' },
                { label: 'Ville', name: 'ville', type: 'text', placeholder: 'Cotonou' },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    {f.label}
                  </label>
                  <input
                    name={f.name} type={f.type} placeholder={f.placeholder}
                    value={form[f.name as keyof typeof form]}
                    onChange={handleChange}
                    disabled={f.disabled}
                    className="w-full px-3.5 py-2.5 border border-[#334155] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00bcd4]/30 bg-[#0f172a] text-white disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Infos agence */}
          <div className="bg-[#1e293b] rounded-2xl border border-[#334155] shadow-sm p-5">
            <h2 className="font-semibold text-white mb-4">Informations agence</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Nom de l'agence
                </label>
                <input name="nom_agence" type="text" placeholder="Nom de votre agence"
                  value={form.nom_agence} onChange={handleChange}
                  className="w-full px-3.5 py-2.5 border border-[#334155] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00bcd4]/30 bg-[#0f172a] text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Biographie
                </label>
                <textarea name="biographie" rows={4} placeholder="Décrivez votre expérience et vos spécialités..."
                  value={form.biographie} onChange={handleChange}
                  className="w-full px-3.5 py-2.5 border border-[#334155] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00bcd4]/30 bg-[#0f172a] text-white resize-none"
                />
                <p className="text-right text-xs text-gray-400 mt-1">{form.biographie.length}/500</p>
              </div>
            </div>
          </div>

          {/* Bouton sauvegarder */}
          <button onClick={saveProfil} disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-[#00bcd4] text-white font-semibold text-sm rounded-xl hover:bg-[#0097a7] transition-colors disabled:opacity-60">
            {saving ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
              </svg>
            )}
            {saving ? 'Sauvegarde...' : 'Sauvegarder le profil'}
          </button>
        </div>
      )}

      {/* ── Onglet Notifications ── */}
      {tab === 'Notifications' && (
        <div className="space-y-5">
          <div className="bg-[#1e293b] rounded-2xl border border-[#334155] shadow-sm p-5">
            <h2 className="font-semibold text-white mb-5">Préférences de notifications</h2>
            <div className="space-y-4">
              {[
                { key: 'email_messages', label: 'Nouveaux messages clients', sub: 'Recevoir un email pour chaque nouveau message' },
                { key: 'email_vues', label: 'Alertes statistiques', sub: 'Alerte si 0 vue dans 7 jours sur une annonce' },
                { key: 'email_hebdo', label: 'Résumé hebdomadaire', sub: 'Rapport de performance chaque dimanche à 9h' },
                { key: 'newsletter', label: 'Newsletter Immo West Afro', sub: 'Actualités immobilières et conseils' },
                { key: 'silencieux', label: 'Mode silencieux (20h–7h)', sub: 'Aucune notification pendant ces heures' },
              ].map(item => (
                <div key={item.key} className="flex items-start justify-between gap-4 py-3 border-b border-[#334155] last:border-0">
                  <div>
                    <p className="text-sm font-medium text-white">{item.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{item.sub}</p>
                  </div>
                  <button
                    onClick={() => setNotifForm(p => ({ ...p, [item.key]: !p[item.key as keyof typeof p] }))}
                    className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                      notifForm[item.key as keyof typeof notifForm] ? 'bg-[#00bcd4]' : 'bg-[#334155]'
                    }`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                      notifForm[item.key as keyof typeof notifForm] ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={() => showToast('Préférences sauvegardées')}
              className="mt-5 px-6 py-2.5 bg-[#00bcd4] text-white text-sm font-semibold rounded-xl hover:bg-[#0097a7] transition-colors">
              Enregistrer
            </button>
          </div>
        </div>
      )}

      {/* ── Onglet Sécurité ── */}
      {tab === 'Sécurité' && (
        <div className="space-y-5">

          {/* Mot de passe */}
          <div className="bg-[#1e293b] rounded-2xl border border-[#334155] shadow-sm p-5">
            <h2 className="font-semibold text-white mb-2">Mot de passe</h2>
            <p className="text-sm text-slate-400 mb-4">
              Un email de réinitialisation sera envoyé à <strong>{form.email}</strong>
            </p>
            <button onClick={changePassword}
              className="flex items-center gap-2 px-4 py-2.5 border border-[#334155] text-gray-700 text-sm font-semibold rounded-xl hover:border-[#00bcd4] hover:text-[#00bcd4] transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
              </svg>
              Changer le mot de passe
            </button>
          </div>

          {/* Sessions */}
          <div className="bg-[#1e293b] rounded-2xl border border-[#334155] shadow-sm p-5">
            <h2 className="font-semibold text-white mb-4">Session active</h2>
            <div className="flex items-center justify-between p-3.5 bg-green-900/20 border border-green-900/30 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <div>
                  <p className="text-sm font-medium text-white">Session en cours</p>
                  <p className="text-xs text-slate-400">Cotonou, Bénin · Navigateur web</p>
                </div>
              </div>
              <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-0.5 rounded-full">Active</span>
            </div>
          </div>

          {/* Zone danger */}
          <div className="bg-[#1e293b] rounded-2xl border border-red-900/30 shadow-sm p-5">
            <h2 className="font-semibold text-red-600 mb-2">Zone de danger</h2>
            <p className="text-sm text-slate-400 mb-4">
              La suppression de votre compte est irréversible. Toutes vos annonces seront supprimées.
            </p>
            <button
              onClick={() => confirm('Êtes-vous sûr ? Cette action est irréversible.') && showToast('Contactez le support pour supprimer votre compte.')}
              className="px-4 py-2.5 border border-red-200 text-red-500 text-sm font-semibold rounded-xl hover:bg-red-50 transition-colors">
              Supprimer mon compte
            </button>
          </div>
        </div>
      )}
    </div>
  )
}