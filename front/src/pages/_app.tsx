import '../styles/globals.css';
import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';

// Dynamically import PolkadotProvider with no SSR
const PolkadotProvider = dynamic(
  () => import('../context/PolkadotContext').then((mod) => mod.PolkadotProvider),
  { ssr: false }
);

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <PolkadotProvider>
      <Component {...pageProps} />
    </PolkadotProvider>
  );
}

export default MyApp;