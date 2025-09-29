import React, { createContext, useContext, ReactNode } from 'react';
import { usePolkadot } from '../hooks/usePolkadot';

const PolkadotContext = createContext<ReturnType<typeof usePolkadot> | undefined>(undefined);

interface PolkadotProviderProps {
  children: ReactNode;
}

export const PolkadotProvider: React.FC<PolkadotProviderProps> = ({ children }) => {
  const polkadot = usePolkadot();

  return (
    <PolkadotContext.Provider value={polkadot}>
      {children}
    </PolkadotContext.Provider>
  );
};

export const usePolkadotContext = () => {
  const context = useContext(PolkadotContext);
  if (context === undefined) {
    throw new Error('usePolkadotContext must be used within a PolkadotProvider');
  }
  return context;
};