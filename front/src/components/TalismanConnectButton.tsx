import { usePolkadot } from '../hooks/usePolkadot';

export const TalismanConnectButton = () => {
  const { 
    connectWallet, 
    disconnectWallet, 
    isConnected, 
    selectedAccount, 
    isLoading,
    error 
  } = usePolkadot();

  if (isLoading) {
    return (
      <button disabled className="px-4 py-2 bg-gray-400 text-white rounded">
        Connecting...
      </button>
    );
  }

  if (isConnected && selectedAccount) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm">
          {selectedAccount.meta.name} ({selectedAccount.address.slice(0, 8)}...)
        </span>
        <button 
          onClick={disconnectWallet}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button 
        onClick={connectWallet}
        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
      >
        Connect Talisman
      </button>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};