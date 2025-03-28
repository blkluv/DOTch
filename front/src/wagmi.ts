import { getDefaultConfig } from '@rainbow-me/rainbowkit';

export const config = getDefaultConfig({
  appName: 'RainbowKit App',
  projectId: 'd62a0b707c792b8c5bf447a96d5e8604',
  chains: [{
    id: 420420421,
    name: 'Asset-Hub Westend Testnet',
    network: 'westend-asset-hub',
    rpcUrls: {
      default: {
        http: ['https://westend-asset-hub-eth-rpc.polkadot.io']
      },
      public: {
        http: ['https://westend-asset-hub-eth-rpc.polkadot.io']
      }
    },
    nativeCurrency: {
      name: 'WND',
      symbol: 'WND',
      decimals: 18,
    },
    blockExplorers: {
      default: {
        name: 'Westend Asset Hub Explorer',
        url: 'https://westend-asset-hub-eth-explorer.parity.io',
      },
    },
  }],
  ssr: true,
});
