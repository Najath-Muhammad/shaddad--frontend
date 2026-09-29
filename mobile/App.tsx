import React from 'react';
import { RootNavigator } from './src/navigation/RootNavigator';
import { StripeProvider } from '@stripe/stripe-react-native';

export default function App() {
  return (
    <StripeProvider
      publishableKey="pk_test_dummy"
      merchantIdentifier="merchant.com.shaddad"
    >
      <RootNavigator />
    </StripeProvider>
  );
}
