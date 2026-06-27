export default function SupportAdmin() {
  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ color: '#0f172a', fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>Support & Maintenance</h1>
        <p style={{ color: '#64748b', margin: '0.25rem 0 0' }}>Aide, logs et maintenance du système</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div style={cardStyle}>
          <h2 style={sectionTitle}>📊 État du système</h2>
          {[
            { label: 'Serveur Vercel', status: '✅ Opérationnel', color: '#dcfce7', textColor: '#16a34a' },
            { label: 'Base de données Supabase', status: '✅ Connectée', color: '#dcfce7', textColor: '#16a34a' },
            { label: 'Stockage fichiers', status: '✅ Disponible', color: '#dcfce7', textColor: '#16a34a' },
            { label: 'Emails transactionnels', status: '⚠️ À configurer', color: '#fef3c7', textColor: '#d97706' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px', marginBottom: '0.5rem' }}>
              <span style={{ color: '#374151', fontSize: '0.875rem' }}>{item.label}</span>
              <span style={{ backgroundColor: item.color, color: item.textColor, padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600' }}>{item.status}</span>
            </div>
          ))}
        </div>

        <div style={cardStyle}>
          <h2 style={sectionTitle}>🛠️ Actions de maintenance</h2>
          {[
            { label: '🗄️ Sauvegarder la base de données', desc: 'Export Supabase', color: '#3b82f6' },
            { label: '🔄 Régénérer le sitemap', desc: 'Mettre à jour /sitemap.xml', color: '#10b981' },
            { label: '🧹 Vider le cache', desc: 'Redéployer sur Vercel', color: '#f59e0b' },
            { label: '📧 Tester les emails', desc: 'Vérifier la configuration SMTP', color: '#8b5cf6' },
          ].map(action => (
            <div key={action.label} style={{ padding: '0.75rem 1rem', backgroundColor: '#f8fafc', borderRadius: '8px', marginBottom: '0.5rem', cursor: 'pointer', border: `1px solid ${action.color}20` }}>
              <p style={{ color: '#0f172a', fontWeight: '600', margin: 0, fontSize: '0.875rem' }}>{action.label}</p>
              <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: '0.2rem 0 0' }}>{action.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ ...cardStyle, gridColumn: '1/-1' }}>
          <h2 style={sectionTitle}>❓ Aide & Documentation</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {[
              { icon: '📚', title: 'Documentation Next.js', url: 'https://nextjs.org/docs' },
              { icon: '🗄️', title: 'Documentation Supabase', url: 'https://supabase.com/docs' },
              { icon: '🚀', title: 'Dashboard Vercel', url: 'https://vercel.com/dashboard' },
              { icon: '📧', title: 'Support technique', url: 'mailto:contact@immowestafro.com' },
            ].map(link => (
              <a key={link.title} href={link.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', backgroundColor: '#f8fafc', borderRadius: '10px', padding: '1rem', border: '1px solid #e2e8f0', display: 'block' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{link.icon}</div>
                <div style={{ color: '#0f172a', fontWeight: '600', fontSize: '0.875rem' }}>{link.title}</div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const cardStyle: React.CSSProperties = { backgroundColor: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }
const sectionTitle: React.CSSProperties = { color: '#0f172a', fontSize: '1rem', fontWeight: '700', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '2px solid #f1f5f9' }