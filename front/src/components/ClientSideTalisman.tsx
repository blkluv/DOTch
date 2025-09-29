import dynamic from 'next/dynamic';

// Dynamically import TalismanConnectButton with no SSR
const TalismanConnectButton = dynamic(
  () => import('./TalismanConnectButton'),
  { ssr: false }
);

export const ClientSideTalisman = () => {
  return <TalismanConnectButton />;
};