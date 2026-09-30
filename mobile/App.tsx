import React, { useEffect } from 'react';
import { RootNavigator } from './src/navigation/RootNavigator';
import { StripeWrapper } from './src/components/StripeWrapper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useThemeStore } from './src/store/themeStore';
import { colors, lightColors, darkColors } from './src/theme/colors';

export default function App() {
  const { isDarkMode } = useThemeStore();

  // Mutate the global colors object so all static stylesheets pick up the new colors on re-render
  useEffect(() => {
    const activeColors = isDarkMode ? darkColors : lightColors;
    Object.assign(colors, activeColors);
  }, [isDarkMode]);

  return (
    <SafeAreaProvider>
      <StripeWrapper>
        {/* The key forces a complete remount of the navigation tree so components re-evaluate their styles */}
        <RootNavigator key={isDarkMode ? 'dark' : 'light'} />
      </StripeWrapper>
    </SafeAreaProvider>
  );
}
