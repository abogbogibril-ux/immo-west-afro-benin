'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Visite {
  id: string
  bien: string
  ville: string
  agent: string
  telephone: string
  date: string
  heure: string
  statut: 'confirmée' | 'en_attente' | 'effectuée' | 'annulée'
  note?: number
  commentaire?: string
}

// Données de démonstration — à remplacer par Supabase quand la table visites sera créée
const VISITES_DEMO: Visite[] = [
  {
    id: '1',
    bien: 'Villa 5 chambres piscine — Cotonou',
    ville: 'Cotonou, Cadjehoun',
    agent: 'Sèna Houénou',
    telephone: '+22997000001',
    date: '2026-07-01',
    heure: '10:00',
    statut: 'confirmée',
  },
  {
    id: '2',
    bien: 'Terrain 300m² — Porto-Novo',
    ville: 'Porto-Novo, Gbèto',
    agent: 'Cyriaque Dossou',
    telephone: '+22997000002',
    date: '2026-07-05',
    heure: '14:00',
    statut: 'en_attente',
  },
  {
    id: '3',
    bien: 'Appartement meublé 3p — Calavi',
    ville: 'Abomey-Calavi, Godomey',
    agent: 'Parfait Lokossou',
    telephone: '+22997000003',
    date: '2026-06-20',
    heure: '09:00',
    statut: 'effectuée',
    note: 4,
    commentaire: 'Bien propre, quartier calme, bon rapport qualité-prix.',
  },
  {
    id: '4',
    bien: 'Bureau commercial — Cotonou',
    ville: 'Cotonou, Akpakpa',
    agent: 'Fiacre Agbo',
    telephone: '+22997000004',
    date: '2026-06-15',
    heure: '11:00',
    statut: 'annulée',
  },
]

const STATUT_CONFIG = {
  confirmée:   { label: 'Confirmée',          color: 'bg-[#00bcd4]/20 text-[#00bcd4]',   dot: 'bg-[#00bcd4]' },
  en_attente:  { label: 'En attente',          color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  effectuée:   { label: 'Effectuée',           color: 'bg-blue-100 text-blue-700',     dot: 'bg-blue-500' },
  annulée:     { label: 'Annulée',             color: 'bg-red-100 text-red-500',       dot: 'bg-red-400' },
}

function StarRating({ note, onChange }: { note?: number; onChange?: (n: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(n => (
        <button key={n} onClick={() => onChange?.(n)}
          className={`text-xl transition-transform hover:scale-110 ${n <= (note ?? 0) ? 'text-amber-400' : 'text-gray-200'}`}>
          ★
        </button>
      ))}
    </div>
  )
}

export default function VisitesPage() {
  const [visites, setVisites] = useState<Visite[]>(VISITES_DEMO)
  const [tab, setTab] = useState<'avenir' | 'passees'>('avenir')
  const [ratingModal, setRatingModal] = useState<string | null>(null)
  const [tempNote, setTempNote] = useState(0)
  const [tempComment, setTempComment] = useState('')

  const avenir = visites.filter(v => v.statut === 'confirmée' || v.statut === 'en_attente')
  const passees = visites.filter(v => v.statut === 'effectuée' || v.statut === 'annulée')

  const current = tab === 'avenir' ? avenir : passees

  const handleAnnuler = (id: string) => {
    if (!confirm('Annuler cette visite ?')) return
    setVisites(prev => prev.map(v => v.id === id ? { ...v, statut: 'annulée' as const } : v))
  }

  const handleNote = (id: string) => {
    setVisites(prev => prev.map(v => v.id === id
      ? { ...v, note: tempNote, commentaire: tempComment }
      : v
    ))
    setRatingModal(null)
    setTempNote(0)
    setTempComment('')
  }

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const isUpcoming = (date: string) => new Date(date) >= new Date()

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-[#0f172a] min-h-screen">

      {/* Modal avis */}
      {ratingModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1e293b] rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-bold text-white mb-1">Laisser un avis</h3>
            <p className="text-sm text-gray-400 mb-4">
              {visites.find(v => v.id === ratingModal)?.bien}
            </p>
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Note globale</p>
              <StarRating note={tempNote} onChange={setTempNote} />
            </div>
            <div className="mb-5">
              <p className="text-sm font-medium text-gray-700 mb-2">Commentaire (optionnel)</p>
              <textarea rows={3} value={tempComment}
                onChange={e => setTempComment(e.target.value)}
                placeholder="Décrivez votre expérience..."
                className="w-full px-3 py-2.5 border border-[#334155] rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50 bg-[#0f172a] text-white"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setRatingModal(null)}
                className="flex-1 py-2.5 border border-[#334155] text-gray-500 text-sm font-medium rounded-xl hover:bg-[#0f172a]">
                Annuler
              </button>
              <button onClick={() => handleNote(ratingModal)} disabled={tempNote === 0}
                className="flex-1 py-2.5 bg-[#00bcd4] text-white text-sm font-semibold rounded-xl hover:bg-[#0097a7] disabled:opacity-50">
                Publier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div>
        <h1 className="text-xl font-bold text-white">Mes visites</h1>
        <p className="text-sm text-gray-400 mt-0.5">Gérez vos visites de biens immobiliers</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total', value: visites.length, color: 'text-gray-900', bg: 'bg-white' },
          { label: 'Confirmées', value: avenir.filter(v => v.statut === 'confirmée').length, color: 'text-[#00bcd4]', bg: 'bg-[#00bcd4]/10' },
          { label: 'En attente', value: avenir.filter(v => v.statut === 'en_attente').length, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Effectuées', value: passees.filter(v => v.statut === 'effectuée').length, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl border border-[#334155] p-3 text-center`}>
            <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-[10px] text-gray-400 mt-0.5 font-medium leading-tight">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {(['avenir', 'passees'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              tab === t ? 'bg-[#0f172a] text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}>
            {t === 'avenir' ? `📅 À venir (${avenir.length})` : `⏪ Passées (${passees.length})`}
          </button>
        ))}
      </div>

      {/* Liste visites */}
      {current.length === 0 ? (
        <div className="bg-[#1e293b] rounded-2xl border border-[#334155] shadow-sm p-10 text-center">
          <p className="text-4xl mb-3">{tab === 'avenir' ? '🗓' : '📝'}</p>
          <p className="font-semibold text-gray-700 mb-1">
            {tab === 'avenir' ? 'Aucune visite prévue' : 'Aucune visite passée'}
          </p>
          <p className="text-sm text-gray-400 mb-4">
            {tab === 'avenir' ? 'Contactez un agent pour planifier une visite' : 'Vos visites effectuées apparaîtront ici'}
          </p>
          {tab === 'avenir' && (
            <Link href="/recherche"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#00bcd4] text-white text-sm font-semibold rounded-xl hover:bg-[#0097a7] transition-colors">
              Parcourir les annonces
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {current.map(visite => {
            const cfg = STATUT_CONFIG[visite.statut]
            return (
              <div key={visite.id} className="bg-[#1e293b] rounded-2xl border border-[#334155] shadow-sm p-5">

                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}/>
                        {cfg.label}
                      </span>
                    </div>
                    <h3 className="font-semibold text-white">{visite.bien}</h3>
                    <p className="text-sm text-gray-400 mt-0.5">📍 {visite.ville}</p>
                  </div>
                </div>

                {/* Détails */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <div className="bg-[#0f172a] rounded-xl p-3">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-1">Date & Heure</p>
                    <p className="text-sm font-semibold text-white capitalize">{formatDate(visite.date)}</p>
                    <p className="text-sm text-gray-500">à {visite.heure}</p>
                  </div>
                  <div className="bg-[#0f172a] rounded-xl p-3">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-1">Agent</p>
                    <p className="text-sm font-semibold text-white">{visite.agent}</p>
                    <a href={`tel:${visite.telephone}`}
                      className="text-xs text-[#00bcd4] hover:underline">{visite.telephone}</a>
                  </div>
                  {visite.statut === 'effectuée' && visite.note && (
                    <div className="bg-amber-50 rounded-xl p-3">
                      <p className="text-[10px] text-amber-600 uppercase tracking-wide font-medium mb-1">Votre avis</p>
                      <StarRating note={visite.note} />
                      {visite.commentaire && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{visite.commentaire}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  {(visite.statut === 'confirmée' || visite.statut === 'en_attente') && (
                    <>
                      <a href={`tel:${visite.telephone}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00bcd4] text-white text-sm font-medium rounded-lg hover:bg-[#0097a7] transition-colors">
                        📞 Appeler
                      </a>
                      <a href={`https://wa.me/${visite.telephone.replace(/[\s+\-()]/g, '')}?text=${encodeURIComponent(`Bonjour ${visite.agent}, je vous contacte concernant notre visite prévue le ${formatDate(visite.date)} à ${visite.heure}.`)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] text-white text-sm font-medium rounded-lg hover:bg-[#1fba59] transition-colors">
                        💬 WhatsApp
                      </a>
                      <button
                        onClick={() => {
                          const event = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:Visite - ${visite.bien}\nDTSTART:${visite.date.replace(/-/g,'')}T${visite.heure.replace(':','')}00\nDURATION:PT1H\nEND:VEVENT\nEND:VCALENDAR`
                          const blob = new Blob([event], { type: 'text/calendar' })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = 'visite.ics'
                          a.click()
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-[#334155] text-gray-600 text-sm rounded-lg hover:border-green-300 hover:text-[#00bcd4] transition-all">
                        🗓 Ajouter agenda
                      </button>
                      {visite.statut === 'confirmée' && (
                        <button onClick={() => handleAnnuler(visite.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-500 text-sm rounded-lg hover:bg-red-50 transition-all">
                          ❌ Annuler
                        </button>
                      )}
                    </>
                  )}

                  {visite.statut === 'effectuée' && !visite.note && (
                    <button
                      onClick={() => { setRatingModal(visite.id); setTempNote(0); setTempComment('') }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors">
                      ⭐ Laisser un avis
                    </button>
                  )}

                  <Link href="/dashboard/client/messages"
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-[#334155] text-gray-600 text-sm rounded-lg hover:border-green-300 hover:text-[#00bcd4] transition-all">
                    💬 Contacter l'agent
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}