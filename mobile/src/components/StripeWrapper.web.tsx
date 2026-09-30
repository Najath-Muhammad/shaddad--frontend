import React from 'react';

export const StripeWrapper: React.FC<{children: React.ReactElement}> = ({ children }) => {
  // Stripe React Native is not supported on Web in this setup.
  return <>{children}</>;
};

