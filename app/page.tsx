"use client";

import Logo from "@/app/components/logo";
import { Button } from "@mui/joy";
import Link from "next/link";
import { useState } from "react";
import {
  BsEnvelope,
  BsEnvelopePaper,
  BsEnvelopeHeart,
  BsTruck,
  BsShieldCheck,
  BsStarFill,
  BsCartPlus,
  BsArrowRight,
} from "react-icons/bs";

/* ------------------------------------------------------------------ */
/*  Données                                                            */
/* ------------------------------------------------------------------ */
type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  icon: React.ReactNode;
  tag?: string;
};

const products: Product[] = [
  {
    id: 1,
    name: "Enveloppe Classique",
    description:
      "Enveloppe blanche format DL (110 × 220 mm), papier 80g. Idéale pour le courrier du quotidien.",
    price: 4.9,
    icon: <BsEnvelope size={28} />,
    tag: "Best-seller",
  },
  {
    id: 2,
    name: "Enveloppe Kraft",
    description:
      "Enveloppe kraft recyclée C5, robuste et écologique. Parfaite pour vos documents importants.",
    price: 6.5,
    icon: <BsEnvelopePaper size={28} />,
  },
  {
    id: 3,
    name: "Enveloppe Prestige",
    description:
      "Enveloppe doublée format carré, papier vergé 120g. Pour vos invitations et faire-part.",
    price: 9.9,
    icon: <BsEnvelopeHeart size={28} />,
    tag: "Premium",
  },
  {
    id: 4,
    name: "Enveloppe à fenêtre",
    description:
      "Enveloppe DL à fenêtre transparente, idéale pour vos factures et envois administratifs.",
    price: 5.5,
    icon: <BsEnvelope size={28} />,
  },
  {
    id: 5,
    name: "Enveloppe Bulle",
    description:
      "Enveloppe matelassée anti-choc, protège vos objets fragiles lors de l'expédition.",
    price: 7.9,
    icon: <BsEnvelopePaper size={28} />,
  },
  {
    id: 6,
    name: "Enveloppe Colorée",
    description:
      "Assortiment de 50 enveloppes colorées format carte. Donnez de la couleur à votre courrier.",
    price: 8.4,
    icon: <BsEnvelopeHeart size={28} />,
    tag: "Nouveau",
  },
];

const features = [
  {
    icon: <BsTruck size={24} />,
    title: "Livraison rapide",
    text: "Expédiée sous 24h, livrée en 2 à 3 jours ouvrés partout en France.",
  },
  {
    icon: <BsShieldCheck size={24} />,
    title: "Qualité garantie",
    text: "Papiers certifiés et fabrication soignée. Satisfait ou remboursé sous 30 jours.",
  },
  {
    icon: <BsEnvelope size={24} />,
    title: "Tous les formats",
    text: "DL, C5, C6, carré… trouvez l'enveloppe adaptée à chaque usage.",
  },
];

/* ------------------------------------------------------------------ */
/*  Visuel enveloppe                                                   */
/* ------------------------------------------------------------------ */
function EnvelopeArt() {
  return (
    <svg
      viewBox="0 0 420 300"
      className="ag-env"
      role="img"
      aria-label="Enveloppe cachetée"
    >
      <rect x="40" y="60" width="340" height="210" rx="6" fill="#ffffff" stroke="#e5e7eb" strokeWidth="1.5" />
      <path d="M40 66 L210 188 L380 66" fill="none" stroke="#e5e7eb" strokeWidth="1.5" />
      <path d="M40 264 L150 175" fill="none" stroke="#e5e7eb" strokeWidth="1.5" />
      <path d="M380 264 L270 175" fill="none" stroke="#e5e7eb" strokeWidth="1.5" />
      <circle cx="210" cy="178" r="32" fill="#2563eb" />
      <circle cx="210" cy="178" r="32" fill="none" stroke="#1d4ed8" strokeWidth="2" />
      <text
        x="210"
        y="179"
        textAnchor="middle"
        dominantBaseline="central"
        fill="#ffffff"
        style={{ fontWeight: 700, fontSize: 26 }}
      >
        A
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function Home() {
  const [cartCount, setCartCount] = useState(0);

  return (
    <main className="agora">
      <style jsx global>{`
        :root {
          --text: #111827;
          --muted: #6b7280;
          --border: #e5e7eb;
          --border-soft: #f3f4f6;
          --soft: #f9fafb;
          --blue: #2563eb;
          --blue-soft: #eff6ff;
          --blue-link: #3b82f6;
          --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
            0 4px 6px -4px rgba(0, 0, 0, 0.1);
        }

        .agora {
          min-height: 100vh;
          background: #ffffff;
          color: var(--text);
        }
        .agora *,
        .agora *::before,
        .agora *::after {
          box-sizing: border-box;
        }
        .agora p,
        .agora h1,
        .agora h2,
        .agora h3 {
          margin: 0;
        }
        .agora h1,
        .agora h2,
        .agora h3 {
          font-weight: 700;
          letter-spacing: -0.01em;
        }
        .agora a {
          text-decoration: none;
        }

        .ag-container {
          width: 91.6667%;
          max-width: 1152px;
          margin: 0 auto;
        }
        .ag-container-sm {
          width: 91.6667%;
          max-width: 768px;
          margin: 0 auto;
        }
        .ag-muted {
          color: var(--muted);
        }

        /* Header */
        .ag-header {
          position: sticky;
          top: 0;
          z-index: 20;
          border-bottom: 1px solid var(--border);
          background: #ffffff;
        }
        .ag-header-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 0;
        }
        .ag-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .ag-brand-name {
          font-size: 1.5rem;
          font-weight: 700;
        }
        .ag-nav {
          display: none;
          align-items: center;
          gap: 2rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--muted);
        }
        .ag-nav a:hover {
          color: var(--text);
        }
        .ag-cart {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border: 1px solid var(--border);
          border-radius: 0.375rem;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
        }

        /* Hero */
        .ag-hero {
          border-bottom: 1px solid var(--border);
        }
        .ag-hero-inner {
          padding: 5rem 0;
          text-align: center;
        }
        .ag-h1 {
          font-size: clamp(2.25rem, 5vw, 3rem);
          line-height: 1.1;
        }
        .ag-accent {
          color: var(--blue);
        }
        .ag-lead {
          margin: 1.25rem auto 0;
          max-width: 36rem;
          font-size: 1.125rem;
          line-height: 1.6;
          color: var(--muted);
        }
        .ag-cta {
          margin-top: 2rem;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.75rem;
        }
        .ag-rating {
          margin-top: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: var(--muted);
        }
        .ag-rating-stars {
          display: flex;
          gap: 1px;
          color: #fbbf24;
        }
        .ag-hero-card {
          margin: 3rem auto 0;
          width: 100%;
          max-width: 28rem;
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          background: #ffffff;
          padding: 2rem;
          box-shadow: var(--shadow-lg);
        }
        .ag-env {
          display: block;
          margin: 0 auto;
          width: 100%;
          max-width: 18rem;
          height: auto;
        }

        /* Sections génériques */
        .ag-section {
          padding: 5rem 0;
        }
        .ag-section-head {
          text-align: center;
        }
        .ag-h2 {
          font-size: 1.875rem;
          line-height: 1.2;
        }
        .ag-section-lead {
          margin: 0.75rem auto 0;
          max-width: 36rem;
          color: var(--muted);
        }

        /* Produits */
        .ag-grid {
          margin-top: 3rem;
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }
        .ag-card {
          display: flex;
          flex-direction: column;
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          background: #ffffff;
          padding: 1.5rem;
          box-shadow: var(--shadow-sm);
          transition: box-shadow 0.2s;
        }
        .ag-card:hover {
          box-shadow: var(--shadow-lg);
        }
        .ag-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }
        .ag-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 3.5rem;
          height: 3.5rem;
          border-radius: 999px;
          background: var(--blue-soft);
          color: var(--blue);
          flex: none;
        }
        .ag-tag {
          border-radius: 999px;
          background: var(--blue-soft);
          color: var(--blue);
          padding: 0.25rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .ag-card-title {
          margin-top: 1.25rem;
          font-size: 1.125rem;
          font-weight: 600;
        }
        .ag-card-desc {
          margin-top: 0.5rem;
          flex: 1;
          font-size: 0.875rem;
          line-height: 1.55;
          color: var(--muted);
        }
        .ag-card-foot {
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-soft);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .ag-price {
          font-size: 1.25rem;
          font-weight: 700;
        }

        /* Avantages */
        .ag-advantages {
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          background: var(--soft);
        }
        .ag-features {
          margin-top: 3rem;
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }
        .ag-feature {
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          background: #ffffff;
          padding: 2rem;
          text-align: center;
          box-shadow: var(--shadow-sm);
        }
        .ag-feature .ag-icon {
          margin: 0 auto;
        }
        .ag-feature-title {
          margin-top: 1.25rem;
          font-size: 1.125rem;
          font-weight: 600;
        }
        .ag-feature-text {
          margin-top: 0.5rem;
          font-size: 0.875rem;
          line-height: 1.55;
          color: var(--muted);
        }

        /* Newsletter (carte façon subscribe) */
        .ag-news-card {
          margin: 0 auto;
          max-width: 28rem;
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          background: #ffffff;
          padding: 2.5rem;
          text-align: center;
          box-shadow: var(--shadow-lg);
        }
        .ag-news-head {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }
        .ag-news-title {
          font-size: 1.5rem;
          font-weight: 700;
        }
        .ag-news-btn {
          margin-top: 1.5rem;
        }
        .ag-news-note {
          margin-top: 0.75rem;
          display: block;
          font-size: 0.6875rem;
          color: var(--muted);
        }
        .ag-news-note a {
          color: var(--blue-link);
        }
        .ag-news-note a:hover {
          text-decoration: underline;
        }

        /* Footer */
        .ag-footer {
          border-top: 1px solid var(--border);
          background: #ffffff;
        }
        .ag-footer-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 2rem 0;
          font-size: 0.875rem;
          color: var(--muted);
        }
        .ag-foot-brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .ag-foot-brand span {
          font-weight: 600;
          color: var(--text);
        }

        /* Responsive */
        @media (min-width: 640px) {
          .ag-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (min-width: 768px) {
          .ag-nav {
            display: flex;
          }
          .ag-features {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .ag-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>

      {/* Header */}
      <header className="ag-header">
        <div className="ag-container ag-header-inner">
          <div className="ag-brand">
            <Logo size={40} />
            <span className="ag-brand-name">Agora</span>
          </div>
          <nav className="ag-nav">
            <a href="#produits">Produits</a>
            <a href="#avantages">Avantages</a>
            <a href="#newsletter">Newsletter</a>
          </nav>
          <div className="ag-cart">
            <BsCartPlus size={18} />
            <span>{cartCount}</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="ag-hero">
        <div className="ag-container-sm ag-hero-inner">
          <h1 className="ag-h1">
            Des enveloppes pour <span className="ag-accent">chaque occasion</span>
          </h1>
          <p className="ag-lead" style={{margin: '20px auto'}}>
            Du courrier quotidien aux invitations les plus élégantes, Agora vous propose une
            sélection d'enveloppes de qualité, livrées rapidement chez vous.
          </p>
          <div className="ag-cta">
            <Button component="a" href="#produits" size="lg" endDecorator={<BsArrowRight />}>
              Voir les enveloppes
            </Button>
            <Button component="a" href="#avantages" size="lg" variant="outlined" color="neutral">
              En savoir plus
            </Button>
          </div>
          <div className="ag-rating">
            <div className="ag-rating-stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <BsStarFill key={i} size={14} />
              ))}
            </div>
            <span>Plus de 12 000 clients satisfaits</span>
          </div>
          <div className="ag-hero-card">
            <EnvelopeArt />
          </div>
        </div>
      </section>

      {/* Produits */}
      <section id="produits" className="ag-container ag-section">
        <div className="ag-section-head">
          <h2 className="ag-h2">Notre sélection</h2>
          <p className="ag-section-lead" style={{margin: '0 auto'}}>
            Des enveloppes pensées pour tous vos besoins, à des prix justes.
          </p>
        </div>
        <div className="ag-grid">
          {products.map((product) => (
            <article key={product.id} className="ag-card">
              <div className="ag-card-top">
                <div className="ag-icon">{product.icon}</div>
                {product.tag && <span className="ag-tag">{product.tag}</span>}
              </div>
              <h3 className="ag-card-title">{product.name}</h3>
              <p className="ag-card-desc">{product.description}</p>
              <div className="ag-card-foot">
                <span className="ag-price">{product.price.toFixed(2)}&nbsp;€</span>
                <Button
                  size="sm"
                  variant="outlined"
                  color="neutral"
                  startDecorator={<BsCartPlus />}
                  onClick={() => setCartCount((c) => c + 1)}
                >
                  Ajouter
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Avantages */}
      <section id="avantages" className="ag-advantages">
        <div className="ag-container ag-section">
          <div className="ag-section-head">
            <h2 className="ag-h2">Pourquoi Agora ?</h2>
          </div>
          <div className="ag-features">
            {features.map((feature) => (
              <div key={feature.title} className="ag-feature">
                <div className="ag-icon">{feature.icon}</div>
                <h3 className="ag-feature-title">{feature.title}</h3>
                <p className="ag-feature-text">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section id="newsletter" className="ag-container ag-section">
        <div className="ag-news-card">
          <div className="ag-news-head">
            <Logo size={56} />
            <h2 className="ag-news-title">Restez informé</h2>
            <p className="ag-muted">
              Recevez nos nouveautés et offres exclusives directement dans votre boîte mail.
            </p>
          </div>
          <div className="ag-news-btn">
            <Button component={Link} href="/subscribe" fullWidth size="lg">
              S'abonner
            </Button>
          </div>
          <span className="ag-news-note">
            En vous abonnant, vous reconnaissez avoir pris connaissance de la{" "}
            <Link href="/privacyPolicy">politique de confidentialité</Link> d'Agora.
          </span>
        </div>
      </section>

      {/* Footer */}
      <footer className="ag-footer">
        <div className="ag-container ag-footer-inner">
          <div className="ag-foot-brand">
            <Logo size={26} />
            <span>Agora</span>
          </div>
          <p>© {new Date().getFullYear()} Agora — Vente d'enveloppes en ligne.</p>
        </div>
      </footer>
    </main>
  );
}