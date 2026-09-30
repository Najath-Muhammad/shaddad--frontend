import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useAuth } from '../../hooks/useAuth';

interface SplashScreenProps {
  onFinish: (destination: 'role-select' | 'customer-home' | 'driver-home') => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const { isAuthenticated, isInitializing, loadProfile } = useAuth();
  const hasRun = useRef(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Elegant fade in and scale up animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 10,
        useNativeDriver: true,
      })
    ]).start();

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
        }, 1500); // Wait a bit longer to show off the beautiful splash screen
      }
    };

    void bootstrap();
  }, [isInitializing, isAuthenticated, fadeAnim, scaleAnim]);


  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }], alignItems: 'center' }}>
        <Text style={styles.brandTitle}>SHADDAD</Text>
        <View style={styles.divider} />
        <Text style={styles.tagline}>Saudi Arabia Logistics Marketplace</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Black screen
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  brandTitle: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF', // White text
    letterSpacing: 4,
  },
  divider: {
    height: 2,
    width: 40,
    backgroundColor: '#4ade80', // Green accent
    marginVertical: 12,
  },
  tagline: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: 6,
  },
});

