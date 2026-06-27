export default function AProposPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* HERO */}
      <section style={{
        backgroundColor: '#0f172a', padding: '5rem 2rem', textAlign: 'center',
      }}>
        <h1 style={{ color: '#fff', fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: '800', marginBottom: '1rem' }}>
          &Agrave; propos d&apos;Immo West Afro
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          La plateforme immobili&egrave;re de r&eacute;f&eacute;rence au B&eacute;nin.
        </p>
      </section>

      {/* MISSION */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '4rem 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {[
            { icon: '🎯', titre: 'Notre mission', texte: 'Faciliter la recherche et la location de biens immobiliers au Bénin en connectant agents et clients de manière simple et efficace.' },
            { icon: '🌍', titre: 'Notre vision', texte: 'Devenir la plateforme immobilière de référence en Afrique de l\'Ouest, en commençant par le Bénin.' },
            { icon: '💎', titre: 'Nos valeurs', texte: 'Transparence, fiabilité et accessibilité pour tous les acteurs du marché immobilier béninois.' },
          ].map((item) => (
            <div key={item.titre} style={{
              backgroundColor: '#fff', borderRadius: '16px', padding: '2rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)', textAlign: 'center',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{item.icon}</div>
              <h3 style={{ color: '#0f172a', fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.75rem' }}>{item.titre}</h3>
              <p style={{ color: '#64748b', lineHeight: '1.6' }}>{item.texte}</p>
            </div>
          ))}
        </div>

        {/* STATS */}
        <div style={{
          marginTop: '4rem', backgroundColor: '#0f172a', borderRadius: '16px',
          padding: '3rem', display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '2rem', textAlign: 'center',
        }}>
          {[
            { chiffre: '15+', label: 'Villes couvertes' },
            { chiffre: '100%', label: 'Gratuit pour les clients' },
            { chiffre: '24/7', label: 'Disponible en ligne' },
            { chiffre: '🇧🇯', label: 'Made in Bénin' },
          ].map((s) => (
            <div key={s.label}>
              <div style={{ color: '#00bcd4', fontSize: '2rem', fontWeight: '800' }}>{s.chiffre}</div>
              <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}