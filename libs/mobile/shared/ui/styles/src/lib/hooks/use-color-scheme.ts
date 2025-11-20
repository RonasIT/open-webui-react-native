import { useColorScheme as useNativewindColorScheme } from 'nativewind';

interface UseColorSchemeResult {
  colorScheme: 'dark' | 'light';
  isDarkColorScheme: boolean;
  setColorScheme: (colorScheme: 'dark' | 'light') => void;
  toggleColorScheme: () => void;
}

export function useColorScheme(): UseColorSchemeResult {
  const { colorScheme, setColorScheme, toggleColorScheme } = useNativewindColorScheme();

  return {
    colorScheme: colorScheme ?? 'dark',
    isDarkColorScheme: colorScheme === 'dark',
    setColorScheme,
    toggleColorScheme,
  };
}
