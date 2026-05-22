import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeType = 'dark' | 'light';

export interface Colors {
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  header: string;
}

interface ThemeContextData {
  theme: ThemeType;
  colors: Colors;
  toggleTheme: () => void;
  pushEnabled: boolean;
  togglePush: () => void;
}

const darkColors: Colors = {
  background: '#050505',
  card: '#111111',
  text: '#ffffff',
  textSecondary: '#888888',
  border: '#222222',
  primary: '#d4a017', // Gold
  header: '#050505',
};

const lightColors: Colors = {
  background: '#f2f2f7',
  card: '#ffffff',
  text: '#000000',
  textSecondary: '#666666',
  border: '#e5e5ea',
  primary: '#d4a017',
  header: '#ffffff',
};

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<ThemeType>('dark');
  const [pushEnabled, setPushEnabled] = useState<boolean>(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const storedTheme = await AsyncStorage.getItem('@theme');
      const storedPush = await AsyncStorage.getItem('@push_enabled');
      if (storedTheme) setTheme(storedTheme as ThemeType);
      if (storedPush !== null) setPushEnabled(storedPush === 'true');
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoaded(true);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    await AsyncStorage.setItem('@theme', newTheme);
  };

  const togglePush = async () => {
    const newPush = !pushEnabled;
    setPushEnabled(newPush);
    await AsyncStorage.setItem('@push_enabled', newPush.toString());
  };

  const colors = theme === 'dark' ? darkColors : lightColors;

  if (!isLoaded) return null; // Avoid flicker

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, pushEnabled, togglePush }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeContext);
