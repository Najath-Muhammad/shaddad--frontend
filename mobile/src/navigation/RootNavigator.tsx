import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/useTheme';
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
import { CreateTripScreen } from '../screens/customer/CreateTripScreen';
import { TripReviewScreen } from '../screens/customer/TripReviewScreen';
import { WaitingForDriverScreen } from '../screens/customer/WaitingForDriverScreen';
import { ActiveTripCustomerScreen } from '../screens/trip/ActiveTripCustomerScreen';
import { ActiveTripDriverScreen } from '../screens/trip/ActiveTripDriverScreen';
import { PaymentCheckoutScreen } from '../screens/trip/PaymentCheckoutScreen';
import { TripReviewRatingScreen } from '../screens/trip/TripReviewRatingScreen';
import { TripHistoryScreen } from '../screens/trip/TripHistoryScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { Alert } from 'react-native';
import { socketClient } from '../api/socket.client';

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
  | 'document-upload'
  | 'create-trip'
  | 'trip-review'
  | 'waiting-driver'
  | 'active-trip-customer'
  | 'active-trip-driver'
  | 'payment-checkout'
  | 'trip-review-rating'
  | 'trip-history'
  | 'customer-profile'
  | 'driver-profile'
  | 'trip-review-rating-driver';

export const RootNavigator: React.FC = () => {const { colors } = useTheme();
  const styles = getStyles(colors);
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('splash');
  const [tripState, setTripState] = useState<{ driverId?: string; vehicleType?: string; tripDetails?: any; tripId?: string }>({});
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

      socketClient.connect();
      socketClient.onNotification((data: any) => {
        Alert.alert(data.title || 'Notification', data.body || '');
      });

      return () => {
        socketClient.offNotification();
      };
    } else {
      socketClient.disconnect();
    }
  }, [isAuthenticated, activeRole]);

  const handleSplashFinish = useCallback(
    (dest: 'role-select' | 'customer-home' | 'driver-home') => {
      setCurrentScreen(dest);
    },
    []
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.container}>
        {currentScreen === 'splash' && (
          <SplashScreen
            onFinish={handleSplashFinish}
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
            onNavigateCreateTrip={(driverId, vehicleType) => {
              setTripState({ driverId, vehicleType });
              setCurrentScreen('create-trip');
            }}
            onNavigateActiveTrip={(tripId) => {
              setTripState({ ...tripState, tripId });
              setCurrentScreen('active-trip-customer');
            }}
            onNavigateHistory={() => setCurrentScreen('trip-history')}
            onNavigateProfile={() => setCurrentScreen('customer-profile')}
          />
        )}

        {currentScreen === 'create-trip' && (
          <CreateTripScreen
            driverId={tripState.driverId!}
            vehicleType={tripState.vehicleType!}
            onCalculatePrice={(tripDetails) => {
              setTripState({ ...tripState, tripDetails });
              setCurrentScreen('trip-review');
            }}
            onCancel={() => setCurrentScreen('customer-home')}
          />
        )}

        {currentScreen === 'trip-review' && (
          <TripReviewScreen
            tripDetails={tripState.tripDetails}
            onConfirm={(tripId) => {
              setTripState({ ...tripState, tripId });
              setCurrentScreen('waiting-driver');
            }}
            onCancel={() => setCurrentScreen('create-trip')}
          />
        )}

        {currentScreen === 'waiting-driver' && (
          <WaitingForDriverScreen
            tripId={tripState.tripId!}
            onFinish={() => setCurrentScreen('active-trip-customer')}
          />
        )}

        {currentScreen === 'active-trip-customer' && (
          <ActiveTripCustomerScreen
            tripId={tripState.tripId!}
            onTripCompleted={() => setCurrentScreen('trip-review-rating')}
            onNavigatePayment={() => setCurrentScreen('payment-checkout')}
          />
        )}

        {currentScreen === 'payment-checkout' && (
          <PaymentCheckoutScreen
            tripId={tripState.tripId!}
            onPaymentSuccess={() => setCurrentScreen('active-trip-customer')}
            onCancel={() => setCurrentScreen('active-trip-customer')}
          />
        )}

        {currentScreen === 'trip-review-rating' && (
          <TripReviewRatingScreen
            tripId={tripState.tripId!}
            onFinish={() => setCurrentScreen('customer-home')}
          />
        )}

        {currentScreen === 'trip-history' && (
          <TripHistoryScreen 
            onNavigateHome={() => setCurrentScreen(activeRole === 'CUSTOMER' ? 'customer-home' : 'driver-home')}
            onNavigateProfile={() => setCurrentScreen(activeRole === 'CUSTOMER' ? 'customer-profile' : 'driver-profile')}
          />
        )}

        {currentScreen === 'active-trip-driver' && (
          <ActiveTripDriverScreen
            tripId={tripState.tripId!}
            onTripCompleted={() => setCurrentScreen('trip-review-rating-driver')}
          />
        )}

        {currentScreen === 'trip-review-rating-driver' && (
          <TripReviewRatingScreen
            title="Rate the Customer"
            role="DRIVER"
            tripId={tripState.tripId!}
            onFinish={() => setCurrentScreen('driver-home')}
          />
        )}

        {currentScreen === 'driver-home' && (
          <DriverHomeScreen
            onNavigateVehicleDetails={() => setCurrentScreen('vehicle-details')}
            onNavigateDocumentUpload={() => setCurrentScreen('document-upload')}
            onNavigateActiveTrip={(tripId) => {
              setTripState({ tripId });
              setCurrentScreen('active-trip-driver');
            }}
            onNavigateHistory={() => setCurrentScreen('trip-history')}
            onNavigateProfile={() => setCurrentScreen('driver-profile')}
          />
        )}

        {currentScreen === 'vehicle-details' && (
          <VehicleDetailsScreen onBack={() => setCurrentScreen('driver-home')} />
        )}

        {currentScreen === 'document-upload' && (
          <DocumentUploadScreen onBack={() => setCurrentScreen('driver-home')} />
        )}

        {currentScreen === 'customer-profile' && (
          <ProfileScreen 
            role="CUSTOMER"
            onLogout={() => setCurrentScreen('role-select')}
            onNavigateHome={() => setCurrentScreen('customer-home')}
            onNavigateHistory={() => setCurrentScreen('trip-history')}
          />
        )}

        {currentScreen === 'driver-profile' && (
          <ProfileScreen 
            role="DRIVER"
            onLogout={() => setCurrentScreen('role-select')}
            onNavigateHome={() => setCurrentScreen('driver-home')}
            onNavigateHistory={() => setCurrentScreen('trip-history')}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

