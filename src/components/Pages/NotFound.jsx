import { Link } from 'react-router-dom';
import PageShell from '../Shared/PageShell';

export default function NotFound() {
  return (
    <PageShell label="404">
      <section style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 1.5rem',
        textAlign: 'center',
      }}>
        <p style={{
          color: '#ffd97a',
          fontSize: '0.7rem',
          letterSpacing: '0.4em',
          margin: '0 0 1rem',
          textShadow: '0 0 14px rgba(255,217,122,0.5)',
        }}>
          &gt; SIGNAL_PERDU
        </p>

        <h1 style={{
          margin: '0 0 1.5rem',
          fontSize: 'clamp(4rem, 12vw, 8rem)',
          fontWeight: 900,
          fontFamily: "'Arial Black',sans-serif",
          lineHeight: 0.9,
          background: 'linear-gradient(180deg, #f5efe0 0%, #d4c19a 50%, #8a6f3f 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 30px rgba(212,193,154,0.5))',
          letterSpacing: '-0.05em',
        }}>
          404
        </h1>

        <p style={{
          color: 'rgba(245,239,224,0.85)',
          fontSize: 'clamp(1rem, 2vw, 1.15rem)',
          maxWidth: '500px',
          lineHeight: 1.7,
          margin: '0 0 2.5rem',
        }}>
          Vous avez derive hors de la trajectoire connue.
          <br />
          <span style={{ color: 'rgba(212,193,154,0.65)', fontSize: '0.85em' }}>
            Cette planete n'existe pas dans la constellation.
          </span>
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/" style={{
            padding: '0.8rem 1.8rem',
            background: 'linear-gradient(135deg, #d4c19a 0%, #8a6f3f 100%)',
            color: '#050309',
            textDecoration: 'none',
            fontSize: '0.7rem',
            letterSpacing: '0.25em',
            fontWeight: 700,
            boxShadow: '0 0 25px rgba(212,193,154,0.4)',
          }}>
            ← RETOUR_ACCUEIL
          </Link>
          <Link to="/projets" style={{
            padding: '0.8rem 1.8rem',
            background: 'transparent',
            border: '1px solid rgba(212,193,154,0.4)',
            color: '#d4c19a',
            textDecoration: 'none',
            fontSize: '0.7rem',
            letterSpacing: '0.25em',
          }}>
            EXPLORER LES PROJETS →
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
