import { useState, useEffect, useCallback } from 'react';

// Check if we're in the browser
const isBrowser = typeof window !== 'undefined';

export const usePolkadot = () => {
  const [api, setApi] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Connect to Polkadot node
  const connectApi = useCallback(async () => {
    if (!isBrowser) return null;

    try {
      setIsLoading(true);
      setError(null);
      
      // Dynamically import Polkadot API to avoid SSR issues
      const { ApiPromise, WsProvider } = await import('@polkadot/api');
      
      const provider = new WsProvider('wss://westend-asset-hub-rpc.polkadot.io');
      const api = await ApiPromise.create({ 
        provider,
      });
      
      setApi(api);
      console.log('Connected to Polkadot API');
      return api;
    } catch (err) {
      setError('Failed to connect to blockchain');
      console.error('API connection error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Connect wallet (Talisman)
  const connectWallet = useCallback(async () => {
    if (!isBrowser) return false;

    try {
      setIsLoading(true);
      setError(null);

      // Dynamically import extension-dapp to avoid SSR issues
      const { web3Accounts, web3Enable } = await import('@polkadot/extension-dapp');

      // Enable Talisman extension
      const extensions = await web3Enable('DOTch Auction');
      
      if (extensions.length === 0) {
        setError('No Polkadot wallet extension found. Please install Talisman.');
        return false;
      }

      // Get accounts from Talisman
      const allAccounts = await web3Accounts();
      setAccounts(allAccounts);
      
      if (allAccounts.length > 0) {
        setSelectedAccount(allAccounts[0]);
        setIsConnected(true);
        return true;
      } else {
        setError('No accounts found in Talisman. Please create or import an account.');
        return false;
      }
    } catch (err) {
      setError('Failed to connect wallet');
      console.error('Wallet connection error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setSelectedAccount(null);
    setAccounts([]);
    setIsConnected(false);
    setError(null);
  }, []);

  // Switch account
  const switchAccount = useCallback((account: any) => {
    setSelectedAccount(account);
  }, []);

  // Get injector for signing transactions
  const getInjector = useCallback(async () => {
    if (!isBrowser || !selectedAccount) return null;
    
    const { web3FromAddress } = await import('@polkadot/extension-dapp');
    return await web3FromAddress(selectedAccount.address);
  }, [selectedAccount]);

  // Initialize API on component mount (client-side only)
  useEffect(() => {
    if (isBrowser) {
      connectApi();
    }
  }, [connectApi]);

  return {
    // State
    api,
    accounts,
    selectedAccount,
    isConnected,
    isLoading,
    error,
    
    // Actions
    connectWallet,
    disconnectWallet,
    switchAccount,
    getInjector,
    connectApi,
  };
};