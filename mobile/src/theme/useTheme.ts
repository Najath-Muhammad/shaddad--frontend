import { useThemeStore } from '../store/themeStore';
import { lightColors, darkColors } from './colors';

export const useTheme = () => {
  const { isDarkMode, toggleTheme } = useThemeStore();
  return { colors: isDarkMode ? darkColors : lightColors, isDarkMode, toggleTheme };
};
