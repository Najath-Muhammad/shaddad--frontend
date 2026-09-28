import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { colors } from '../theme/colors.js';
import { useAuthStore } from '../store/authStore.js';
import { SplashScreen } from '../screens/splash/SplashScreen.js';
import { RoleSelectionScreen } from '../screens/auth/RoleSelectionScreen.js';
import { CustomerLoginScreen } from '../screens/auth/CustomerLoginScreen.js';
import { CustomerRegisterScreen } from '../screens/auth/CustomerRegisterScreen.js';
import { DriverLoginScreen } from '../screens/auth/DriverLoginScreen.js';
import { DriverRegisterScreen } from '../screens/auth/DriverRegisterScreen.js';
import { CustomerHomeScreen } from '../screens/customer/CustomerHomeScreen.js';
import { DriverHomeScreen } from '../screens/driver/DriverHomeScreen.js';

type ScreenState =
  | 'splash'
  | 'role-select'
  | 'customer-login'
  | 'customer-register'
  | 'driver-login'
  | 'driver-register'
  | 'customer-home'
  | 'driver-home';

export const RootNavigator: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('splash');
  const { initialize, isAuthenticated, activeRole } = useAuthStore();

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    if (isAuthenticated) {
      if (activeRole === 'DRIVER') {
        setCurrentScreen('driver-home');
      } else if (activeRole === 'CUSTOMER') {
        setCurrentScreen('customer-home');
      }
    }
  }, [isAuthenticated, activeRole]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.container}>
        {currentScreen === 'splash' && (
          <SplashScreen
            onFinish={(dest) => {
              setCurrentScreen(dest);
            }}
          />
        )}

        {currentScreen === 'role-select' && (
          <RoleSelectionScreen
            onSelectCustomer={() => setCurrentScreen('customer-login')}
            onSelectDriver={() => setCurrentScreen('driver-login')}
          />
        )}

        {currentScreen === 'customer-login' && (
          <CustomerLoginScreen
            onSuccess={() => setCurrentScreen('customer-home')}
            onNavigateRegister={() => setCurrentScreen('customer-register')}
            onBack={() => setCurrentScreen('role-select')}
          />
        )}

        {currentScreen === 'customer-register' && (
          <CustomerRegisterScreen
            onSuccess={() => setCurrentScreen('customer-home')}
            onNavigateLogin={() => setCurrentScreen('customer-login')}
            onBack={() => setCurrentScreen('customer-login')}
          />
        )}

        {currentScreen === 'driver-login' && (
          <DriverLoginScreen
            onSuccess={() => setCurrentScreen('driver-home')}
            onNavigateRegister={() => setCurrentScreen('driver-register')}
            onBack={() => setCurrentScreen('role-select')}
          />
        )}

        {currentScreen === 'driver-register' && (
          <DriverRegisterScreen
            onSuccess={() => setCurrentScreen('driver-home')}
            onNavigateLogin={() => setCurrentScreen('driver-login')}
            onBack={() => setCurrentScreen('driver-login')}
          />
        )}

        {currentScreen === 'customer-home' && (
          <CustomerHomeScreen
            onLogout={() => setCurrentScreen('role-select')}
          />
        )}

        {currentScreen === 'driver-home' && (
          <DriverHomeScreen
            onLogout={() => setCurrentScreen('role-select')}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
