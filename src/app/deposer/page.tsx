'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const TYPES = ['Maison', 'Appartement', 'Villa', 'Terrain', 'Bureau', 'Studio', 'Chambre']
const VILLES = ['Cotonou', 'Abomey-Calavi', 'Porto-Novo', 'Sèmè-Kpodji', 'Parakou', 'Bohicon', 'Ouidah', 'Lokossa', 'Abomey', 'Djougou', 'Natitingou']

export default function DeposerPage() {
  const [etape, setEtape] = useState<'formulaire' | 'succes'>('formulaire')
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState('')
  const [form, setForm] = useState({
    type_besoin: '',
    transaction: 'achat',
    ville: '',
    budget_min: '',
    budget_max: '',
    surface_min: '',
    nb_chambres: '',
    description: '',
    telephone: '',
    nom: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErreur('')
  }

  const handleSubmit = async () => {
    if (!form.type_besoin || !form.ville || !form.telephone) {
      setErreur('Veuillez remplir les champs obligatoires : type de bien, ville et téléphone.')
      return
    }
    if (form.telephone.replace(/\D/g, '').length < 8) {
      setErreur('Numéro de téléphone invalide.')
      return
    }

    setLoading(true)
    const { error } = await supabase.from('besoins').insert({
      type_besoin: form.type_besoin,
      transaction: form.transaction,
      ville: form.ville,
      budget_min: form.budget_min ? parseInt(form.budget_min) : null,
      budget_max: form.budget_max ? parseInt(form.budget_max) : null,
      surface_min: form.surface_min ? parseInt(form.surface_min) : null,
      nb_chambres: form.nb_chambres ? parseInt(form.nb_chambres) : null,
      description: form.description || null,
      telephone: form.telephone,
      nom: form.nom || null,
    })
    setLoading(false)

    if (error) {
      setErreur('Une erreur est survenue. Veuillez réessayer.')
      console.error(error)
      return
    }
    setEtape('succes')
  }

  if (etape === 'succes') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Besoin enregistré !</h1>
          <p className="text-gray-500 mb-6 text-sm leading-relaxed">
            Votre besoin a été transmis à nos agents. Vous serez contacté très rapidement
            au <span className="font-semibold text-gray-700">{form.telephone}</span>.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/recherche"
              className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors text-sm text-center">
              Parcourir les annonces
            </Link>
            <Link href="/"
              className="w-full py-3 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm text-center">
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* EN-TETE */}
      <div className="bg-gradient-to-br from-blue-800 to-green-700 text-white py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 text-white text-xs font-semibold px-4 py-2 rounded-full mb-4 border border-white/20">
            Gratuit &middot; Sans inscription
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Déposez votre besoin immobilier
          </h1>
          <p className="text-blue-100 text-base max-w-lg mx-auto">
            Dites-nous ce que vous cherchez. Nos agents vous contacteront avec les meilleures offres disponibles au Bénin.
          </p>
        </div>
      </div>

      {/* FORMULAIRE */}
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">

          {/* ETAPE 1 — Type & Transaction */}
          <div className="mb-6">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">
              Quel bien recherchez-vous ?
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
              {TYPES.map(t => (
                <button key={t} onClick={() => setForm({ ...form, type_besoin: t })}
                  className={`py-2.5 px-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                    form.type_besoin === t
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 text-gray-500 hover:border-green-300'
                  }`}>
                  {t}
                </button>
              ))}
            </div>

            <div className="flex gap-3 mt-4">
              {[['achat', 'Acheter'], ['location', 'Louer']].map(([val, label]) => (
                <button key={val} onClick={() => setForm({ ...form, transaction: val })}
                  className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-bold transition-all ${
                    form.transaction === val
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-500 hover:border-blue-300'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <hr className="border-gray-100 mb-6"/>

          {/* ETAPE 2 — Localisation & Budget */}
          <div className="mb-6">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">
              Où et quel budget ?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ville *
                </label>
                <select name="ville" value={form.ville} onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400/30 bg-gray-50">
                  <option value="">Sélectionner une ville...</option>
                  {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget min (FCFA)
                </label>
                <input type="number" name="budget_min" value={form.budget_min}
                  onChange={handleChange} placeholder="Ex: 5 000 000"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400/30 bg-gray-50"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget max (FCFA)
                </label>
                <input type="number" name="budget_max" value={form.budget_max}
                  onChange={handleChange} placeholder="Ex: 50 000 000"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400/30 bg-gray-50"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Surface minimale (m&sup2;)
                </label>
                <input type="number" name="surface_min" value={form.surface_min}
                  onChange={handleChange} placeholder="Ex: 80"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400/30 bg-gray-50"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nb. chambres souhaitées
                </label>
                <select name="nb_chambres" value={form.nb_chambres} onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400/30 bg-gray-50">
                  <option value="">Peu importe</option>
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}+</option>)}
                </select>
              </div>
            </div>
          </div>

          <hr className="border-gray-100 mb-6"/>

          {/* ETAPE 3 — Description & Contact */}
          <div className="mb-6">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">
              Détails & Contact
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description de votre besoin
                </label>
                <textarea name="description" value={form.description} onChange={handleChange}
                  placeholder="Ex: Je cherche une villa avec jardin, proche écoles, disponible immédiatement..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400/30 bg-gray-50 resize-none"/>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Votre nom (optionnel)
                  </label>
                  <input type="text" name="nom" value={form.nom} onChange={handleChange}
                    placeholder="Ex: Koffi Mensah"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400/30 bg-gray-50"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone *
                  </label>
                  <input type="tel" name="telephone" value={form.telephone} onChange={handleChange}
                    placeholder="+229 XX XX XX XX"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400/30 bg-gray-50"/>
                </div>
              </div>
            </div>
          </div>

          {/* ERREUR */}
          {erreur && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-red-600 text-sm">
              {erreur}
            </div>
          )}

          {/* BOUTON */}
          <button onClick={handleSubmit} disabled={loading}
            className="w-full py-4 bg-green-600 text-white font-bold text-base rounded-xl hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
            {loading ? 'Envoi en cours...' : 'Envoyer mon besoin'}
          </button>

          <p className="text-center text-xs text-gray-400 mt-3">
            <span className="text-red-400">*</span> Champs obligatoires &middot; Vos données sont confidentielles
          </p>
        </div>

        {/* LIEN INSCRIPTION */}
        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-5 text-center">
          <p className="text-sm text-gray-600 mb-3">
            Vous êtes agent immobilier ou propriétaire ?
          </p>
          <Link href="/inscription"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-colors">
            Créer un compte professionnel
          </Link>
        </div>
      </div>
    </div>
  )
}