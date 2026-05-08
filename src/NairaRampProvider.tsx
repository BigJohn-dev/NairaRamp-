import React, { createContext, useContext, ReactNode } from 'react';

interface NairaRampContextType {
  apiKey: string;
  baseUrl?: string;
}

const NairaRampContext = createContext<NairaRampContextType | undefined>(undefined);

interface NairaRampProviderProps {
  children: ReactNode;
  apiKey: string;
  baseUrl?: string;
}

export const NairaRampProvider: React.FC<NairaRampProviderProps> = ({
  children,
  apiKey,
  baseUrl = 'https://api.nairaramp.com',
}) => {
  if (!apiKey) {
    throw new Error('NairaRampProvider requires a valid apiKey prop');
  }

  return (
    <NairaRampContext.Provider value={{ apiKey, baseUrl }}>
      {children}
    </NairaRampContext.Provider>
  );
};

export const useNairaRamp = (): NairaRampContextType => {
  const context = useContext(NairaRampContext);
  if (!context) {
    throw new Error('useNairaRamp must be used within NairaRampProvider');
  }
  return context;
};
