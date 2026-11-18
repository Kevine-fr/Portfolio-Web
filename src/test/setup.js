import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import { clearFetchCache } from '../hooks/useFetch';

/** Controllable IntersectionObserver: elements are visible immediately. */
class IntersectionObserverMock {
  constructor(cb) { this.cb = cb; }
  observe(el) { this.cb([{ isIntersecting: true, intersectionRatio: 1, target: el }], this); }
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  clearFetchCache();
  globalThis.IntersectionObserver = IntersectionObserverMock;
  window.scrollTo = vi.fn();
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
});
