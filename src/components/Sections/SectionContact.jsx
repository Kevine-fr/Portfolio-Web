import { useState } from 'react';
import { apiPost } from '../../lib/api';
import { useReveal } from '../../hooks/useReveal';

// Palette VRAIE NAINE BLANCHE — ~10 000 K, blanc-bleu intense
const DWARF = {
  primary:  '#e8f4ff',
  glow:     '#aaccff',
  accent:   '#d6e8ff',
  deepBlue: '#6a96c8',
};

export default function SectionContact() {
  const header = useReveal();
  const form   = useReveal();
  const [data, setData]     = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [errorMsg, setErrorMsg] = useState('');

  const handle = (e) => setData({ ...data, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setStatus('sending'); setErrorMsg('');
    try {
      await apiPost('/contacts', {
        name:    data.name.trim(),
        email:   data.email.trim(),
        subject: data.subject.trim() || undefined,
        message: data.message.trim(),
      });
      setStatus('sent');
      setTimeout(() => {
        setStatus('idle');
        setData({ name: '', email: '', subject: '', message: '' });
      }, 3500);
    } catch (err) {
      setStatus('error');
      const msg = err?.response?.data?.message;
      const text = Array.isArray(msg) ? msg.join(', ') : msg || 'Echec de transmission. Reessayez plus tard.';
      setErrorMsg(text);
      setTimeout(() => setStatus('idle'), 4000);
    }
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
          &gt; 07_CONTACT
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
            disabled={status === 'sending'}
            className="signal-input" placeholder="Votre identite..." />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block', color: DWARF.glow, fontSize: '0.65rem',
            letterSpacing: '0.3em', marginBottom: '0.5rem',
          }}>&gt; EMAIL</label>
          <input type="email" name="email" value={data.email} onChange={handle} required
            disabled={status === 'sending'}
            className="signal-input" placeholder="contact@galaxy.io" />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{
            display: 'block', color: DWARF.glow, fontSize: '0.65rem',
            letterSpacing: '0.3em', marginBottom: '0.5rem',
          }}>&gt; OBJET (FACULTATIF)</label>
          <input type="text" name="subject" value={data.subject} onChange={handle}
            disabled={status === 'sending'}
            className="signal-input" placeholder="Sujet de votre message..." />
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <label style={{
            display: 'block', color: DWARF.glow, fontSize: '0.65rem',
            letterSpacing: '0.3em', marginBottom: '0.5rem',
          }}>&gt; MESSAGE</label>
          <textarea name="message" value={data.message} onChange={handle} required rows={6}
            disabled={status === 'sending'}
            className="signal-input" placeholder="Transmettez votre signal..." />
        </div>

        {status === 'error' && (
          <div style={{
            padding: '0.75rem 1rem',
            marginBottom: '1.5rem',
            background: 'rgba(255,100,100,0.08)',
            border: '1px solid rgba(255,100,100,0.4)',
            color: '#ff9b9b',
            fontSize: '0.75rem',
            letterSpacing: '0.05em',
            borderRadius: '2px',
          }}>
            ✗ {errorMsg}
          </div>
        )}

        <button type="submit" disabled={status === 'sending' || status === 'sent'}
          className="signal-btn"
          style={{
            padding: '0.9rem 2rem',
            background: status === 'sent'
              ? 'linear-gradient(135deg, #7cc97c, #5aa05a)'
              : status === 'error'
                ? 'linear-gradient(135deg, #ff9b9b, #c06868)'
                : `linear-gradient(135deg, ${DWARF.primary} 0%, ${DWARF.deepBlue} 100%)`,
            border: 'none', color: '#050309',
            cursor: status === 'idle' || status === 'error' ? 'pointer' : 'wait',
            fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.25em',
            fontFamily: "'Courier New',monospace",
            boxShadow: '0 0 25px rgba(170,204,255,0.6)',
            position: 'relative', overflow: 'hidden',
            opacity: status === 'sending' ? 0.85 : 1,
            transition: 'all 0.3s',
          }}>
          {status === 'idle'    && 'EMETTRE LE SIGNAL →'}
          {status === 'sending' && 'TRANSMISSION...'}
          {status === 'sent'    && '✓ SIGNAL CAPTE'}
          {status === 'error'   && 'REESSAYER →'}
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
        .signal-input::placeholder { color: rgba(245,250,255,0.35); }
        .signal-input:focus {
          background: rgba(170,204,255,0.08);
          border-color: rgba(232,244,255,0.7);
          box-shadow: 0 0 18px rgba(170,204,255,0.3);
        }
        .signal-input:disabled { opacity: 0.5; cursor: not-allowed; }
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
