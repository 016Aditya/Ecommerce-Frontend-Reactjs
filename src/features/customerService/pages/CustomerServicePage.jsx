import { Link } from "react-router-dom";
import PATHS from "@/routes/paths";
import SEO from "@/components/common/SEO";
import { useSEO } from "@/hooks/useSEO";

/*
  Dark mode fix:
  - All bg-white, bg-[#f3f3f3], text-[#131921], text-slate-* replaced with CSS variables
  - Hero banner uses var(--navbar-bg) so it looks correct in dark mode
  - Cards use var(--card-bg) + var(--border-color)
  - Hover states use var(--card-bg-elevated)
  - Tag pills use var(--accent-subtle) + var(--accent)
  - All text uses var(--text-primary) / var(--text-secondary)
*/

// ── Social / contact card data ───────────────────────────────────────────────
const CONTACT_CARDS = [
  {
    id: "email",
    label: "Email",
    value: "016adityasingh@gmail.com",
    href: "mailto:016adityasingh@gmail.com",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
    external: false,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    value: "linkedin.com/in/aditya016",
    href: "https://www.linkedin.com/in/aditya016",
    icon: (
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    external: true,
  },
  {
    id: "github",
    label: "GitHub",
    value: "github.com/016Aditya",
    href: "https://github.com/016Aditya",
    icon: (
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23a11.52 11.52 0 0 1 3-.405c1.02.005 2.045.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12z" />
      </svg>
    ),
    external: true,
  },
];

const FAQ = [
  { q: "How do I track my order?", a: "Go to Account \u2192 My Orders to view real-time status of all your orders." },
  { q: "What is the return policy?", a: "We offer a 30-day hassle-free return policy on all products. Contact us via email to initiate a return." },
  { q: "How long does delivery take?", a: "Standard delivery takes 3\u20137 business days. Express delivery (1\u20132 days) is available at checkout." },
  { q: "Are my payments secure?", a: "Yes. All payments are processed over HTTPS with industry-standard encryption. We never store your card details." },
];

// ── Tech stack data ──────────────────────────────────────────────────────────
const TECH_STACK = [
  {
    category: "Frontend",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    items: [
      "React.js",
      "Vite",
      "Tailwind CSS",
      "React Router DOM",
      "TanStack Query",
      "Zustand",
      "Axios",
      "React Hot Toast",
      "React Toastify",
      "Cloudflare Turnstile",
      "Yup Validation",
    ],
  },
  {
    category: "Backend",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
    items: [
      "Spring Boot",
      "Spring Security",
      "MongoDB",
      "Spring Data MongoDB",
      "JWT Authentication",
      "Google OAuth2",
      "REST API",
      "Bucket4j Rate Limiting",
      "ModelMapper",
      "Jakarta Validation",
      "Lombok",
    ],
  },
];

/* Shared card style helper */
const cardStyle = {
  backgroundColor: "var(--card-bg)",
  border: "1px solid var(--border-color)",
  boxShadow: "var(--shadow-sm)",
};

function CustomerServicePage() {
  const { seoProps } = useSEO({
    title: 'Customer Service | Shop Fashion',
    description: 'Get help with your orders, returns, and more. Contact our customer service team.',
  });

  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <SEO {...seoProps} />
      {/* ── Hero Banner ─────────────────────────────────────────────────────── */}
      <div
        className="py-8 text-center"
        style={{ backgroundColor: "var(--navbar-bg)" }}
      >
        <div className="mb-3 inline-flex flex-col items-center">
          <span className="text-4xl font-extrabold tracking-tight leading-none" style={{ color: "white" }}>
            shop<span style={{ color: "var(--accent)" }}>App</span>
          </span>
          <span className="text-sm leading-none" style={{ color: "var(--text-tertiary)" }}>.in</span>
        </div>
        <h1 className="mt-4 text-2xl font-bold" style={{ color: "white" }}>
          Customer Service
        </h1>
        <p className="mt-2 text-sm max-w-md mx-auto" style={{ fontSize: "14px", color: "var(--footer-text)" }}>
          We're here to help with orders, returns, payments, and account support.
        </p>
      </div>

      <div className="container-app pt-10 pb-7 space-y-5">

        {/* ── About ShopApp ───────────────────────────────────────────── */}
        <section className="rounded-xl p-6 md:p-8" style={cardStyle}>
          <h2 className="text-lg font-bold mb-5" style={{ color: "var(--text-primary)" }}>
            About ShopApp.in
          </h2>

          <div style={{ maxWidth: "940px" }}>
            {/* Paragraph 1 */}
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              <strong style={{ color: "var(--text-primary)" }}>ShopApp.in</strong> is a modern full-stack eCommerce
              platform built to deliver a fast, secure, and seamless online shopping experience. Customers can browse
              products by category and subcategory, search for items, manage wishlists and carts, place orders
              securely, and track their purchases through an intuitive interface.
            </p>

            {/* Paragraph 2 */}
            <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              The platform is powered by a{" "}
              <span className="font-medium" style={{ color: "var(--accent)" }}>React.js</span> frontend and a{" "}
              <span className="font-medium" style={{ color: "var(--accent)" }}>Spring Boot + MongoDB</span> backend,
              featuring{" "}
              <span className="font-medium" style={{ color: "var(--accent)" }}>JWT Authentication</span>,{" "}
              <span className="font-medium" style={{ color: "var(--accent)" }}>Google OAuth2 Login</span>,{" "}
              RESTful APIs, secure user authentication, responsive design, and optimized performance. Every component
              has been designed with scalability, maintainability, and real-world production practices in mind.
            </p>

            {/* Paragraph 3 */}
            <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              ShopApp.in was designed and developed by{" "}
              <strong style={{ color: "var(--text-primary)" }}>Aditya Singh</strong> as a production-grade full-stack
              project showcasing modern web development, clean architecture, secure backend development, and responsive
              user experience.
            </p>
          </div>

          {/* ── Technologies Used ──────────────────────────────────────── */}
          <div
            className="mt-6 rounded-xl p-5"
            style={{
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border-color)",
            }}
          >
            <h3
              className="text-sm font-bold uppercase tracking-widest mb-5"
              style={{ color: "var(--text-tertiary)" }}
            >
              Technologies Used
            </h3>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {TECH_STACK.map(({ category, icon, items }) => (
                <div key={category}>
                  {/* Category label */}
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="flex items-center justify-center h-6 w-6 rounded-md"
                      style={{
                        backgroundColor: "var(--accent-subtle)",
                        color: "var(--accent)",
                      }}
                    >
                      {icon}
                    </span>
                    <span
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {category}
                    </span>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    {items.map((tech) => (
                      <span
                        key={tech}
                        className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
                        style={{
                          backgroundColor: "var(--accent-subtle)",
                          color: "var(--accent)",
                          border: "1px solid var(--accent-border)",
                          letterSpacing: "0.01em",
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* ── /Technologies Used ─────────────────────────────────────── */}
        </section>

        {/* ── Contact Us ────────────────────────────────────────────────── */}
        <section className="rounded-xl p-6 md:p-8" style={cardStyle}>
          <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>
            Contact Us
          </h2>
          <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
            Reach out on any of the platforms below.
          </p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {CONTACT_CARDS.map((card) => (
              <a
                key={card.id}
                href={card.href}
                target={card.external ? "_blank" : undefined}
                rel={card.external ? "noopener noreferrer" : undefined}
                className="group flex items-center gap-4 border p-4 transition-all duration-180"
                style={{
                  borderRadius: "18px",
                  backgroundColor: "var(--bg-secondary)",
                  borderColor: "var(--border-color)",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent)";
                  e.currentTarget.style.backgroundColor = "var(--card-bg-elevated)";
                  e.currentTarget.style.boxShadow = "var(--shadow-md)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-color)";
                  e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <span
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-colors duration-180"
                  style={{
                    backgroundColor: "color-mix(in srgb, var(--accent) 9%, transparent)",
                    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.12)",
                    color: "var(--accent)",
                  }}
                >
                  {card.icon}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>
                    {card.label}
                  </p>
                  <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                    {card.value}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* ── Source Code ─────────────────────────────────────────────────── */}
        <section className="rounded-xl p-6 md:p-8" style={cardStyle}>
          <h2 className="text-lg font-bold mb-6" style={{ color: "var(--text-primary)" }}>
            Source Code
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {[
              {
                label: "Frontend",
                name: "Ecommerce-Frontend-Reactjs",
                href: "https://github.com/016Aditya/Ecommerce-Frontend-Reactjs",
              },
              {
                label: "Backend",
                name: "Spring-Data-MongoDb-ecommerce",
                href: "https://github.com/016Aditya/Spring-Data-MongoDb-ecommerce",
              },
            ].map((repo) => (
              <a
                key={repo.label}
                href={repo.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 border p-4 transition-all duration-180"
                style={{
                  borderRadius: "18px",
                  backgroundColor: "var(--bg-secondary)",
                  borderColor: "var(--border-color)",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent)";
                  e.currentTarget.style.backgroundColor = "var(--card-bg-elevated)";
                  e.currentTarget.style.boxShadow = "var(--shadow-md)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-color)";
                  e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <span
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-colors duration-180"
                  style={{
                    backgroundColor: "color-mix(in srgb, var(--accent) 9%, transparent)",
                    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.12)",
                    color: "var(--accent)",
                  }}
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23a11.52 11.52 0 0 1 3-.405c1.02.005 2.045.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12z" />
                  </svg>
                </span>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-tertiary)" }}>
                    {repo.label}
                  </p>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    {repo.name}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
        <section className="rounded-xl p-6 md:p-8" style={cardStyle}>
          <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>
            Frequently Asked Questions
          </h2>
          <div className="space-y-5">
            {FAQ.map((item, i) => (
              <div
                key={i}
                className="rounded-lg px-4"
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  paddingBlock: "8px",
                }}
              >
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {item.q}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Back to shopping ────────────────────────────────────────────── */}
        <div
          className="flex justify-center pb-4 mt-2 pt-6"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <Link
            to={PATHS.HOME}
            className="inline-flex items-center gap-2 rounded-lg px-8 py-2.5 text-sm font-bold transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "var(--button-primary)",
              color: "var(--button-primary-text)",
            }}
          >
            Back to Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}

export default CustomerServicePage;
