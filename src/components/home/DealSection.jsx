import { Link } from "react-router-dom";
import { CATEGORY_GROUPS } from "@/constants/categoryTaxonomy";

function DealSection() {
  return (
    <section
      aria-label="Shop by category"
      style={{
        width: "100%",
        maxWidth: "calc(100% - 48px)",
        marginInline: "auto",
        paddingBlock: "1.5rem",
      }}
    >
      <h2
        style={{
          color: "var(--text-primary)",
          fontSize: "22px",
          fontWeight: 700,
          marginBottom: "13px",
        }}
      >
        Shop by Category
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {CATEGORY_GROUPS.map((group) => (
          <Link
            key={group.title}
            to={group.link}
            className="group relative flex items-end overflow-hidden"
            style={{
              borderRadius: "16px",
              border: "1px solid var(--border-color)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
              aspectRatio: "21 / 9",
              textDecoration: "none",
            }}
          >
            <img
              src={group.heroImage}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
              loading="lazy"
              draggable={false}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(0deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.32) 45%, rgba(0,0,0,0) 75%)",
              }}
              aria-hidden="true"
            />
            <div className="relative z-10 flex w-full items-end justify-between gap-4 p-5">
              <div>
                <h3 style={{ color: "#fff", fontSize: "20px", fontWeight: 800, lineHeight: 1.2 }}>
                  {group.title}
                </h3>
                <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "13px", fontWeight: 500, marginTop: "2px" }}>
                  {group.subtitle}
                </p>
              </div>
              <span
                className="inline-flex shrink-0 items-center gap-1 transition-transform group-hover:translate-x-0.5"
                style={{ color: "#fff", fontSize: "13.5px", fontWeight: 700, whiteSpace: "nowrap" }}
              >
                Explore
                <span aria-hidden="true">→</span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default DealSection;
