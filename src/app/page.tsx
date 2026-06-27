export default function HomePage() {
  return (
    <main>
      {/* HERO SECTION */}
      <section
        style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url("/hero-bg.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 2rem',
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
          <h1 style={{
            color: '#fff',
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: '800',
            lineHeight: '1.2',
            marginBottom: '1rem',
          }}>
            Trouvez votre bien<br />immobilier id&eacute;al au B&eacute;nin
          </h1>
          <p style={{
            color: '#e2e8f0',
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            marginBottom: '2rem',
            maxWidth: '600px',
          }}>
            Maisons, terrains, appartements et villas &agrave; vendre ou &agrave; louer &agrave;
            Cotonou, Abomey-Calavi, Porto-Novo et partout au B&eacute;nin.
          </p>

          {/* BARRE DE RECHERCHE */}
          <div style={{
            display: 'flex',
            gap: '0',
            maxWidth: '750px',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}>
            <input
              type="text"
              placeholder="Rechercher par ville, quartier..."
              style={{
                flex: 1,
                padding: '1rem 1.5rem',
                fontSize: '1rem',
                border: 'none',
                outline: 'none',
                backgroundColor: '#fff',
                color: '#1a202c',
              }}
            />
            <button style={{
              padding: '1rem 2rem',
              backgroundColor: '#00bcd4',
              color: '#fff',
              border: 'none',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
            }}>
              Rechercher
            </button>
          </div>

          {/* VILLES PRINCIPALES */}
          <div style={{ marginTop: '2rem' }}>
            <p style={{
              color: '#cbd5e0',
              fontSize: '0.85rem',
              fontWeight: '600',
              letterSpacing: '0.1em',
              marginBottom: '0.75rem',
              textTransform: 'uppercase',
            }}>
              Villes principales
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {['Cotonou', 'Abomey-Calavi', 'Porto-Novo', 'Parakou', 'Abomey', 'Ouidah'].map((ville) => (
                <button
                  key={ville}
                  style={{
                    padding: '0.4rem 1rem',
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '999px',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  📍 {ville}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}