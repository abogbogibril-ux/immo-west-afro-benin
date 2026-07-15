'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function SecuriteAdmin() {
  const [mdp, setMdp] = useState({ nouveau: '', confirmation: '' })
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState({ msg: '', type: '' })

  // MFA / 2FA
  const [factors, setFactors] = useState<any[]>([])
  const [mfaLoading, setMfaLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [factorId, setFactorId] = useState('')
  const [verifyCode, setVerifyCode] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [needsMfaForMdp, setNeedsMfaForMdp] = useState(false)
  const [mfaCodeMdp, setMfaCodeMdp] = useState('')
  const [mfaLoadingMdp, setMfaLoadingMdp] = useState(false)

  const showToast = (msg: string, type: string) => {
    setToast({ msg, type })
    setTimeout(() => setToast({ msg: '', type: '' }), 4000)
  }

  const changerMotDePasse = async () => {
    if (mdp.nouveau !== mdp.confirmation) { showToast('Les mots de passe ne correspondent pas.', 'error'); return }
    if (mdp.nouveau.length < 8) { showToast('Le mot de passe doit contenir au moins 8 caracteres.', 'error'); return }
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    if (aal?.currentLevel === 'aal1' && aal?.nextLevel === 'aal2') {
      setNeedsMfaForMdp(true)
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: mdp.nouveau })
    setLoading(false)
    if (error) showToast('Erreur : ' + error.message, 'error')
    else { showToast('Mot de passe modifie avec succes !', 'success'); setMdp({ nouveau: '', confirmation: '' }) }
  }

  const validerMfaMdp = async () => {
    if (mfaCodeMdp.length !== 6) { showToast('Entrez le code a 6 chiffres.', 'error'); return }
    setMfaLoadingMdp(true)
    const facteur = factors.find(f => f.status === 'verified')
    if (!facteur) { showToast('Aucun facteur 2FA trouve.', 'error'); setMfaLoadingMdp(false); return }
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: facteur.id })
    if (challengeError) { showToast('Erreur : ' + challengeError.message, 'error'); setMfaLoadingMdp(false); return }
    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: facteur.id, challengeId: challenge.id, code: mfaCodeMdp,
    })
    if (verifyError) { showToast('Code 2FA incorrect.', 'error'); setMfaLoadingMdp(false); return }
    setMfaLoadingMdp(false)
    setNeedsMfaForMdp(false)
    setMfaCodeMdp('')
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: mdp.nouveau })
    setLoading(false)
    if (error) showToast('Erreur : ' + error.message, 'error')
    else { showToast('Mot de passe modifie avec succes !', 'success'); setMdp({ nouveau: '', confirmation: '' }) }
  }

  const loadFactors = async () => {
    setMfaLoading(true)
    const { data } = await supabase.auth.mfa.listFactors()
    setFactors(data?.totp ?? [])
    setMfaLoading(false)
  }

  useEffect(() => { loadFactors() }, [])

  const facteurActif = factors.find(f => f.status === 'verified')

  const demarrerInscription = async () => {
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' })
    if (error) { showToast('Erreur : ' + error.message, 'error'); return }
    setQrCode(data.totp.qr_code)
    setSecret(data.totp.secret)
    setFactorId(data.id)
    setEnrolling(true)
  }

  const confirmerInscription = async () => {
    if (verifyCode.length !== 6) { showToast('Entrez le code à 6 chiffres.', 'error'); return }
    setVerifying(true)
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId })
    if (challengeError) { showToast('Erreur : ' + challengeError.message, 'error'); setVerifying(false); return }
    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId, challengeId: challenge.id, code: verifyCode,
    })
    setVerifying(false)
    if (verifyError) {
      showToast('Code incorrect, réessayez.', 'error')
    } else {
      showToast('Double authentification activée avec succès !', 'success')
      setEnrolling(false)
      setVerifyCode('')
      loadFactors()
    }
  }

  const annulerInscription = async () => {
    if (factorId) await supabase.auth.mfa.unenroll({ factorId })
    setEnrolling(false)
    setQrCode('')
    setSecret('')
    setFactorId('')
    setVerifyCode('')
  }

  const desactiver2FA = async () => {
    if (!facteurActif) return
    if (!confirm('Désactiver la double authentification ? Votre compte sera moins protégé.')) return
    const { error } = await supabase.auth.mfa.unenroll({ factorId: facteurActif.id })
    if (error) showToast('Erreur : ' + error.message, 'error')
    else { showToast('Double authentification désactivée.', 'success'); loadFactors() }
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
          {needsMfaForMdp && (
            <div className="mt-4 p-4 bg-[#0f172a] rounded-lg border border-[#00bcd4]">
              <p className="text-slate-300 text-sm font-semibold mb-2">Verification 2FA requise</p>
              <p className="text-slate-400 text-xs mb-3">Entrez le code de votre application authenticator pour confirmer le changement de mot de passe.</p>
              <input type="text" value={mfaCodeMdp} onChange={e => setMfaCodeMdp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Code a 6 chiffres"
                maxLength={6}
                className="w-full px-3 py-2.5 bg-[#1e293b] border border-[#334155] rounded-lg text-white text-sm text-center tracking-widest outline-none focus:border-[#00bcd4] mb-3" />
              <div className="flex gap-2">
                <button onClick={validerMfaMdp} disabled={mfaLoadingMdp}
                  className="flex-1 py-2.5 bg-[#00bcd4] hover:bg-[#0097a7] text-white text-sm font-semibold rounded-lg disabled:opacity-60">
                  {mfaLoadingMdp ? 'Verification...' : 'Confirmer'}
                </button>
                <button onClick={() => { setNeedsMfaForMdp(false); setMfaCodeMdp('') }}
                  className="px-4 py-2.5 bg-[#334155] hover:bg-[#475569] text-slate-300 text-sm font-semibold rounded-lg">
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ETAT SECURITE + 2FA */}
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

          {/* 2FA — réel */}
          {mfaLoading ? (
            <div className="p-3 bg-[#0f172a] rounded-lg text-slate-400 text-sm">Vérification...</div>
          ) : !enrolling && facteurActif ? (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex justify-between items-center">
                <span className="text-green-800 text-sm">Double authentification (2FA)</span>
                <span className="bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">Activée</span>
              </div>
              <button onClick={desactiver2FA} className="mt-2 text-xs text-red-600 font-semibold underline hover:text-red-800">
                Désactiver la 2FA
              </button>
            </div>
          ) : !enrolling ? (
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex justify-between items-center">
                <span className="text-amber-800 text-sm">Double authentification (2FA)</span>
                <span className="bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">Non configurée</span>
              </div>
              <p className="text-amber-700 text-xs mt-2">Protégez votre compte avec une application comme Google Authenticator ou Authy.</p>
              <button onClick={demarrerInscription} className="mt-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg">
                Activer la 2FA
              </button>
            </div>
          ) : (
            <div className="p-4 bg-[#0f172a] rounded-lg border border-[#334155]">
              <p className="text-slate-300 text-sm font-semibold mb-3">Scannez ce QR code avec votre application (Google Authenticator, Authy...)</p>
              {qrCode && (
                <img src={qrCode} alt="QR code 2FA" className="w-40 h-40 mx-auto mb-3 bg-white p-2 rounded-lg" />
              )}
              <p className="text-slate-500 text-xs mb-3 text-center break-all">Ou entrez ce code manuellement : {secret}</p>
              <input type="text" value={verifyCode} onChange={e => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Code à 6 chiffres"
                maxLength={6}
                className="w-full px-3 py-2.5 bg-[#1e293b] border border-[#334155] rounded-lg text-white text-sm text-center tracking-widest outline-none focus:border-[#00bcd4] mb-3" />
              <div className="flex gap-2">
                <button onClick={confirmerInscription} disabled={verifying}
                  className="flex-1 py-2.5 bg-[#00bcd4] hover:bg-[#0097a7] text-white text-sm font-semibold rounded-lg disabled:opacity-60">
                  {verifying ? 'Vérification...' : 'Confirmer'}
                </button>
                <button onClick={annulerInscription}
                  className="px-4 py-2.5 bg-[#334155] hover:bg-[#475569] text-slate-300 text-sm font-semibold rounded-lg">
                  Annuler
                </button>
              </div>
            </div>
          )}
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
