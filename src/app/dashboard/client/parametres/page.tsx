'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const TABS = ['Mon profil', 'Mes recherches', 'Notifications', 'Sécurité']

const VILLES = ['Cotonou', 'Abomey-Calavi', 'Porto-Novo', 'Parakou', 'Bohicon', 'Ouidah']
const TYPES = ['Appartement', 'Maison', 'Villa', 'Terrain', 'Bureau', 'Studio']

interface Alerte {
  id: string
  type: string
  ville: string
  budget_min: number
  budget_max: number
  frequence: 'immediate' | 'quotidienne' | 'hebdo'
  active: boolean
}

export default function ClientParametresPage() {
  const [tab, setTab] = useState('Mon profil')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const router = useRouter()

  const [form, setForm] = useState({
    prenom: '', nom: '', email: '', telephone: '',
    whatsapp: '', ville: '', type_projet: 'location',
    budget_min: '', budget_max: '',
  })

  const [notifForm, setNotifForm] = useState({
    email_messages: true,
    email_visites: true,
    email_prix: true,
    newsletter: false,
    silencieux: false,
  })

  const [alertes, setAlertes] = useState<Alerte[]>([
    {
      id: 'a1', type: 'Appartement', ville: 'Cotonou',
      budget_min: 20000000, budget_max: 50000000,
      frequence: 'immediate', active: true,
    },
    {
      id: 'a2', type: 'Villa', ville: 'Abomey-Calavi',
      budget_min: 50000000, budget_max: 100000000,
      frequence: 'quotidienne', active: true,
    },
  ])

  const [newAlerte, setNewAlerte] = useState({
    type: 'Appartement', ville: 'Cotonou',
    budget_min: '', budget_max: '', frequence: 'immediate' as const,
  })

  const [showAlerteForm, setShowAlerteForm] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/connexion'); return }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setForm({
          prenom: data.prenom ?? '',
          nom: data.nom ?? '',
          email: user.email ?? '',
          telephone: data.telephone ?? '',
          whatsapp: data.whatsapp ?? '',
          ville: data.ville ?? '',
          type_projet: data.type_projet ?? 'location',
          budget_min: data.budget_min ?? '',
          budget_max: data.budget_max ?? '',
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
      prenom: form.prenom, nom: form.nom,
      telephone: form.telephone, whatsapp: form.whatsapp,
      ville: form.ville, type_projet: form.type_projet,
    }).eq('id', user.id)
    setSaving(false)
    showToast(error ? 'Erreur lors de la sauvegarde' : 'Profil mis à jour ✅')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  }

  const addAlerte = () => {
    if (!newAlerte.budget_max) return
    setAlertes(prev => [...prev, {
      id: Date.now().toString(),
      type: newAlerte.type,
      ville: newAlerte.ville,
      budget_min: parseInt(newAlerte.budget_min) || 0,
      budget_max: parseInt(newAlerte.budget_max),
      frequence: newAlerte.frequence,
      active: true,
    }])
    setShowAlerteForm(false)
    showToast('Alerte créée ✅')
  }

  const toggleAlerte = (id: string) => {
    setAlertes(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a))
  }

  const deleteAlerte = (id: string) => {
    setAlertes(prev => prev.filter(a => a.id !== id))
    showToast('Alerte supprimée')
  }

  const changePassword = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    showToast(error ? 'Erreur : ' + error.message : 'Email de réinitialisation envoyé !')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full"/>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg ${
          toast.includes('Erreur') ? 'bg-red-600' : 'bg-gray-900'
        }`}>
          {toast}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Paramètres</h1>
        <p className="text-sm text-gray-400 mt-0.5">Gérez votre profil et vos préférences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 flex-wrap">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm font-semibold rounded-lg transition-all ${
              tab === t ? 'bg-[#0f172a] text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {/* ── Mon profil ── */}
      {tab === 'Mon profil' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Informations personnelles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Prénom', name: 'prenom', type: 'text', placeholder: 'Votre prénom' },
                { label: 'Nom', name: 'nom', type: 'text', placeholder: 'Votre nom' },
                { label: 'Email', name: 'email', type: 'email', placeholder: '', disabled: true },
                { label: 'Téléphone', name: 'telephone', type: 'tel', placeholder: '+229 XX XX XX XX XX' },
                { label: 'WhatsApp', name: 'whatsapp', type: 'tel', placeholder: '+229 XX XX XX XX XX' },
                { label: 'Ville', name: 'ville', type: 'text', placeholder: 'Cotonou' },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    {f.label}
                  </label>
                  <input name={f.name} type={f.type} placeholder={f.placeholder}
                    value={form[f.name as keyof typeof form] as string}
                    onChange={handleChange} disabled={f.disabled}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400/30 bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Mon projet immobilier</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Type de projet
                </label>
                <div className="flex gap-2">
                  {['achat', 'location'].map(t => (
                    <button key={t} onClick={() => setForm(p => ({ ...p, type_projet: t }))}
                      className={`flex-1 py-2.5 text-sm font-semibold rounded-xl border-2 transition-all capitalize ${
                        form.type_projet === t
                          ? 'bg-green-600 border-green-600 text-white'
                          : 'border-gray-200 text-gray-500 hover:border-green-300'
                      }`}>
                      {t === 'achat' ? '🏠 Achat' : '🔑 Location'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Budget (FCFA)
                </label>
                <div className="flex gap-2 items-center">
                  <input name="budget_min" type="number" placeholder="Min"
                    value={form.budget_min} onChange={handleChange}
                    className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400/30 bg-gray-50"
                  />
                  <span className="text-gray-400 text-sm">—</span>
                  <input name="budget_max" type="number" placeholder="Max"
                    value={form.budget_max} onChange={handleChange}
                    className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400/30 bg-gray-50"
                  />
                </div>
              </div>
            </div>
          </div>

          <button onClick={saveProfil} disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold text-sm rounded-xl hover:bg-green-700 transition-colors disabled:opacity-60">
            {saving ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            ) : '✅'}
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      )}

      {/* ── Mes recherches ── */}
      {tab === 'Mes recherches' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-white">Mes alertes de recherche</h2>
              <button onClick={() => setShowAlerteForm(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                </svg>
                Nouvelle alerte
              </button>
            </div>

            {showAlerteForm && (
              <div className="mb-5 p-4 bg-green-50 border border-green-100 rounded-xl space-y-3">
                <p className="text-sm font-semibold text-green-800">Nouvelle alerte de recherche</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Type de bien</label>
                    <select value={newAlerte.type} onChange={e => setNewAlerte(p => ({ ...p, type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none">
                      {TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Ville</label>
                    <select value={newAlerte.ville} onChange={e => setNewAlerte(p => ({ ...p, ville: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none">
                      {VILLES.map(v => <option key={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Budget max (FCFA)</label>
                    <input type="number" placeholder="Ex: 50000000"
                      value={newAlerte.budget_max}
                      onChange={e => setNewAlerte(p => ({ ...p, budget_max: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Fréquence</label>
                    <select value={newAlerte.frequence}
                      onChange={e => setNewAlerte(p => ({ ...p, frequence: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none">
                      <option value="immediate">Immédiate</option>
                      <option value="quotidienne">Quotidienne</option>
                      <option value="hebdo">Hebdomadaire</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowAlerteForm(false)}
                    className="flex-1 py-2 border border-gray-200 text-gray-500 text-sm rounded-lg hover:bg-[#0f172a]">
                    Annuler
                  </button>
                  <button onClick={addAlerte}
                    className="flex-1 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-[#0097a7]">
                    Créer l'alerte
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {alertes.map(a => (
                <div key={a.id} className={`p-4 rounded-xl border transition-all ${a.active ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        🔍 {a.type} · {a.ville}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Budget : {new Intl.NumberFormat('fr-FR').format(a.budget_min || 0)} — {new Intl.NumberFormat('fr-FR').format(a.budget_max)} FCFA
                      </p>
                      <p className="text-xs text-slate-400">
                        📧 Alerte : {a.frequence === 'immediate' ? 'Immédiate' : a.frequence === 'quotidienne' ? 'Quotidienne' : 'Hebdomadaire'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleAlerte(a.id)}
                        className={`relative w-10 h-5 rounded-full transition-colors ${a.active ? 'bg-green-600' : 'bg-gray-200'}`}>
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${a.active ? 'translate-x-5' : 'translate-x-0.5'}`}/>
                      </button>
                      <button onClick={() => deleteAlerte(a.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {alertes.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-2xl mb-2">🔔</p>
                  <p className="text-sm">Aucune alerte de recherche</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Notifications ── */}
      {tab === 'Notifications' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-5">Préférences de notifications</h2>
          <div className="space-y-4">
            {[
              { key: 'email_messages', label: 'Nouveaux messages des agents', sub: 'Recevoir un email à chaque nouveau message' },
              { key: 'email_visites', label: 'Rappels de visites', sub: 'Rappel 24h avant chaque visite prévue' },
              { key: 'email_prix', label: 'Baisses de prix', sub: 'Alertes quand un favori baisse de prix' },
              { key: 'newsletter', label: 'Newsletter Immo West Afro', sub: 'Actualités et nouvelles annonces' },
              { key: 'silencieux', label: 'Mode silencieux (20h–7h)', sub: 'Aucune notification la nuit' },
            ].map(item => (
              <div key={item.key} className="flex items-start justify-between gap-4 py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-100">{item.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
                </div>
                <button
                  onClick={() => setNotifForm(p => ({ ...p, [item.key]: !p[item.key as keyof typeof p] }))}
                  className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                    notifForm[item.key as keyof typeof notifForm] ? 'bg-green-600' : 'bg-gray-200'
                  }`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                    notifForm[item.key as keyof typeof notifForm] ? 'translate-x-5' : 'translate-x-0.5'
                  }`}/>
                </button>
              </div>
            ))}
          </div>
          <button onClick={() => showToast('Préférences sauvegardées ✅')}
            className="mt-5 px-6 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors">
            Enregistrer
          </button>
        </div>
      )}

      {/* ── Sécurité ── */}
      {tab === 'Sécurité' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-2">Mot de passe</h2>
            <p className="text-sm text-gray-400 mb-4">
              Un email sera envoyé à <strong>{form.email}</strong>
            </p>
            <button onClick={changePassword}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:border-green-300 hover:text-green-600 transition-all">
              🔑 Changer le mot de passe
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Session active</h2>
            <div className="flex items-center gap-3 p-3.5 bg-green-50 border border-green-100 rounded-xl">
              <div className="w-2 h-2 bg-green-500 rounded-full"/>
              <div>
                <p className="text-sm font-medium text-slate-100">Session en cours</p>
                <p className="text-xs text-slate-400">Navigateur web · Bénin</p>
              </div>
              <span className="ml-auto text-xs text-green-600 font-medium bg-green-100 px-2 py-0.5 rounded-full">Active</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-5">
            <h2 className="font-semibold text-red-600 mb-2">Zone de danger</h2>
            <p className="text-sm text-gray-400 mb-4">La suppression est irréversible.</p>
            <button
              onClick={() => confirm('Êtes-vous sûr ?') && showToast('Contactez le support pour supprimer votre compte.')}
              className="px-4 py-2.5 border border-red-200 text-red-500 text-sm font-semibold rounded-xl hover:bg-red-50 transition-colors">
              Supprimer mon compte
            </button>
          </div>
        </div>
      )}
    </div>
  )
}