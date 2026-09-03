import { Link } from "react-router-dom";
import PATHS from "@/routes/paths";

function Footer({ mobile = false }) {
  const contentClass = mobile ? "container-app py-5" : "container-app py-12";
  const gridClass = mobile ? "grid grid-cols-2 gap-x-5 gap-y-6" : "grid grid-cols-2 gap-10 md:grid-cols-4";
  const headingClass = mobile
    ? "mb-[10px] text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400"
    : "mb-3 text-[13px] font-extrabold uppercase tracking-widest text-slate-400";
  const linkListClass = mobile ? "space-y-3 text-sm" : "space-y-2 text-[15px] leading-relaxed";
  const iconClass = mobile ? "h-4 w-4 flex-shrink-0" : "h-4 w-4 flex-shrink-0";
  const contactGapClass = mobile ? "gap-2" : "gap-1.5";

  return (
    <footer className={`bg-[#172337] text-slate-300 mt-0${mobile ? ' mobile-footer' : ''}`}>

      {/* ── Back-to-top strip ─────────────────────────────────────────────── */}
      <div
        className={`bg-[#232f3e] py-3 text-center text-sm text-white cursor-pointer hover:bg-[#2d3f52] transition${mobile ? ' mobile-footer__back-to-top' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        Back to top
      </div>

      {/* ── Main footer grid ──────────────────────────────────────────────── */}
      <div className={contentClass}>
        <div className={gridClass}>

          {/* About */}
          <div className={mobile ? 'mobile-footer__section' : undefined}>
            <h4 className={headingClass}>About</h4>
            <ul className={linkListClass}>
              <li><Link to={PATHS.CUSTOMER_SERVICE} className="hover:text-white transition">About ShopApp</Link></li>
              <li><Link to={PATHS.CUSTOMER_SERVICE} className="hover:text-white transition">Careers</Link></li>
              <li><Link to={PATHS.CUSTOMER_SERVICE} className="hover:text-white transition">Press</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div className={mobile ? 'mobile-footer__section' : undefined}>
            <h4 className={headingClass}>Help</h4>
            <ul className={linkListClass}>
              <li><Link to={PATHS.ORDERS} className="hover:text-white transition">Track Order</Link></li>
              <li><Link to={PATHS.CUSTOMER_SERVICE} className="hover:text-white transition">Payments</Link></li>
              <li><Link to={PATHS.CUSTOMER_SERVICE} className="hover:text-white transition">Shipping</Link></li>
              <li><Link to={PATHS.CUSTOMER_SERVICE} className="hover:text-white transition">Returns</Link></li>
              <li><Link to={PATHS.CUSTOMER_SERVICE} className="hover:text-white transition">FAQ</Link></li>
            </ul>
          </div>

          {/* Policy */}
          <div className={mobile ? 'mobile-footer__section' : undefined}>
            <h4 className={headingClass}>Policy</h4>
            <ul className={linkListClass}>
              <li><Link to={PATHS.CUSTOMER_SERVICE} className="hover:text-white transition">Return Policy</Link></li>
              <li><Link to={PATHS.CUSTOMER_SERVICE} className="hover:text-white transition">Terms of Use</Link></li>
              <li><Link to={PATHS.CUSTOMER_SERVICE} className="hover:text-white transition">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact Us */}
          <div className={mobile ? 'mobile-footer__section' : undefined}>
            <h4 className={headingClass}>Contact Us</h4>
            <ul className={linkListClass}>
              <li>
                <a
                  href="mailto:016adityasingh@gmail.com"
                  className={`flex items-center ${contactGapClass} hover:text-white transition`}
                >
                  <svg className={iconClass} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  Email Aditya
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/aditya016"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center ${contactGapClass} hover:text-white transition`}
                >
                  <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/016Aditya"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center ${contactGapClass} hover:text-white transition`}
                >
                  <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23a11.52 11.52 0 0 1 3-.405c1.02.005 2.045.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12z" />
                  </svg>
                  GitHub
                </a>
              </li>
              <li>
                <Link
                  to={PATHS.CUSTOMER_SERVICE}
                  className={`flex items-center ${contactGapClass} text-[#ff9900] hover:text-[#e88a00] transition font-medium`}
                >
                  <svg className={iconClass} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 1 1-12.728 0M12 3v9" />
                  </svg>
                  Customer Service
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* ── Bottom bar ──────────────────────────────────────────────────── */}
        <div className={`${mobile ? 'mt-4' : 'mt-10'} border-t border-slate-700 pt-6 flex flex-col items-center ${mobile ? 'gap-2.5' : 'gap-2'}${mobile ? ' mobile-footer__brand' : ''}`}>
          {/* Logo */}
          <div className="flex flex-col items-center">
            <span className={`${mobile ? 'text-lg' : 'text-[19px]'} font-extrabold text-white tracking-tight leading-none${mobile ? ' mobile-footer__logo' : ''}`}>
              shop<span className="text-[#ff9900]">App</span>
            </span>
            <span className="text-[10px] text-slate-400 leading-none">.in</span>
          </div>
          <p className={`${mobile ? 'text-xs' : 'text-[13px]'} text-slate-500 text-center${mobile ? ' mobile-footer__copyright' : ''}`}>
            © 2026 ShopApp.in — Built by{" "}
            <a
              href="https://www.linkedin.com/in/aditya016"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#ff9900] hover:underline"
            >
              Aditya Singh
            </a>
            . All rights reserved.
          </p>
        </div>
      </div>

    </footer>
  );
}

export default Footer;
