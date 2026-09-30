import React from 'react';
import { RootNavigator } from './src/navigation/RootNavigator';
import { StripeWrapper } from './src/components/StripeWrapper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      <StripeWrapper>
        <RootNavigator />
      </StripeWrapper>
    </SafeAreaProvider>
  );
}
