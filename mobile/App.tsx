import React from 'react';
import { RootNavigator } from './src/navigation/RootNavigator';
import { StripeWrapper } from './src/components/StripeWrapper';

export default function App() {
  return (
    <StripeWrapper>
      <RootNavigator />
    </StripeWrapper>
  );
}
