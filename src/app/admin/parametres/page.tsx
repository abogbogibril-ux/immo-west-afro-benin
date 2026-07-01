'use client'

import { useState } from 'react'

const MENTIONS_LEGALES = `Immo West Afro Benin -- Mentions legales

1. EDITEUR DU SITE
Le site benin.immowestafro.com est edite par Immo West Afro, plateforme immobiliere numerique.
Siege social : Abomey-Calavi, Togba, Quartier SOME, Republique du Benin
Email : abogbogibril@gmail.com
Telephone : +229 01 96 13 77 20

2. HEBERGEMENT
Le site est heberge par Vercel Inc., 340 Pine Street, Suite 700, San Francisco, CA 94104, Etats-Unis.
La base de donnees est hebergee par Supabase Inc.

3. PROPRIETE INTELLECTUELLE
L'ensemble du contenu de ce site (textes, images, logos, graphismes) est protege par le droit de la propriete intellectuelle en vigueur en Republique du Benin, notamment la loi n 2005-30 du 5 avril 2006 relative a la protection du droit d'auteur et des droits voisins en Republique du Benin. Toute reproduction, representation ou diffusion, en tout ou partie, du contenu de ce site sur quelque support que ce soit, sans l'autorisation expresse et prealable d'Immo West Afro, est interdite.

4. RESPONSABILITE
Immo West Afro s'efforce d'assurer l'exactitude et la mise a jour des informations diffusees sur ce site. Les annonces publiees sur la plateforme sont sous la responsabilite exclusive de leurs auteurs. Immo West Afro ne saurait etre tenu responsable des inexactitudes, omissions ou erreurs contenues dans ces annonces.

5. DROIT APPLICABLE
Le present site et ses conditions d'utilisation sont regis par le droit de la Republique du Benin. En cas de litige, les tribunaux beninois seront seuls competents.

6. CONTACT
Pour toute question : abogbogibril@gmail.com`

const POLITIQUE_CONFIDENTIALITE = `Immo West Afro Benin -- Politique de confidentialite
Derniere mise a jour : Juillet 2026

1. INTRODUCTION
Immo West Afro s'engage a proteger la vie privee des utilisateurs de la plateforme benin.immowestafro.com. La presente politique est etablie conformement a la loi n 2009-09 du 22 mai 2009 portant protection des donnees a caractere personnel en Republique du Benin et aux directives de l'Autorite de Protection des Donnees Personnelles (APDP).

2. DONNEES COLLECTEES
- Donnees d'identification : nom, prenom, adresse email, numero de telephone
- Donnees professionnelles : nom d'agence, role (agent, proprietaire)
- Donnees de navigation : adresse IP, pages visitees, duree de visite
- Donnees relatives aux annonces : description des biens, photos, prix, localisation
- Donnees de contact : messages echanges via la plateforme

3. FINALITES DU TRAITEMENT
- Creation et gestion de votre compte utilisateur
- Publication et gestion de vos annonces immobilieres
- Mise en relation entre agents/proprietaires et visiteurs
- Envoi de notifications liees a votre activite sur la plateforme
- Amelioration de nos services et de l'experience utilisateur
- Respect de nos obligations legales

4. BASE LEGALE DU TRAITEMENT
- Votre consentement explicite lors de l'inscription
- L'execution du contrat d'utilisation de la plateforme
- Le respect de nos obligations legales en Republique du Benin

5. DESTINATAIRES DES DONNEES
Vos donnees sont destinees exclusivement a l'equipe d'Immo West Afro et a nos prestataires techniques soumis a des obligations de confidentialite. Nous ne vendons, ne louons et ne cedons jamais vos donnees personnelles a des tiers a des fins commerciales.

6. DUREE DE CONSERVATION
- Pendant toute la duree de votre inscription sur la plateforme
- Pendant 3 ans apres la cloture de votre compte pour les donnees de transaction
- Conformement aux obligations legales applicables en Republique du Benin

7. VOS DROITS
Conformement a la loi n 2009-09 du 22 mai 2009, vous disposez des droits suivants :
- Droit d'acces a vos donnees personnelles
- Droit de rectification des donnees inexactes
- Droit a l'effacement de vos donnees
- Droit d'opposition au traitement de vos donnees
- Droit a la portabilite de vos donnees
Pour exercer ces droits : abogbogibril@gmail.com

8. SECURITE DES DONNEES
Nous mettons en oeuvre les mesures techniques et organisationnelles appropriees pour proteger vos donnees contre tout acces non autorise. Les communications sont chiffrees via le protocole HTTPS.

9. COOKIES
Notre site utilise uniquement des cookies techniques necessaires au fonctionnement de la plateforme.

10. AUTORITE DE CONTROLE
Vous avez le droit de deposer une reclamation aupres de l'Autorite de Protection des Donnees Personnelles (APDP) du Benin.

11. CONTACT
Email : abogbogibril@gmail.com
Telephone : +229 01 96 13 77 20
Adresse : Abomey-Calavi, Togba, Quartier SOME, Republique du Benin`

export default function ParametresAdmin() {
  const [form, setForm] = useState({
    nom_site: 'Immo West Afro Benin',
    email_contact: 'abogbogibril@gmail.com',
    telephone: '+229 01 96 13 77 20',
    adresse: 'Abomey-Calavi, Togba, Quartier SOME',
    facebook: '', instagram: '', twitter: '',
    whatsapp: '+229 01 96 13 77 20',
    mentions_legales: MENTIONS_LEGALES,
    politique_confidentialite: POLITIQUE_CONFIDENTIALITE,
  })
  const [sauvegarde, setSauvegarde] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = () => {
    setSauvegarde(true)
    setTimeout(() => setSauvegarde(false), 3000)
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ color: '#0f172a', fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>Parametres du site</h1>
        <p style={{ color: '#64748b', margin: '0.25rem 0 0' }}>Configuration generale, contact et pages legales</p>
      </div>

      {sauvegarde && (
        <div style={{ backgroundColor: '#dcfce7', color: '#16a34a', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: '600' }}>
          Parametres sauvegardes avec succes !
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

        {/* IDENTITE */}
        <div style={cardStyle}>
          <h2 style={sectionTitle}>Identite du site</h2>
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Nom du site</label>
            <input name="nom_site" value={form.nom_site} onChange={handleChange} style={inputStyle} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Logo (URL)</label>
            <input name="logo_url" placeholder="https://..." onChange={handleChange} style={inputStyle} />
          </div>
        </div>

        {/* CONTACT */}
        <div style={cardStyle}>
          <h2 style={sectionTitle}>Informations de contact</h2>
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Email de contact</label>
            <input name="email_contact" value={form.email_contact} onChange={handleChange} style={inputStyle} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Telephone</label>
            <input name="telephone" value={form.telephone} onChange={handleChange} style={inputStyle} />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Adresse</label>
            <input name="adresse" value={form.adresse} onChange={handleChange} style={inputStyle} />
          </div>
        </div>

        {/* RESEAUX SOCIAUX */}
        <div style={cardStyle}>
          <h2 style={sectionTitle}>Reseaux sociaux</h2>
          {[
            { name: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/...' },
            { name: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/...' },
            { name: 'twitter', label: 'Twitter/X', placeholder: 'https://twitter.com/...' },
            { name: 'whatsapp', label: 'WhatsApp', placeholder: '+229...' },
          ].map(r => (
            <div key={r.name} style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>{r.label}</label>
              <input name={r.name} value={(form as any)[r.name]} placeholder={r.placeholder} onChange={handleChange} style={inputStyle} />
            </div>
          ))}
        </div>

        {/* MENTIONS LEGALES */}
        <div style={cardStyle}>
          <h2 style={sectionTitle}>Mentions legales</h2>
          <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
            Conformement a la loi beninoise n 2005-30 du 5 avril 2006
          </p>
          <textarea
            name="mentions_legales"
            value={form.mentions_legales}
            onChange={handleChange}
            style={{ ...inputStyle, height: '300px', resize: 'vertical', fontFamily: 'monospace', fontSize: '0.8rem' }}
          />
        </div>

        {/* POLITIQUE CONFIDENTIALITE */}
        <div style={cardStyle}>
          <h2 style={sectionTitle}>Politique de confidentialite</h2>
          <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
            Conformement a la loi beninoise n 2009-09 du 22 mai 2009 (APDP)
          </p>
          <textarea
            name="politique_confidentialite"
            value={form.politique_confidentialite}
            onChange={handleChange}
            style={{ ...inputStyle, height: '300px', resize: 'vertical', fontFamily: 'monospace', fontSize: '0.8rem' }}
          />
        </div>

      </div>

      <button onClick={handleSubmit} style={{
        marginTop: '1.5rem', padding: '1rem 2rem', backgroundColor: '#00bcd4',
        color: '#fff', border: 'none', borderRadius: '8px',
        fontSize: '1rem', fontWeight: '700', cursor: 'pointer',
      }}>
        Sauvegarder les parametres
      </button>
    </div>
  )
}

const cardStyle: React.CSSProperties = { backgroundColor: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }
const sectionTitle: React.CSSProperties = { color: '#0f172a', fontSize: '1rem', fontWeight: '700', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '2px solid #f1f5f9' }
const labelStyle: React.CSSProperties = { display: 'block', color: '#374151', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.4rem' }
const inputStyle: React.CSSProperties = { width: '100%', padding: '0.6rem 0.75rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }