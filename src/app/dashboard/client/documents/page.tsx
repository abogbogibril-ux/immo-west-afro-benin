'use client'

import { useState } from 'react'

interface Document {
  id: string
  nom: string
  type: 'fourni' | 'recu'
  categorie: string
  statut: 'ok' | 'manquant' | 'en_attente'
  date?: string
  url?: string
}

interface Dossier {
  id: string
  bien: string
  ville: string
  agent: string
  statut: string
  progression: number
  documents: Document[]
}

const DOSSIERS_DEMO: Dossier[] = [
  {
    id: '1',
    bien: 'Villa 5 chambres piscine',
    ville: 'Cotonou, Cadjehoun',
    agent: 'Sèna Houénou',
    statut: 'En cours de constitution',
    progression: 75,
    documents: [
      { id: 'd1', nom: "Pièce d'identité", type: 'fourni', categorie: 'Identité', statut: 'ok', date: '20 juin 2026' },
      { id: 'd2', nom: 'Justificatif de domicile', type: 'fourni', categorie: 'Identité', statut: 'ok', date: '20 juin 2026' },
      { id: 'd3', nom: 'Justificatif de revenus', type: 'fourni', categorie: 'Financier', statut: 'manquant' },
      { id: 'd4', nom: 'Caution / Garant', type: 'fourni', categorie: 'Financier', statut: 'manquant' },
      { id: 'd5', nom: 'Contrat de bail (brouillon)', type: 'recu', categorie: 'Contrat', statut: 'ok', date: '22 juin 2026' },
      { id: 'd6', nom: "État des lieux", type: 'recu', categorie: 'Contrat', statut: 'ok', date: '22 juin 2026' },
      { id: 'd7', nom: 'Reçu de paiement', type: 'recu', categorie: 'Paiement', statut: 'en_attente' },
    ]
  }
]

const AUTRES_DOCS = [
  { id: 'a1', nom: "Offre d'achat — Terrain Porto-Novo", date: '23 juin 2026', type: 'PDF' },
  { id: 'a2', nom: 'Fiche technique — Appartement Akpakpa', date: '20 juin 2026', type: 'PDF' },
  { id: 'a3', nom: 'Contrat de mandat — Villa Cotonou', date: '15 juin 2026', type: 'PDF' },
]

const STATUT_DOC = {
  ok: { label: '✅ Fourni', color: 'text-green-600 bg-green-50' },
  manquant: { label: '⚠️ Manquant', color: 'text-amber-600 bg-amber-50' },
  en_attente: { label: '⏳ En attente', color: 'text-blue-600 bg-blue-50' },
}

export default function DocumentsPage() {
  const [dossiers] = useState<Dossier[]>(DOSSIERS_DEMO)
  const [activeDoc, setActiveDoc] = useState<string | null>(dossiers[0]?.id ?? null)
  const [uploadMsg, setUploadMsg] = useState('')

  const dossier = dossiers.find(d => d.id === activeDoc)

  const handleUpload = () => {
    setUploadMsg('Fonctionnalité d\'upload disponible prochainement.')
    setTimeout(() => setUploadMsg(''), 3000)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5">

      {/* Toast */}
      {uploadMsg && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg">
          {uploadMsg}
        </div>
      )}

      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Documents & Dossiers</h1>
          <p className="text-sm text-gray-400 mt-0.5">Gérez vos documents immobiliers</p>
        </div>
        <button onClick={handleUpload}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
          </svg>
          Ajouter un document
        </button>
      </div>

      {/* Dossiers en cours */}
      {dossiers.length > 0 && (
        <div className="space-y-5">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <span className="w-1 h-5 bg-green-500 rounded-full inline-block"/>
            Dossiers en cours
          </h2>

          {dossiers.map(d => (
            <div key={d.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

              {/* Header dossier */}
              <div className="p-5 border-b border-gray-50">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">📁</span>
                      <h3 className="font-semibold text-gray-900">{d.bien}</h3>
                    </div>
                    <p className="text-sm text-gray-400">📍 {d.ville} · 👤 Agent : {d.agent}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full flex-shrink-0">
                    {d.statut}
                  </span>
                </div>

                {/* Barre de progression */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-500 font-medium">Progression du dossier</span>
                    <span className="text-xs font-bold text-green-600">{d.progression}%</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-600 rounded-full transition-all duration-700"
                      style={{ width: `${d.progression}%` }}/>
                  </div>
                </div>
              </div>

              {/* Documents fournis par le client */}
              <div className="p-5">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Documents que vous devez fournir
                </h4>
                <div className="space-y-2 mb-5">
                  {d.documents.filter(doc => doc.type === 'fourni').map(doc => (
                    <div key={doc.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">
                          {doc.statut === 'ok' ? '📄' : '📋'}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{doc.nom}</p>
                          {doc.date && <p className="text-xs text-gray-400">Soumis le {doc.date}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUT_DOC[doc.statut].color}`}>
                          {STATUT_DOC[doc.statut].label}
                        </span>
                        {doc.statut === 'manquant' && (
                          <button onClick={handleUpload}
                            className="px-2.5 py-1 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors">
                            Ajouter →
                          </button>
                        )}
                        {doc.statut === 'ok' && (
                          <button className="p-1.5 text-gray-400 hover:text-red-500 transition-colors" title="Supprimer">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Documents reçus de l'agent */}
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Documents reçus de l'agent
                </h4>
                <div className="space-y-2">
                  {d.documents.filter(doc => doc.type === 'recu').map(doc => (
                    <div key={doc.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">📜</span>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{doc.nom}</p>
                          {doc.date && <p className="text-xs text-gray-400">Reçu le {doc.date}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUT_DOC[doc.statut].color}`}>
                          {STATUT_DOC[doc.statut].label}
                        </span>
                        {doc.statut === 'ok' && (
                          <div className="flex gap-1">
                            <button className="px-2.5 py-1 border border-gray-200 text-gray-600 text-xs rounded-lg hover:border-green-300 hover:text-green-600 transition-all">
                              Consulter
                            </button>
                            <button className="px-2.5 py-1 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors">
                              Signer
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions dossier */}
                <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-gray-100">
                  <button className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">
                    📧 Envoyer à l'agent
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:border-green-300 hover:text-green-600 transition-all">
                    📥 Télécharger le dossier
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Autres documents */}
      <div>
        <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
          <span className="w-1 h-5 bg-green-500 rounded-full inline-block"/>
          Autres documents
        </h2>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {AUTRES_DOCS.map(doc => (
            <div key={doc.id} className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center text-red-500 text-xs font-bold">
                  PDF
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{doc.nom}</p>
                  <p className="text-xs text-gray-400">{doc.date}</p>
                </div>
              </div>
              <button className="p-2 text-gray-400 hover:text-green-600 transition-colors" title="Télécharger">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                </svg>
              </button>
            </div>
          ))}
          {AUTRES_DOCS.length === 0 && (
            <div className="p-8 text-center text-gray-400">
              <p className="text-2xl mb-2">📁</p>
              <p className="text-sm">Aucun document archivé</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}