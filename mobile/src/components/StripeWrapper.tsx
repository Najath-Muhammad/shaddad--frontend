import React from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';

export const StripeWrapper: React.FC<{children: React.ReactElement}> = ({ children }) => {
  const publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_dummy";
  
  return (
    <StripeProvider publishableKey={publishableKey} merchantIdentifier="merchant.com.shaddad">
      {children}
    </StripeProvider>
  );
};
