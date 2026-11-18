import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import * as api from '../lib/api';
import { useFetch, peekCache } from '../hooks/useFetch';
import { useTyping } from '../hooks/useTyping';
import { useReveal } from '../hooks/useReveal';

describe('useFetch', () => {
  let apiGet;
  beforeEach(() => {
    apiGet = vi.spyOn(api, 'apiGet');
  });

  it('loads data, caches it and deduplicates concurrent requests', async () => {
    apiGet.mockResolvedValue([{ id: 1 }]);
    const a = renderHook(() => useFetch('/about'));
    const b = renderHook(() => useFetch('/about'));
    expect(a.result.current.loading).toBe(true);
    await waitFor(() => expect(a.result.current.data).toEqual([{ id: 1 }]));
    await waitFor(() => expect(b.result.current.data).toEqual([{ id: 1 }]));
    expect(apiGet).toHaveBeenCalledTimes(1);

    // A component mounted later gets the cached data synchronously
    const c = renderHook(() => useFetch('/about'));
    expect(c.result.current).toMatchObject({ data: [{ id: 1 }], loading: false });
    expect(apiGet).toHaveBeenCalledTimes(1);
    expect(peekCache('/about')).toEqual([{ id: 1 }]);
  });

  it('falls back when the API is unreachable', async () => {
    apiGet.mockRejectedValue(new Error('Network Error'));
    const { result } = renderHook(() => useFetch('/skills', ['fallback']));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual(['fallback']);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(peekCache('/skills')).toBeUndefined(); // failures are not cached
  });

  it('keeps stale data when a refresh fails', async () => {
    apiGet.mockResolvedValueOnce(['v1']).mockRejectedValueOnce(new Error('down'));
    const { result } = renderHook(() => useFetch('/projects', ['fallback']));
    await waitFor(() => expect(result.current.data).toEqual(['v1']));
    await act(() => result.current.refetch());
    expect(result.current.data).toEqual(['v1']);
    expect(result.current.error).toBeTruthy();
  });

  it('refreshes stale entries in the background after the TTL', async () => {
    apiGet.mockResolvedValueOnce(['v1']).mockResolvedValueOnce(['v2']);
    const first = renderHook(() => useFetch('/x', undefined, { ttl: 0 }));
    await waitFor(() => expect(first.result.current.data).toEqual(['v1']));
    const second = renderHook(() => useFetch('/x', undefined, { ttl: 0 }));
    expect(second.result.current.data).toEqual(['v1']); // served immediately…
    await waitFor(() => expect(second.result.current.data).toEqual(['v2'])); // …then revalidated
  });

  it('resets when the endpoint changes and ignores null endpoints', async () => {
    apiGet.mockImplementation(async (url) => url);
    const { result, rerender } = renderHook(({ e }) => useFetch(e), { initialProps: { e: '/a' } });
    await waitFor(() => expect(result.current.data).toBe('/a'));
    rerender({ e: '/b' });
    await waitFor(() => expect(result.current.data).toBe('/b'));
    rerender({ e: null });
    expect(result.current).toMatchObject({ data: null, loading: false });
  });

  it('does not update after unmount', async () => {
    let resolve;
    apiGet.mockReturnValue(new Promise((r) => { resolve = r; }));
    const { unmount } = renderHook(() => useFetch('/slow'));
    unmount();
    await act(async () => resolve('late'));
    expect(peekCache('/slow')).toBe('late');
  });
});

describe('useTyping', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('types, pauses, deletes and moves to the next text', () => {
    const texts = ['ab', 'c'];
    const { result } = renderHook(() => useTyping(texts, 10));
    act(() => vi.advanceTimersByTime(10));
    act(() => vi.advanceTimersByTime(10));
    expect(result.current).toBe('ab');
    act(() => vi.advanceTimersByTime(2200)); // pause
    act(() => vi.advanceTimersByTime(5));
    act(() => vi.advanceTimersByTime(5));
    act(() => vi.advanceTimersByTime(10));
    act(() => vi.advanceTimersByTime(10));
    expect(result.current).toBe('c');
  });

  it('handles empty lists and lists that shrink while animating (used to crash)', () => {
    const { result, rerender } = renderHook(({ t }) => useTyping(t, 10), { initialProps: { t: ['one', 'two', 'three'] } });
    act(() => vi.advanceTimersByTime(5000));
    act(() => vi.advanceTimersByTime(5000));
    expect(() => rerender({ t: ['x'] })).not.toThrow();
    act(() => vi.advanceTimersByTime(10));
    expect(result.current).toBe('x');
    rerender({ t: [] });
    expect(result.current).toBe('');
  });

  it('does not restart when an equal array with a new identity is passed', () => {
    const { result, rerender } = renderHook(({ t }) => useTyping(t, 10), { initialProps: { t: ['abc'] } });
    act(() => vi.advanceTimersByTime(10));
    act(() => vi.advanceTimersByTime(10));
    rerender({ t: ['abc'] });
    act(() => vi.advanceTimersByTime(10));
    expect(result.current).toBe('abc');
  });
});

describe('useReveal', () => {
  it('becomes visible once the element intersects', () => {
    const { result } = renderHook(() => useReveal());
    expect(result.current.visible).toBe(false);
    act(() => result.current.ref(document.createElement('div')));
    expect(result.current.visible).toBe(true);
  });
});
