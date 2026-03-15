export default function DashboardPage() {
  const cards = [
    { label: 'Total Products', value: '0', color: '#3b82f6' },
    { label: 'Total Orders', value: '0', color: '#10b981' },
    { label: 'Pending Orders', value: '0', color: '#f59e0b' },
    { label: 'Shipped Orders', value: '0', color: '#8b5cf6' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>Overview</h2>

      {/* Stats cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
      }}>
        {cards.map((card) => (
          <div key={card.label} style={{
            backgroundColor: '#ffffff', borderRadius: '12px',
            border: '1px solid #e2e8f0', padding: '20px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {card.label}
            </div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: card.color, marginTop: '8px' }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder content */}
      <div style={{
        backgroundColor: '#ffffff', borderRadius: '12px',
        border: '1px dashed #cbd5e1', padding: '32px',
        textAlign: 'center', color: '#94a3b8', fontSize: '14px',
      }}>
        Recent orders and activity will appear here.
      </div>
    </div>
  );
}
