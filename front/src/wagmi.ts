import { configureChains, createClient } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';

const assetHubWestend = {
  id: 420420421,
  name: 'Asset-Hub Westend Testnet',
  network: 'westend-asset-hub',
  nativeCurrency: {
    name: 'Westend',
    symbol: 'WND',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://westend-asset-hub-eth-rpc.polkadot.io'] },
  },
  blockExplorers: {
    default: {
      name: 'Westend Asset Hub Explorer',
      url: 'https://westend-asset-hub-eth-explorer.parity.io',
    },
  },
};

const { chains, provider, webSocketProvider } = configureChains(
  [assetHubWestend],
  [publicProvider()]
);

const client = createClient({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains })
  ],
  provider,
  webSocketProvider,
});

export { client, chains };