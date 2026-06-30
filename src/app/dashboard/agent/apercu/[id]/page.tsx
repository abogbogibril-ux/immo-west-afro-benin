'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function ApercuBienPage() {
  const { id } = useParams()
  const router = useRouter()
  const [bien, setBien] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    const fetchBien = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/connexion'); return }

      const { data, error } = await supabase
        .from('biens')
        .select(`
          *,
          images_biens (url, ordre),
          localites (ville, arrondissement, quartier)
        `)
        .eq('id', id)
        .eq('agent_id', user.id)
        .single()

      if (error || !data) {
        setErreur('Bien introuvable ou accès non autorisé.')
        setLoading(false)
        return
      }
      setBien(data)
      setLoading(false)
    }
    fetchBien()
  }, [id])

  const publier = async () => {
    setPublishing(true)
    const { error } = await supabase
      .from('biens')
      .update({ statut: 'publié' })
      .eq('id', id)

    if (error) {
      setErreur('Erreur lors de la publication : ' + error.message)
      setPublishing(false)
      return
    }
    router.push('/dashboard/agent?published=1')
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"/>
        <p className="text-gray-500 text-sm">Chargement de l&apos;apercu...</p>
      </div>
    </div>
  )

  if (erreur) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl p-8 text-center max-w-md">
        <p className="text-red-500 font-medium mb-4">{erreur}</p>
        <Link href="/dashboard/agent" className="text-blue-600 hover:underline text-sm">
          Retour au dashboard
        </Link>
      </div>
    </div>
  )

  const images = [...(bien.images_biens ?? [])].sort((a: any, b: any) => a.ordre - b.ordre)
  const imageUrl = images[0]?.url ?? null

  return (
    <div className="min-h-screen bg-gray-50">

      {/* BANNIERE APERCU */}
      <div className="bg-yellow-400 text-yellow-900 py-3 px-4 text-center font-bold text-sm sticky top-0 z-50 shadow-sm">
        <span className="mr-2">👁</span>
        MODE APERCU — Ce bien n&apos;est pas encore publie et invisible du public
        <span className="ml-2">👁</span>
      </div>

      {/* ACTIONS */}
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Link href="/dashboard/agent"
              className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
              </svg>
              Dashboard
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm text-gray-700 font-medium truncate max-w-xs">{bien.titre}</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/agent/annonces?edit=${bien.id}`}
              className="px-4 py-2 border-2 border-gray-300 text-gray-700 text-sm font-semibold rounded-xl hover:border-blue-400 hover:text-blue-600 transition-all"
            >
              Modifier
            </Link>
            <button
              onClick={publier}
              disabled={publishing}
              className="px-6 py-2 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {publishing ? 'Publication...' : "Publier l'annonce"}
            </button>
          </div>
        </div>
      </div>

      {/* CONTENU */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* GAUCHE — Photo + Infos */}
          <div className="lg:col-span-2 space-y-5">

            {/* GALERIE */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              {imageUrl ? (
                <img src={imageUrl} alt={bien.titre}
                  className="w-full h-72 object-cover"/>
              ) : (
                <div className="w-full h-72 bg-gray-100 flex flex-col items-center justify-center text-gray-400">
                  <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <p className="text-sm font-medium">Aucune photo ajoutee</p>
                  <Link href={`/dashboard/agent/annonces?edit=${bien.id}`}
                    className="mt-2 text-xs text-blue-500 hover:underline">
                    Ajouter des photos →
                  </Link>
                </div>
              )}
              {images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {images.slice(1).map((img: any, i: number) => (
                    <img key={i} src={img.url} alt={`Photo ${i + 2}`}
                      className="w-20 h-16 object-cover rounded-lg flex-shrink-0 border-2 border-transparent hover:border-green-400"/>
                  ))}
                </div>
              )}
            </div>

            {/* TITRE & BADGES */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  bien.transaction === 'location' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                }`}>
                  {bien.transaction === 'location' ? 'A louer' : 'A vendre'}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                  {bien.type_bien}
                </span>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                  Brouillon
                </span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">{bien.titre}</h1>
              <p className="text-gray-500 text-sm">
                {bien.ville}{bien.arrondissement ? `, ${bien.arrondissement}` : ''}{bien.quartier ? ` — ${bien.quartier}` : ''}
              </p>
            </div>

            {/* DESCRIPTION */}
            {bien.description && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h2 className="font-bold text-gray-900 mb-3">Description</h2>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{bien.description}</p>
              </div>
            )}

            {/* CARACTERISTIQUES */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-bold text-gray-900 mb-4">Caracteristiques</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {bien.surface && (
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <p className="text-lg font-bold text-gray-900">{bien.surface} m2</p>
                    <p className="text-xs text-gray-500">Surface</p>
                  </div>
                )}
                {bien.nb_chambres && (
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <p className="text-lg font-bold text-gray-900">{bien.nb_chambres}</p>
                    <p className="text-xs text-gray-500">Chambres</p>
                  </div>
                )}
                {bien.nb_pieces && (
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <p className="text-lg font-bold text-gray-900">{bien.nb_pieces}</p>
                    <p className="text-xs text-gray-500">Pieces</p>
                  </div>
                )}
                {bien.nb_salles_bain && (
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <p className="text-lg font-bold text-gray-900">{bien.nb_salles_bain}</p>
                    <p className="text-xs text-gray-500">Salles de bain</p>
                  </div>
                )}
              </div>
            </div>

            {/* EQUIPEMENTS */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-bold text-gray-900 mb-4">Equipements</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { key: 'meuble', label: 'Meuble' },
                  { key: 'parking', label: 'Parking' },
                  { key: 'terrasse', label: 'Terrasse' },
                  { key: 'securite', label: 'Securite' },
                  { key: 'eau', label: 'Eau' },
                  { key: 'electricite', label: 'Electricite' },
                  { key: 'disponible_immediat', label: 'Dispo. immediat' },
                ].map(eq => (
                  <div key={eq.key} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                    bien[eq.key] ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-400'
                  }`}>
                    <span>{bien[eq.key] ? '✓' : '✗'}</span>
                    {eq.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* DROITE — Prix + Actions */}
          <div className="space-y-4">

            {/* PRIX */}
            <div className="bg-green-700 text-white rounded-2xl p-5 shadow-sm">
              <p className="text-green-200 text-xs font-semibold uppercase mb-1">
                {bien.transaction === 'location' ? 'Loyer mensuel' : 'Prix de vente'}
              </p>
              <p className="text-3xl font-bold">
                {new Intl.NumberFormat('fr-FR').format(bien.prix)}
              </p>
              <p className="text-green-200 text-sm mt-0.5">
                FCFA{bien.transaction === 'location' ? '/mois' : ''}
              </p>
            </div>

            {/* ACTIONS */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
              <h3 className="font-bold text-gray-900 text-sm">Actions</h3>
              <button
                onClick={publier}
                disabled={publishing}
                className="w-full py-3 bg-green-600 text-white font-bold text-sm rounded-xl hover:bg-green-700 disabled:opacity-60 transition-colors"
              >
                {publishing ? 'Publication en cours...' : "Publier l'annonce"}
              </button>
              <Link
                href={`/dashboard/agent/annonces?edit=${bien.id}`}
                className="w-full py-3 border-2 border-gray-200 text-gray-700 font-semibold text-sm rounded-xl hover:border-blue-400 hover:text-blue-600 transition-all text-center block"
              >
                Modifier le bien
              </Link>
              <Link
                href="/dashboard/agent"
                className="w-full py-3 text-gray-400 font-medium text-sm rounded-xl hover:text-gray-600 transition-colors text-center block"
              >
                Retour au dashboard
              </Link>
            </div>

            {/* INFOS */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-sm text-yellow-800">
              <p className="font-bold mb-1">Avant de publier, verifiez :</p>
              <ul className="space-y-1 text-xs">
                <li>✓ Titre clair et descriptif</li>
                <li>✓ Prix correct en FCFA</li>
                <li>✓ Photos ajoutees</li>
                <li>✓ Ville et localisation</li>
                <li>✓ Description complete</li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}