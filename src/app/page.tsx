import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Immo West Afro - Bénin | Achat, Vente et Location Immobilière',
  description: 'La plateforme de référence pour l\'immobilier au Bénin. Trouvez maisons, appartements, terrains et villas à Cotonou, Porto-Novo, Parakou et partout au Bénin.',
}

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #1a3c5e 0%, #2d6a4f 100%)',
        color: 'white',
        padding: '80px 24px',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '16px' }}>
          Trouvez votre bien immobilier au Bénin
        </h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '32px', opacity: 0.9 }}>
          Maisons, appartements, terrains et villas à Cotonou, Porto-Novo et partout au Bénin
        </p>
        <a href="/search" style={{
          background: '#f59e0b',
          color: '#1a1a1a',
          padding: '14px 32px',
          borderRadius: '8px',
          fontWeight: 600,
          fontSize: '1rem',
          textDecoration: 'none',
          display: 'inline-block'
        }}>
          Voir toutes les annonces
        </a>
      </section>

      {/* Catégories */}
      <section style={{ padding: '60px 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '1.8rem', marginBottom: '40px', color: '#1a3c5e' }}>
          Que recherchez-vous ?
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          {[
            { label: 'Maisons', icon: '🏠', href: '/search?type=maison' },
            { label: 'Appartements', icon: '🏢', href: '/search?type=appartement' },
            { label: 'Terrains', icon: '🌍', href: '/search?type=terrain' },
            { label: 'Villas', icon: '🏡', href: '/search?type=villa' },
          ].map((cat) => (
            <a key={cat.label} href={cat.href} style={{
              display: 'block',
              textAlign: 'center',
              padding: '32px 16px',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              textDecoration: 'none',
              color: '#1a3c5e',
              fontWeight: 600,
              fontSize: '1rem',
              transition: 'box-shadow 0.2s',
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>{cat.icon}</div>
              {cat.label}
            </a>
          ))}
        </div>
      </section>

      {/* Villes */}
      <section style={{ background: '#f9fafb', padding: '60px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '1.8rem', marginBottom: '40px', color: '#1a3c5e' }}>
            Rechercher par ville
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
            {['Cotonou', 'Porto-Novo', 'Parakou', 'Abomey-Calavi', 'Bohicon', 'Natitingou'].map((ville) => (
              <a key={ville} href={`/search?ville=${ville}`} style={{
                display: 'block',
                textAlign: 'center',
                padding: '20px',
                background: 'white',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                textDecoration: 'none',
                color: '#374151',
                fontWeight: 500,
              }}>
                📍 {ville}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Contact */}
      <section style={{ padding: '60px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.8rem', color: '#1a3c5e', marginBottom: '16px' }}>
          Vous avez un bien à vendre ou louer ?
        </h2>
        <p style={{ color: '#6b7280', marginBottom: '28px', fontSize: '1.1rem' }}>
          Publiez votre annonce gratuitement et touchez des milliers d&apos;acheteurs au Bénin
        </p>
        <a href="/contact" style={{
          background: '#1a3c5e',
          color: 'white',
          padding: '14px 32px',
          borderRadius: '8px',
          fontWeight: 600,
          textDecoration: 'none',
          display: 'inline-block',
        }}>
          Nous contacter
        </a>
      </section>
    </main>
  )
}