const BADGES = [
  {
    title: 'Free Delivery',
    subtitle: 'On orders above ₹499',
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
    title: 'Easy Returns',
    subtitle: '30-day hassle-free policy',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 4v6h6" />
        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
      </svg>
    ),
  },
  {
    title: 'Secure Payments',
    subtitle: 'SSL encrypted checkout',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: 'Quick Dispatch',
    subtitle: 'Delivered in 3–7 business days',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
];

function TrustBadges() {
  return (
    <section
      aria-label="Why shop with us"
      style={{
        width: '100%',
        maxWidth: 'calc(100% - 48px)',
        marginInline: 'auto',
        paddingBlock: '4px 21px',
      }}
    >
      <div
        className="grid grid-cols-2 sm:grid-cols-4"
        style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-sm)',
          padding: '18px',
          gap: '16px',
        }}
      >
        {BADGES.map((badge) => (
          <div
            key={badge.title}
            className="flex items-center"
            style={{ gap: '12px', minWidth: 0 }}
          >
            <div
              style={{
                display: 'grid',
                placeItems: 'center',
                width: '44px',
                height: '44px',
                minWidth: '44px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-subtle)',
                color: 'var(--accent)',
              }}
              aria-hidden="true"
            >
              <div style={{ width: '22px', height: '22px' }}>{badge.icon}</div>
            </div>
            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  color: 'var(--text-primary)',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  lineHeight: 1.25,
                }}
              >
                {badge.title}
              </p>
              <p
                className="text-truncate-mobile"
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '12px',
                  lineHeight: 1.3,
                  marginTop: '1px',
                }}
              >
                {badge.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default TrustBadges;
