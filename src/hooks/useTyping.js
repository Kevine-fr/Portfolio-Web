import { useState, useEffect } from 'react';

/**
 * Hook d'animation de frappe (typewriter effect)
 * @param {string[]} texts  - tableau de textes à afficher en boucle
 * @param {number}   speed  - vitesse de frappe en ms par caractère
 * @returns {string} texte actuellement affiché
 *
 * Robuste aux listes vides et aux listes qui changent en cours d'animation
 * (rôles chargés depuis l'API) : l'ancienne version plantait si la nouvelle
 * liste était plus courte que l'index courant (`undefined.length`).
 */
export function useTyping(texts, speed = 80) {
  const [displayed, setDisplayed] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  const count = Array.isArray(texts) ? texts.length : 0;
  const current = count ? String(texts[textIndex % count] ?? '') : '';
  // Content-based key: an inline array (new identity each render) must not restart the animation
  const textsKey = count ? texts.join('\u0000') : '';

  // Restart the animation when the list of texts really changes
  useEffect(() => {
    setTextIndex(0);
    setCharIndex(0);
    setDeleting(false);
  }, [textsKey]);

  useEffect(() => {
    if (!count) {
      setDisplayed('');
      return undefined;
    }
    let timeout;
    if (!deleting && charIndex < current.length) {
      timeout = setTimeout(() => setCharIndex((c) => c + 1), speed);
    } else if (!deleting && charIndex >= current.length) {
      timeout = setTimeout(() => setDeleting(true), 2200);
    } else if (deleting && charIndex > 0) {
      timeout = setTimeout(() => setCharIndex((c) => c - 1), speed / 2);
    } else {
      setDeleting(false);
      setTextIndex((i) => (i + 1) % count);
    }
    setDisplayed(current.slice(0, charIndex));
    return () => clearTimeout(timeout);
  }, [charIndex, deleting, current, count, speed]);

  return displayed;
}
