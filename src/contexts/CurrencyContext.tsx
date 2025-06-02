import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

type CurrencyContextType = {
  currencyCode: string;
  currencySymbol: string;
  formatCurrency: (amount: number) => string;
};

const currencySymbols: Record<string, string> = {
  MYR: 'RM',
  USD: '$',
  SGD: 'S$',
  EUR: '€',
  GBP: '£',
};

export const CurrencyContext = createContext<CurrencyContextType>({
  currencyCode: 'MYR',
  currencySymbol: 'RM',
  formatCurrency: () => '',
});

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currencyCode, setCurrencyCode] = useState('MYR');
  const [currencySymbol, setCurrencySymbol] = useState('RM');

  useEffect(() => {
    if (user) {
      fetchUserSettings();
    }
  }, [user]);

  const fetchUserSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('default_currency')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching currency settings:', error);
        return;
      }

      // Set currency code from user settings or default to MYR
      const code = data?.default_currency || 'MYR';
      setCurrencyCode(code);
      setCurrencySymbol(currencySymbols[code] || 'RM');
    } catch (error) {
      console.error('Error fetching currency settings:', error);
    }
  };

  const formatCurrency = (amount: number): string => {
    return `${currencySymbol}${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currencyCode,
        currencySymbol,
        formatCurrency,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
