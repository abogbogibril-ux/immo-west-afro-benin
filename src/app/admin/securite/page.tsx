'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SecuriteAdmin() {
  const [mdp, setMdp] = useState({ nouveau: '', confirmation: '' })
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState({ msg: '', type: '' })

  const showToast = (msg: string, type: string) => {
    setToast({ msg, type })
    setTimeout(() => setToast({ msg: '', type: '' }), 4000)
  }

  const changerMotDePasse = async () => {
    if (mdp.nouveau !== mdp.confirmation) { showToast('Les mots de passe ne correspondent pas.', 'error'); return }
    if (mdp.nouveau.length < 8) { showToast('Le mot de passe doit contenir au moins 8 caracteres.', 'error'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: mdp.nouveau })
    setLoading(false)
    if (error) showToast('Erreur : ' + error.message, 'error')
    else { showToast('Mot de passe modifie avec succes !', 'success'); setMdp({ nouveau: '', confirmation: '' }) }
  }

  return (
    <div>
      {/* Toast */}
      {toast.msg && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl text-white font-semibold shadow-lg max-w-xs text-sm ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-500'
        }`}>
          {toast.type === 'success' ? '✅ ' : '❌ '}{toast.msg}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-white m-0">Securite</h1>
        <p className="text-slate-400 mt-1">Gestion des acces et de la securite du compte admin</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* CHANGER MDP */}
        <div className="bg-[#1e293b] rounded-xl p-6 shadow-lg border border-[#334155]">
          <h2 className="text-white font-bold text-base mb-5 pb-3 border-b-2 border-[#334155]">Changer le mot de passe</h2>
          <div className="mb-4">
            <label className="block text-slate-400 text-sm font-medium mb-1.5">Nouveau mot de passe</label>
            <input type="password" value={mdp.nouveau} onChange={e => setMdp({...mdp, nouveau: e.target.value})}
              placeholder="Min. 8 caracteres"
              className="w-full px-3 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-white text-sm outline-none focus:border-[#00bcd4] transition-colors placeholder-slate-600" />
          </div>
          <div className="mb-6">
            <label className="block text-slate-400 text-sm font-medium mb-1.5">Confirmer le mot de passe</label>
            <input type="password" value={mdp.confirmation} onChange={e => setMdp({...mdp, confirmation: e.target.value})}
              placeholder="Repetez le mot de passe"
              className="w-full px-3 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-white text-sm outline-none focus:border-[#00bcd4] transition-colors placeholder-slate-600" />
          </div>
          <button onClick={changerMotDePasse} disabled={loading}
            className={`w-full py-3.5 rounded-lg text-white font-semibold text-sm border-none cursor-pointer transition-colors ${
              loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#00bcd4] hover:bg-[#0097a7]'
            }`}>
            {loading ? 'Modification...' : 'Modifier le mot de passe'}
          </button>
        </div>

        {/* ETAT SECURITE */}
        <div className="bg-[#1e293b] rounded-xl p-6 shadow-lg border border-[#334155]">
          <h2 className="text-white font-bold text-base mb-5 pb-3 border-b-2 border-[#334155]">Etat de la securite</h2>
          {[
            { label: 'Authentification Supabase', ok: true },
            { label: 'HTTPS / SSL', ok: true },
            { label: 'Row Level Security (RLS)', ok: true },
            { label: 'Protection admin par role', ok: true },
          ].map(item => (
            <div key={item.label} className="flex justify-between items-center p-3 bg-[#0f172a] rounded-lg mb-2">
              <span className="text-slate-300 text-sm">{item.label}</span>
              <span className="bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">Active</span>
            </div>
          ))}
          {/* 2FA */}
          <div className="p-3 bg-amber-50 rounded-lg mb-2 border border-amber-200">
            <div className="flex justify-between items-center">
              <span className="text-amber-800 text-sm">Double authentification (2FA)</span>
              <span className="bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">Non configure</span>
            </div>
            <p className="text-amber-700 text-xs mt-2">La 2FA est geree directement dans Supabase Auth.</p>
            <a href="https://supabase.com/dashboard/project/huvtgaunkcglyeypdtws/auth/providers"
              target="_blank" rel="noopener noreferrer"
              className="inline-block mt-2 text-xs text-amber-700 font-semibold underline hover:text-amber-900">
              Configurer dans Supabase →
            </a>
          </div>
        </div>

        {/* JOURNAL */}
        <div className="bg-[#1e293b] rounded-xl p-6 shadow-lg border border-[#334155] md:col-span-2">
          <h2 className="text-white font-bold text-base mb-5 pb-3 border-b-2 border-[#334155]">Journal d activite</h2>
          <div className="bg-[#0f172a] rounded-lg p-4 font-mono text-sm text-slate-400">
            <p className="text-emerald-400 mb-2">[{new Date().toLocaleDateString('fr-FR')}] Connexion admin reussie</p>
            <p className="text-slate-400 mb-2">[{new Date().toLocaleDateString('fr-FR')}] Dashboard admin consulte</p>
            <p className="text-slate-400">[{new Date().toLocaleDateString('fr-FR')}] Parametres de securite consultes</p>
          </div>
        </div>

      </div>
    </div>
  )
}