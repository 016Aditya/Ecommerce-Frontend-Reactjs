const REASONS = [
  {
    title: 'Secure Payments',
    body: 'Every checkout is SSL encrypted end-to-end. We never store your card details.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: 'Easy Returns',
    body: 'Changed your mind? Return most items within 30 days, hassle-free.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 4v6h6" />
        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
      </svg>
    ),
  },
  {
    title: 'Real-Time Order Tracking',
    body: 'Follow every order from confirmation to delivery on a live status timeline.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 3h15v13H1z" />
        <path d="M16 8h4l3 3v5h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    title: 'Wide Selection',
    body: 'Electronics, fashion, home & kitchen, books and sports — all in one place.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
];

function WhyShopWithUs() {
  return (
    <section
      aria-label="Why shop with us"
      style={{
        width: '100%',
        maxWidth: 'calc(100% - 48px)',
        marginInline: 'auto',
        paddingBlock: '8px 21px',
      }}
    >
      <h2
        style={{
          color: 'var(--text-primary)',
          fontSize: '22px',
          fontWeight: 700,
          marginBottom: '4px',
        }}
      >
        Why Shop With Us?
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', marginBottom: '16px' }}>
        The details that make ordering here easy to trust.
      </p>

      <div
        className="grid grid-cols-2 gap-x-6 gap-y-5 lg:grid-cols-4"
        style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '20px',
        }}
      >
        {REASONS.map((reason) => (
          <div key={reason.title} className="flex items-start" style={{ gap: '10px' }}>
            <div style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '2px' }} aria-hidden="true">
              <div style={{ width: '18px', height: '18px' }}>{reason.icon}</div>
            </div>
            <div>
              <h3 style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 700, marginBottom: '2px' }}>
                {reason.title}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12.5px', lineHeight: 1.5 }}>
                {reason.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default WhyShopWithUs;
