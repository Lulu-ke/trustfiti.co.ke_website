import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';
import { SWRConfig } from 'swr';
import Layout from '@/components/layout/Layout';

const swrFetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) {
      const error = new Error('An error occurred while fetching the data.');
      throw error;
    }
    return res.json();
  });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider>
      <SWRConfig
        value={{
          fetcher: swrFetcher,
          revalidateOnFocus: false,
          errorRetryCount: 2,
        }}
      >
        <Layout>
          <Component {...pageProps} />
        </Layout>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#f9fafb',
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '14px',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#f9fafb',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#f9fafb',
              },
            },
          }}
        />
      </SWRConfig>
    </SessionProvider>
  );
}
