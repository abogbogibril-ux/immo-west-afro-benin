'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface Filleul {
  id: string
  prenom: string
  nom: string
  role: string
  created_at: string
}

export default function ParrainagePage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [filleuls, setFilleuls] = useState<Filleul[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      setUserId(user.id)

      const { data } = await supabase
        .from('profiles')
        .select('id, prenom, nom, role, created_at')
        .eq('parraine_par', user.id)
        .order('created_at', { ascending: false })

      setFilleuls(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const lien = userId ? `https://benin.immowestafro.com/inscription?ref=${userId}` : ''

  const copierLien = async () => {
    if (!lien) return
    try {
      await navigator.clipboard.writeText(lien)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* ignore */ }
  }

  const partagerWhatsApp = () => {
    const texte = encodeURIComponent(
      `Rejoins Immo West Afro Bénin, la plateforme immobilière du Bénin ! Inscris-toi ici : ${lien}`
    )
    window.open(`https://wa.me/?text=${texte}`, '_blank')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Parrainage</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Invitez d'autres agents ou clients à rejoindre la plateforme grâce à votre lien personnel.
        </p>
      </div>

      {/* Lien personnel */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
        <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-3">Votre lien de parrainage</h2>
        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            readOnly
            value={lien}
            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 min-h-[44px]"
          />
          <button
            onClick={copierLien}
            className="px-5 py-3 bg-gray-900 dark:bg-gray-700 text-white rounded-xl font-semibold text-sm hover:bg-gray-800 transition-colors min-h-[44px] whitespace-nowrap"
          >
            {copied ? '✓ Copié !' : 'Copier le lien'}
          </button>
          <button
            onClick={partagerWhatsApp}
            className="px-5 py-3 bg-[#25D366] text-white rounded-xl font-semibold text-sm hover:bg-[#1fba59] transition-colors min-h-[44px] whitespace-nowrap flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Partager
          </button>
        </div>
      </div>

      {/* Statistique */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-6 text-white">
        <p className="text-green-200 text-xs font-medium uppercase tracking-widest mb-1">Personnes parrainées</p>
        <p className="text-4xl font-bold">{filleuls.length}</p>
      </div>

      {/* Liste des filleuls */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <h2 className="font-bold text-gray-900 dark:text-gray-100 px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          Vos filleuls
        </h2>
        {filleuls.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
            Personne ne s'est encore inscrit avec votre lien. Partagez-le pour commencer !
          </p>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-700">
            {filleuls.map(f => (
              <div key={f.id} className="flex items-center justify-between px-6 py-3.5">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{f.prenom} {f.nom}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">{f.role === 'agent' ? 'Agent immobilier' : 'Client'}</p>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {new Date(f.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
