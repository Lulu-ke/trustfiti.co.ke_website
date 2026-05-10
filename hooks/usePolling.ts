import useSWR from 'swr';
import { useEffect } from 'react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface UsePollingOptions {
  interval?: number;
  enabled?: boolean;
}

interface UsePollingReturn<T> {
  data: T | undefined;
  error: Error | undefined;
  isLoading: boolean;
}

export function usePolling<T>(
  url: string | null,
  options: UsePollingOptions = {}
): UsePollingReturn<T> {
  const { interval = 30000, enabled = true } = options;

  const { data, error, isValidating } = useSWR<T>(
    enabled && url ? url : null,
    fetcher,
    {
      refreshInterval: enabled ? interval : 0,
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  useEffect(() => {
    if (!enabled || !url) return;
    const intervalId = setInterval(() => {
      fetch(url)
        .then((res) => res.json())
        .catch(() => {});
    }, interval);
    return () => clearInterval(intervalId);
  }, [url, interval, enabled]);

  return {
    data,
    error: error as Error | undefined,
    isLoading: isValidating && !data,
  };
}
