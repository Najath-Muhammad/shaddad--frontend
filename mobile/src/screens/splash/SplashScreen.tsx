import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { useAuth } from '../../hooks/useAuth';

interface SplashScreenProps {
  onFinish: (destination: 'role-select' | 'customer-home' | 'driver-home') => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const { isAuthenticated, isInitializing, loadProfile } = useAuth();
  const hasRun = useRef(false);

  useEffect(() => {
    if (isInitializing) return;
    if (hasRun.current) return;
    hasRun.current = true;

    const bootstrap = async () => {
      if (isAuthenticated) {
        try {
          const profile = await loadProfile();
          if (profile?.role === 'DRIVER') {
            onFinish('driver-home');
          } else if (profile?.role === 'CUSTOMER') {
            onFinish('customer-home');
          } else {
            onFinish('role-select');
          }
        } catch {
          onFinish('role-select');
        }
      } else {
        setTimeout(() => {
          onFinish('role-select');
        }, 1000);
      }
    };

    void bootstrap();
  }, [isInitializing, isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps


  return (
    <View style={styles.container}>
      <View style={styles.logoBadge}>
        <Text style={styles.logoBadgeText}>SH</Text>
      </View>
      <Text style={styles.brandTitle}>SHADDAD</Text>
      <Text style={styles.tagline}>Saudi Arabia Logistics Marketplace</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary, // White
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.secondary, // Black
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 4,
  },
  logoBadgeText: {
    color: colors.primary, // White
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: 1.5,
  },
  tagline: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 6,
  },
});
