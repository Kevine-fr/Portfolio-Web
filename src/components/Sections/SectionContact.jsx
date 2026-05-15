import { useEffect, useRef, useState } from 'react';

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.15 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

// Palette VRAIE NAINE BLANCHE — ~10 000 K, blanc-bleu intense
// Plus froid et plus pur que l'ancien #c8e8ff
const DWARF = {
  primary:  '#e8f4ff',    // blanc bleute principal (texte fort)
  glow:     '#aaccff',    // bleu glacial (accents lumineux)
  accent:   '#d6e8ff',    // intermediaire
  deepBlue: '#6a96c8',    // bleu acier profond (gradient bas)
};

export default function SectionContact() {
  const header = useReveal();
  const form   = useReveal();
  const [data, setData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle');

  const handle = (e) => setData({ ...data, [e.target.name]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    setStatus('sending');
    setTimeout(() => {
      setStatus('sent');
      setTimeout(() => { setStatus('idle'); setData({ name: '', email: '', message: '' }); }, 3000);
    }, 1500);
  };

  return (
    <section id="contact" style={{
      position: 'relative',
      minHeight: '100vh',
      padding: 'clamp(4rem, 10vh, 8rem) clamp(1.5rem, 5vw, 3rem) 6rem',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
    }}>

      <div ref={header.ref} style={{
        maxWidth: '600px', marginBottom: '3rem',
        opacity: header.visible ? 1 : 0,
        transform: header.visible ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 1s ease',
      }}>
        <p style={{
          color: DWARF.glow, fontSize: '0.7rem', letterSpacing: '0.4em',
          margin: '0 0 1rem', opacity: 0.95,
          textShadow: '0 0 14px rgba(170,204,255,0.7)',
        }}>
          &gt; 04_CONTACT
        </p>
        <h2 style={{
          margin: 0, fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, lineHeight: 1,
          fontFamily: "'Arial Black',sans-serif", letterSpacing: '-0.02em',
          background: `linear-gradient(180deg, #ffffff 0%, ${DWARF.primary} 50%, ${DWARF.glow} 100%)`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 30px rgba(232,244,255,0.5))',
        }}>
          Emettez<br />un signal
        </h2>
        <p style={{
          color: 'rgba(245,250,255,0.78)', fontSize: 'clamp(0.85rem, 1.8vw, 0.95rem)',
          lineHeight: 1.7, marginTop: '1.5rem', maxWidth: '500px',
        }}>
          Une question, un projet, une collaboration ? Transmettez votre
          message — captee par la naine blanche, reception garantie.
        </p>
      </div>

      <form ref={form.ref} onSubmit={submit}
        className="contact-form"
        style={{
          maxWidth: '600px', width: '100%',
          opacity: form.visible ? 1 : 0,
          transform: form.visible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 1s ease 0.3s',
        }}>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block', color: DWARF.glow, fontSize: '0.65rem',
            letterSpacing: '0.3em', marginBottom: '0.5rem',
          }}>&gt; NOM</label>
          <input type="text" name="name" value={data.name} onChange={handle} required
            className="signal-input" placeholder="Votre identite..." />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block', color: DWARF.glow, fontSize: '0.65rem',
            letterSpacing: '0.3em', marginBottom: '0.5rem',
          }}>&gt; FREQUENCE_RETOUR (EMAIL)</label>
          <input type="email" name="email" value={data.email} onChange={handle} required
            className="signal-input" placeholder="contact@galaxy.io" />
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{
            display: 'block', color: DWARF.glow, fontSize: '0.65rem',
            letterSpacing: '0.3em', marginBottom: '0.5rem',
          }}>&gt; MESSAGE</label>
          <textarea name="message" value={data.message} onChange={handle} required rows={6}
            className="signal-input" placeholder="Transmettez votre signal..." />
        </div>

        <button type="submit" disabled={status !== 'idle'}
          className="signal-btn"
          style={{
            padding: '0.9rem 2rem',
            background: status === 'sent'
              ? 'linear-gradient(135deg, #7cc97c, #5aa05a)'
              : `linear-gradient(135deg, ${DWARF.primary} 0%, ${DWARF.deepBlue} 100%)`,
            border: 'none', color: '#050309', cursor: status === 'idle' ? 'pointer' : 'wait',
            fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.25em',
            fontFamily: "'Courier New',monospace",
            boxShadow: '0 0 25px rgba(170,204,255,0.6)',
            position: 'relative', overflow: 'hidden',
            opacity: status !== 'idle' ? 0.85 : 1,
            transition: 'all 0.3s',
          }}>
          {status === 'idle'    && 'EMETTRE LE SIGNAL →'}
          {status === 'sending' && 'TRANSMISSION...'}
          {status === 'sent'    && '✓ SIGNAL CAPTE'}
        </button>

        <div style={{
          marginTop: '3rem', paddingTop: '2rem',
          borderTop: '1px solid rgba(170,204,255,0.18)',
          display: 'flex', flexWrap: 'wrap', gap: '2rem',
        }}>
          {[
            { label: 'EMAIL',    val: 'keddiantouadi@gmail.com' },
            { label: 'GITHUB',   val: '@Kevine-fr' },
            { label: 'LINKEDIN', val: '/in/kevine-diantouadi-fray' },
          ].map(item => (
            <div key={item.label}>
              <div style={{
                color: 'rgba(170,204,255,0.85)', fontSize: '0.6rem',
                letterSpacing: '0.3em', marginBottom: '0.3rem',
              }}>{item.label}</div>
              <div style={{
                color: 'rgba(245,250,255,0.95)', fontSize: '0.8rem',
                letterSpacing: '0.05em',
              }}>{item.val}</div>
            </div>
          ))}
        </div>
      </form>

      <style>{`
        .signal-input {
          width: 100%;
          padding: 0.8rem 1rem;
          background: rgba(170,204,255,0.04);
          border: 1px solid rgba(170,204,255,0.25);
          color: rgba(245,250,255,0.95);
          font-family: 'Courier New', monospace;
          font-size: 0.85rem;
          letter-spacing: 0.03em;
          outline: none;
          transition: all 0.3s;
          box-sizing: border-box;
        }
        .signal-input::placeholder {
          color: rgba(245,250,255,0.35);
        }
        .signal-input:focus {
          background: rgba(170,204,255,0.08);
          border-color: rgba(232,244,255,0.7);
          box-shadow: 0 0 18px rgba(170,204,255,0.3);
        }
        textarea.signal-input {
          resize: vertical;
          min-height: 120px;
          font-family: 'Courier New', monospace;
        }

        .signal-btn::before {
          content: ''; position: absolute; top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent);
          transition: left 0.6s ease;
        }
        .signal-btn:hover::before { left: 100%; }
        .signal-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 30px rgba(170,204,255,0.85) !important;
        }
        .signal-btn { transition: all 0.3s ease; }
      `}</style>
    </section>
  );
}
