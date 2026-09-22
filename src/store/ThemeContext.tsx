import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { AppTheme, darkTheme, lightTheme } from '@/theme';

type ThemePreference = 'system' | 'light' | 'dark';
type ThemeState = { theme: AppTheme; preference: ThemePreference; setPreference: (value: ThemePreference) => void };
const ThemeContext = createContext<ThemeState | null>(null);
const STORAGE_KEY = 'ausbildungskompass-theme';

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  useEffect(() => { AsyncStorage.getItem(STORAGE_KEY).then((value) => {
    if (value === 'system' || value === 'light' || value === 'dark') setPreferenceState(value);
  }); }, []);
  const setPreference = (value: ThemePreference) => { setPreferenceState(value); void AsyncStorage.setItem(STORAGE_KEY, value); };
  const isDark = preference === 'dark' || (preference === 'system' && systemScheme === 'dark');
  const value = useMemo(() => ({ theme: isDark ? darkTheme : lightTheme, preference, setPreference }), [isDark, preference]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useAppTheme muss innerhalb von ThemeProvider verwendet werden.');
  return context;
}

