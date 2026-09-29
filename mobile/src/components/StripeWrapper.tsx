import React from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';

export const StripeWrapper: React.FC<{children: React.ReactElement}> = ({ children }) => {
  return (
    <StripeProvider publishableKey="pk_test_dummy" merchantIdentifier="merchant.com.shaddad">
      {children}
    </StripeProvider>
  );
};
