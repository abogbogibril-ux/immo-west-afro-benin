import Link from 'next/link'

const LIENS_UTILES = [
  { href: '/', label: 'Accueil' },
  { href: '/recherche', label: 'Recherche' },
  { href: '/contact', label: 'Forfaits & Plans' },
  { href: '/a-propos', label: '\u00C0 propos' },
  { href: '/contact', label: 'Contact' },
]

const VILLES = [
  'Cotonou', 'Porto-Novo', 'Parakou',
  'Abomey', 'Ouidah', 'Bohicon',
  'Djougou', 'Natitingou',
]

const CATEGORIES = [
  { href: '/recherche?type=maison', label: 'Maisons' },
  { href: '/recherche?type=appartement', label: 'Appartements' },
  { href: '/recherche?type=terrain', label: 'Terrains' },
  { href: '/recherche?type=villa', label: 'Villas' },
]

const LIENS_LEGAUX = [
  { href: '/cgu', label: 'Mentions l\u00E9gales' },
  { href: '/cgu', label: 'Politique de confidentialit\u00E9' },
  { href: '/cgu', label: 'Conditions d\u2019utilisation' },
]

const styleLien: React.CSSProperties = {
  color: '#8B949E',
  textDecoration: 'none',
  fontSize: '0.88rem',
  display: 'block',
  padding: '2px 0',
}

const styleTitre: React.CSSProperties = {
  color: '#FFFFFF',
  fontSize: '1rem',
  fontWeight: 600,
  marginBottom: '1rem',
}

const styleSocial: React.CSSProperties = {
  backgroundColor: '#1C2128',
  color: '#0099CC',
  width: 38,
  height: 38,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1rem',
  textDecoration: 'none',
  border: '1px solid #30363D',
  fontWeight: 700,
}

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: '#0D1117',
        borderTop: '1px solid #30363D',
        color: '#8B949E',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '3rem 1rem 2rem',
        }}
      >
        {/* Grille 4 colonnes */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
          }}
        >
          {/* Colonne 1 — Logo + description */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem',
              }}
            >
              <img src="/logo.png" alt="Immo West Afro" style={{ width: 40, height: 40, objectFit: 'contain' }} />













              <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '1rem' }}>
                Immo West Afro
              </span>
            </div>

            <p style={{ fontSize: '0.85rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>
              La plateforme de r&eacute;f&eacute;rence pour l&apos;immobilier au B&eacute;nin.
              Trouvez la maison, l&apos;appartement ou le terrain de vos r&ecirc;ves
              &agrave; Cotonou, Abomey-Calavi, Porto-Novo et partout dans le pays.
            </p>

            {/* Icônes réseaux sociaux */}
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <a
                href="https://facebook.com"
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
                style={styleSocial}
              >
                f
              </a>
              <a
                href="https://www.youtube.com/channel/UCOVR7DINxSXb7jDHi0hDV-A"
                aria-label="YouTube"
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...styleSocial, color: '#FF0000' }}
              >
                ▶
              </a>
              <a
                href="tel:+22901961377"
                aria-label="T&eacute;l&eacute;phone"
                style={styleSocial}
              >
                📞
              </a>
              <a
                href="mailto:calavi_immo@immowestafro.com"
                aria-label="Email"
                style={styleSocial}
              >
                ✉
              </a>
            </div>
          </div>

          {/* Colonne 2 — Liens utiles */}
          <div>
            <h3 style={styleTitre}>Liens utiles</h3>
            <ul
              style={{
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              {LIENS_UTILES.map((lien) => (
                <li key={lien.href}>
                  <Link href={lien.href} style={styleLien}>
                    {lien.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 3 — Villes */}
          <div>
            <h3 style={styleTitre}>Villes</h3>
            <ul
              style={{
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              {VILLES.map((ville) => (
                <li key={ville}>
                  <Link href={`/recherche?ville=${ville}`} style={styleLien}>
                    Immobilier &agrave; {ville}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 4 — Catégories + Contact */}
          <div>
            <h3 style={styleTitre}>Cat&eacute;gories</h3>
            <ul
              style={{
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                marginBottom: '1.5rem',
              }}
            >
              {CATEGORIES.map((cat) => (
                <li key={cat.href}>
                  <Link href={cat.href} style={styleLien}>
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 style={styleTitre}>Contact</h3>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                fontSize: '0.85rem',
              }}
            >
              <p>📍 Abomey-Calavi, B&eacute;nin</p>
              <a href="tel:+22901961377" style={styleLien}>
                📞 +229 01 96 13 77 20
              </a>
              <a
                href="mailto:calavi_immo@immowestafro.com"
                style={{ ...styleLien, wordBreak: 'break-all' }}
              >
                ✉️ calavi_immo@immowestafro.com
              </a>
            </div>
          </div>
        </div>

        {/* Bas du footer */}
        <div
          style={{
            borderTop: '1px solid #30363D',
            marginTop: '2.5rem',
            paddingTop: '1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <p style={{ fontSize: '0.85rem' }}>
            &copy; 2026 Immo West Afro. Tous droits r&eacute;serv&eacute;s.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {LIENS_LEGAUX.map((lien) => (
              <Link
                key={lien.href}
                href={lien.href}
                style={{ ...styleLien, fontSize: '0.82rem' }}
              >
                {lien.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
