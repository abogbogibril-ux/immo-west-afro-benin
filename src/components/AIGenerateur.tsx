'use client'

import { useState } from 'react'

interface Props {
  form: {
    type_bien: string
    transaction: string
    prix: string
    ville: string
    arrondissement: string
    quartier: string
    surface: string
    nb_chambres: string
    nb_pieces: string
    nb_salles_bain: string
    meuble: boolean
    parking: boolean
    terrasse: boolean
    securite: boolean
    eau: boolean
    electricite: boolean
    disponible_immediat: boolean
  }
  previews: string[]
  onGenerated: (titre: string, description: string) => void
}

export default function AIGenerateur({ form, previews, onGenerated }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const generate = async () => {
    setLoading(true)
    setError('')

    try {
      const caracteristiques = [
        'Type: ' + (form.type_bien || 'non precise'),
        'Transaction: ' + (form.transaction === 'vente' ? 'Vente' : 'Location'),
        'Prix: ' + (form.prix ? new Intl.NumberFormat('fr-FR').format(Number(form.prix)) + ' FCFA' : 'non precise'),
        'Ville: ' + (form.ville || 'non precise'),
        form.arrondissement ? 'Arrondissement: ' + form.arrondissement : '',
        form.quartier ? 'Quartier: ' + form.quartier : '',
        form.surface ? 'Surface: ' + form.surface + ' m2' : '',
        form.nb_chambres ? 'Chambres: ' + form.nb_chambres : '',
        form.nb_pieces ? 'Pieces: ' + form.nb_pieces : '',
        form.nb_salles_bain ? 'Salles de bain: ' + form.nb_salles_bain : '',
        'Meuble: ' + (form.meuble ? 'Oui' : 'Non'),
        'Parking: ' + (form.parking ? 'Oui' : 'Non'),
        'Terrasse: ' + (form.terrasse ? 'Oui' : 'Non'),
        'Securite: ' + (form.securite ? 'Oui' : 'Non'),
        'Eau courante: ' + (form.eau ? 'Oui' : 'Non'),
        'Electricite: ' + (form.electricite ? 'Oui' : 'Non'),
        'Disponible immediatement: ' + (form.disponible_immediat ? 'Oui' : 'Non'),
      ].filter(Boolean).join('\n')

      const prompt = 'Tu es un expert immobilier au Benin. Analyse ce bien et genere un titre accrocheur (max 80 caracteres) et une description professionnelle et detaillee (200-300 mots) en francais pour une annonce immobiliere sur la plateforme Immo West Afro Benin.\n\nCaracteristiques du bien:\n' + caracteristiques + '\n\n' + (previews.length > 0 ? 'Des photos du bien sont jointes - analyse-les pour enrichir la description avec des details visuels.' : 'Aucune photo disponible.') + '\n\nReponds UNIQUEMENT en JSON valide sans backticks ni markdown:\n{"titre": "...", "description": "..."}'

      const imageContents = previews.slice(0, 3).map(p => ({
        type: 'image',
        source: { type: 'base64', media_type: 'image/jpeg', data: p.split(',')[1] }
      }))

      const textContent = { type: 'text', text: prompt }

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: previews.length > 0 ? [...imageContents, textContent] : [textContent]
          }]
        })
      })

      const data = await response.json()
      const text = data.content?.[0]?.text || ''
      const clean = text.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)

      if (parsed.titre && parsed.description) {
        onGenerated(parsed.titre, parsed.description)
      } else {
        setError('Reponse IA invalide. Reessayez.')
      }
    } catch (err) {
      console.error('Erreur IA:', err)
      setError('Erreur lors de la generation. Verifiez les caracteristiques et reessayez.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ gridColumn: '1/-1', marginBottom: '1rem' }}>
      <button type="button" onClick={generate} disabled={loading}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.75rem 1.25rem',
          background: loading ? '#334155' : 'linear-gradient(135deg, #00bcd4, #0097a7)',
          color: '#fff', border: 'none', borderRadius: '10px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '0.9rem', fontWeight: '600',
          boxShadow: '0 2px 8px rgba(0,188,212,0.3)',
          transition: 'all 0.2s',
        }}>
        {loading ? (
          <>
            <svg style={{ width: 18, height: 18 }} className="animate-spin" fill="none" viewBox="0 0 24 24">
              <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Analyse en cours...
          </>
        ) : (
          <>
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
            </svg>
            Generer avec l IA
            {previews.length > 0 && (
              <span style={{ fontSize: '0.75rem', opacity: 0.85, background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '999px' }}>
                {previews.length} photo{previews.length > 1 ? 's' : ''}
              </span>
            )}
          </>
        )}
      </button>
      {error && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem' }}>{error}</p>}
      <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.4rem' }}>
        Remplissez les caracteristiques et ajoutez des photos pour un meilleur resultat
      </p>
    </div>
  )
}