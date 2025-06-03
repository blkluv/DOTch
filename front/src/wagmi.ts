import { configureChains, createConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { metaMaskWallet } from '@rainbow-me/rainbowkit/wallets';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';

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
    public: { http: ['https://westend-asset-hub-eth-rpc.polkadot.io'] },
  },
  blockExplorers: {
    default: {
      name: 'Westend Asset Hub Explorer',
      url: 'https://westend-asset-hub-eth-explorer.parity.io',
    },
  },
};

const { chains, publicClient } = configureChains(
  [assetHubWestend],
  [publicProvider()]
);

const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [
      metaMaskWallet({
        projectId: 'd62a0b707c792b8c5bf447a96d5e8604',
        chains,
      }),
    ],
  },
]);

const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

export { config, chains };
