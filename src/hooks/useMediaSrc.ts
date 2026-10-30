import { useEffect, useState } from 'react';
import { useMediaUrl } from '../lib/api';

/**
 * Give an <img> a renderable src for any stored media value.
 *
 * - `https://…`, `data:` and empty strings are used as-is.
 * - `/uploads/...` needs the bearer token, so it is fetched once (cached in
 *   lib/api) and swapped for a blob URL.
 *
 * Returns the last resolvable value while a new one loads, so switching the
 * photo does not flash an empty box.
 */
export function useMediaSrc(value: string | undefined | null): string {
  const direct = value && !value.startsWith('/uploads/') ? value : '';
  const [resolved, setResolved] = useState(direct);

  useEffect(() => {
    const pending = useMediaUrl(value);
    if (!pending) {
      setResolved(direct);
      return;
    }
    let cancelled = false;
    pending
      .then((url) => {
        if (!cancelled) setResolved(url);
      })
      .catch(() => {
        if (!cancelled) setResolved('');
      });
    return () => {
      cancelled = true;
    };
  }, [value]);

  return resolved;
}
