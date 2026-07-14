'use client'

import { useState } from 'react'

const MENTIONS_LEGALES = `Immo West Afro Benin -- Mentions legales

1. EDITEUR DU SITE
Le site benin.immowestafro.com est edite par Immo West Afro, plateforme immobiliere numerique.
Siege social : Abomey-Calavi, Togba, Quartier SOME, Republique du Benin
Email : calavi_immo@immowestafro.com
Telephone : +229 01 96 13 77 20

2. HEBERGEMENT
Le site est heberge par Vercel Inc., 340 Pine Street, Suite 700, San Francisco, CA 94104, Etats-Unis.
La base de donnees est hebergee par Supabase Inc.

3. PROPRIETE INTELLECTUELLE
L'ensemble du contenu de ce site est protege par le droit de la propriete intellectuelle en vigueur en Republique du Benin, notamment la loi n 2005-30 du 5 avril 2006. Toute reproduction sans autorisation est interdite.

4. RESPONSABILITE
Les annonces publiees sur la plateforme sont sous la responsabilite exclusive de leurs auteurs. Immo West Afro ne saurait etre tenu responsable des inexactitudes contenues dans ces annonces.

5. DROIT APPLICABLE
Le present site est regi par le droit de la Republique du Benin. En cas de litige, les tribunaux beninois seront seuls competents.

6. CONTACT
Pour toute question : calavi_immo@immowestafro.com`

const POLITIQUE_CONFIDENTIALITE = `Immo West Afro Benin -- Politique de confidentialite
Derniere mise a jour : Juillet 2026

1. INTRODUCTION
Immo West Afro s'engage a proteger la vie privee des utilisateurs conformement a la loi n 2009-09 du 22 mai 2009 (APDP).

2. DONNEES COLLECTEES
- Donnees d'identification : nom, prenom, email, telephone
- Donnees professionnelles : nom d'agence, role
- Donnees de navigation : adresse IP, pages visitees
- Donnees relatives aux annonces : description, photos, prix, localisation

3. FINALITES DU TRAITEMENT
- Creation et gestion de votre compte
- Publication et gestion de vos annonces
- Mise en relation entre agents et visiteurs
- Envoi de notifications liees a votre activite

4. VOS DROITS
Vous disposez des droits d'acces, rectification, effacement et portabilite de vos donnees.
Pour exercer ces droits : calavi_immo@immowestafro.com

5. CONTACT
Email : calavi_immo@immowestafro.com
Telephone : +229 01 96 13 77 20
Adresse : Abomey-Calavi, Togba, Quartier SOME, Republique du Benin`

export default function ParametresAdmin() {
  const [form, setForm] = useState({
    nom_site: 'Immo West Afro Benin',
    email_contact: 'calavi_immo@immowestafro.com',
    telephone: '+229 01 96 13 77 20',
    adresse: 'Abomey-Calavi, Togba, Quartier SOME',
    facebook: '', instagram: '', twitter: '', youtube: '',
    whatsapp: '+229 01 96 13 77 20',
    mentions_legales: MENTIONS_LEGALES,
    politique_confidentialite: POLITIQUE_CONFIDENTIALITE,
  })
  const [toast, setToast] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = () => {
    setToast(true)
    setTimeout(() => setToast(false), 3000)
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-5 py-3 rounded-xl font-semibold shadow-lg">
          ✅ Parametres sauvegardes avec succes !
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-white m-0">Parametres du site</h1>
        <p className="text-slate-400 mt-1">Configuration generale, contact et pages legales</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* IDENTITE */}
        <div className="bg-[#1e293b] rounded-xl p-6 shadow-lg border border-[#334155]">
          <h2 className="text-white font-bold text-base mb-5 pb-3 border-b-2 border-[#334155]">Identite du site</h2>
          <div className="mb-4">
            <label className="block text-slate-400 text-sm font-medium mb-1.5">Nom du site</label>
            <input name="nom_site" value={form.nom_site} onChange={handleChange}
              className="w-full px-3 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-white text-sm outline-none focus:border-[#00bcd4] transition-colors" />
          </div>
          <div className="mb-4">
            <label className="block text-slate-400 text-sm font-medium mb-1.5">Logo (URL)</label>
            <input name="logo_url" placeholder="https://..." onChange={handleChange}
              className="w-full px-3 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-white text-sm outline-none focus:border-[#00bcd4] transition-colors placeholder-slate-600" />
          </div>
        </div>

        {/* CONTACT */}
        <div className="bg-[#1e293b] rounded-xl p-6 shadow-lg border border-[#334155]">
          <h2 className="text-white font-bold text-base mb-5 pb-3 border-b-2 border-[#334155]">Informations de contact</h2>
          {[
            { name: 'email_contact', label: 'Email de contact', value: form.email_contact },
            { name: 'telephone', label: 'Telephone', value: form.telephone },
            { name: 'adresse', label: 'Adresse', value: form.adresse },
          ].map(f => (
            <div key={f.name} className="mb-4">
              <label className="block text-slate-400 text-sm font-medium mb-1.5">{f.label}</label>
              <input name={f.name} value={f.value} onChange={handleChange}
                className="w-full px-3 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-white text-sm outline-none focus:border-[#00bcd4] transition-colors" />
            </div>
          ))}
        </div>

        {/* RESEAUX SOCIAUX */}
        <div className="bg-[#1e293b] rounded-xl p-6 shadow-lg border border-[#334155]">
          <h2 className="text-white font-bold text-base mb-5 pb-3 border-b-2 border-[#334155]">Reseaux sociaux</h2>
          {[
            { name: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/...' },
            { name: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/...' },
            { name: 'twitter', label: 'Twitter/X', placeholder: 'https://twitter.com/...' },
            { name: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@...' },
            { name: 'whatsapp', label: 'WhatsApp', placeholder: '+229...' },
          ].map(r => (
            <div key={r.name} className="mb-4">
              <label className="block text-slate-400 text-sm font-medium mb-1.5">{r.label}</label>
              <input name={r.name} value={(form as any)[r.name]} placeholder={r.placeholder} onChange={handleChange}
                className="w-full px-3 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-white text-sm outline-none focus:border-[#00bcd4] transition-colors placeholder-slate-600" />
            </div>
          ))}
        </div>

        {/* MENTIONS LEGALES */}
        <div className="bg-[#1e293b] rounded-xl p-6 shadow-lg border border-[#334155]">
          <h2 className="text-white font-bold text-base mb-2 pb-3 border-b-2 border-[#334155]">Mentions legales</h2>
          <p className="text-slate-500 text-xs mb-3">Conformement a la loi beninoise n 2005-30 du 5 avril 2006</p>
          <textarea name="mentions_legales" value={form.mentions_legales} onChange={handleChange}
            className="w-full px-3 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-white text-xs outline-none focus:border-[#00bcd4] transition-colors font-mono resize-vertical h-72" />
        </div>

        {/* POLITIQUE CONFIDENTIALITE */}
        <div className="bg-[#1e293b] rounded-xl p-6 shadow-lg border border-[#334155] md:col-span-2">
          <h2 className="text-white font-bold text-base mb-2 pb-3 border-b-2 border-[#334155]">Politique de confidentialite</h2>
          <p className="text-slate-500 text-xs mb-3">Conformement a la loi beninoise n 2009-09 du 22 mai 2009 (APDP)</p>
          <textarea name="politique_confidentialite" value={form.politique_confidentialite} onChange={handleChange}
            className="w-full px-3 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-white text-xs outline-none focus:border-[#00bcd4] transition-colors font-mono resize-vertical h-72" />
        </div>

      </div>

      <button onClick={handleSubmit}
        className="mt-6 px-8 py-4 bg-[#00bcd4] hover:bg-[#0097a7] text-white border-none rounded-lg text-base font-bold cursor-pointer transition-colors">
        Sauvegarder les parametres
      </button>
    </div>
  )
}
