import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { colors } from '../theme/colors';
import { useAuthStore } from '../store/authStore';
import { SplashScreen } from '../screens/splash/SplashScreen';
import { RoleSelectionScreen } from '../screens/auth/RoleSelectionScreen';
import { CustomerLoginScreen } from '../screens/auth/CustomerLoginScreen';
import { CustomerRegisterScreen } from '../screens/auth/CustomerRegisterScreen';
import { DriverLoginScreen } from '../screens/auth/DriverLoginScreen';
import { DriverRegisterScreen } from '../screens/auth/DriverRegisterScreen';
import { CustomerHomeScreen } from '../screens/customer/CustomerHomeScreen';
import { DriverHomeScreen } from '../screens/driver/DriverHomeScreen';
import { VehicleDetailsScreen } from '../screens/driver/VehicleDetailsScreen';
import { DocumentUploadScreen } from '../screens/driver/DocumentUploadScreen';

type ScreenState =
  | 'splash'
  | 'role-select'
  | 'customer-login'
  | 'customer-register'
  | 'driver-login'
  | 'driver-register'
  | 'customer-home'
  | 'driver-home'
  | 'vehicle-details'
  | 'document-upload';

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
            onNavigateVehicleDetails={() => setCurrentScreen('vehicle-details')}
            onNavigateDocumentUpload={() => setCurrentScreen('document-upload')}
          />
        )}

        {currentScreen === 'vehicle-details' && (
          <VehicleDetailsScreen onBack={() => setCurrentScreen('driver-home')} />
        )}

        {currentScreen === 'document-upload' && (
          <DocumentUploadScreen onBack={() => setCurrentScreen('driver-home')} />
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
