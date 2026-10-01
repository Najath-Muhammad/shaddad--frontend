import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, ActivityIndicator, TouchableOpacity, Modal } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { customerDriverApi } from '../../api/driver.api';
import { tripApi } from '../../api/trip.api';
import { ActiveTripCard } from '../../components/trip/ActiveTripCard';
import { BottomTabBar } from '../../components/layout/BottomTabBar';

interface CustomerHomeScreenProps {
  onNavigateCreateTrip: (driverId: string, vehicleType: string) => void;
  onNavigateActiveTrip: (tripId: string) => void;
  onNavigateHistory: () => void;
  onNavigateProfile: () => void;
}

export const CustomerHomeScreen: React.FC<CustomerHomeScreenProps> = ({
  onNavigateCreateTrip,
  onNavigateActiveTrip,
  onNavigateHistory,
  onNavigateProfile,
}) => {const { colors } = useTheme();
  const styles = getStyles(colors);
  const { user } = useAuth();
  const [nearbyDrivers, setNearbyDrivers] = useState<any[]>([]);
  const [loadingDrivers, setLoadingDrivers] = useState(true);
  const [activeTrip, setActiveTrip] = useState<any>(null);
  const [pendingTrip, setPendingTrip] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const fetchActiveTrip = async () => {
    try {
      const response = await tripApi.getCustomerTrips();
      if (response.data?.data && response.data.data.length > 0) {
        const mostRecentTrip = response.data.data[0];
        
        if (mostRecentTrip.status === 'PENDING_DRIVER_RESPONSE') {
          setPendingTrip(mostRecentTrip);
          setActiveTrip(null);
        } else if (['REJECTED', 'EXPIRED'].includes(mostRecentTrip.status)) {
          // If we were previously pending this trip, show the alert
          if (pendingTrip && pendingTrip.id === mostRecentTrip.id) {
            setModalTitle(mostRecentTrip.status === 'REJECTED' ? 'Request Declined' : 'Request Timeout');
            setModalMessage(mostRecentTrip.status === 'REJECTED' 
              ? 'The driver declined your request. Please select a different driver.'
              : 'The driver did not respond in time. Please try another driver.');
            setModalVisible(true);
          }
          setPendingTrip(null);
          setActiveTrip(null);
        } else if (!['COMPLETED', 'CANCELED'].includes(mostRecentTrip.status)) {
          // Active trip (ACCEPTED, DRIVER_ON_THE_WAY, etc.)
          if (pendingTrip && pendingTrip.id === mostRecentTrip.id) {
            onNavigateActiveTrip(mostRecentTrip.id);
          }
          setActiveTrip(mostRecentTrip);
          setPendingTrip(null);
        } else {
          setActiveTrip(null);
          setPendingTrip(null);
        }
      }
    } catch (error) {
      console.error('Failed to fetch customer trips:', error);
    }
  };

  const fetchNearbyDrivers = async () => {
    setLoadingDrivers(true);
    try {
      const response = await customerDriverApi.getNearbyDrivers(24.7136, 46.6753, 50);
      setNearbyDrivers(response.data || []);
    } catch (error) {
      console.error('Failed to fetch nearby drivers:', error);
    } finally {
      setLoadingDrivers(false);
    }
  };

  useEffect(() => {
    fetchNearbyDrivers();
    fetchActiveTrip();
    
    const intervalId = setInterval(fetchActiveTrip, pendingTrip ? 3000 : 10000);
    return () => clearInterval(intervalId);
  }, [pendingTrip]);

  return (
    <View style={styles.container}>
      <Header title="SHADDAD" subtitle="Customer Mode" />

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Hero Welcome Section */}
        <View style={styles.heroSection}>
          <Text style={styles.greetingText}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.fullName?.split(' ')[0] || 'User'} 👋</Text>
        </View>

        {/* Active Trip Section */}
        {activeTrip && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Trip</Text>
            <ActiveTripCard trip={activeTrip} role="CUSTOMER" onPress={() => onNavigateActiveTrip(activeTrip.id)} />
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity style={styles.quickActionCard} onPress={onNavigateHistory}>
            <Text style={styles.quickActionIcon}>📋</Text>
            <Text style={styles.quickActionText}>Trip History</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionCard} onPress={fetchNearbyDrivers}>
            <Text style={styles.quickActionIcon}>🔄</Text>
            <Text style={styles.quickActionText}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {/* Nearby Drivers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby Drivers</Text>
            <Text style={styles.sectionSubtitle}>Select a driver to request a trip</Text>
          </View>
          
          {loadingDrivers ? (
            <ActivityIndicator size="small" color={colors.secondary} style={styles.loader} />
          ) : nearbyDrivers.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🚚</Text>
              <Text style={styles.emptyText}>No drivers found nearby.</Text>
            </View>
          ) : (
            <View style={styles.driverList}>
              {nearbyDrivers.map((item, index) => (
                <TouchableOpacity 
                  key={index.toString()} 
                  style={styles.driverCard}
                  onPress={() => onNavigateCreateTrip(item.id, item.vehicle?.vehicleType || 'DYNA')}
                  activeOpacity={0.7}
                >
                  <View style={styles.driverAvatar}>
                    <Text style={styles.driverAvatarText}>
                      {item.fullName?.charAt(0).toUpperCase() || 'D'}
                    </Text>
                  </View>
                  <View style={styles.driverInfo}>
                    <Text style={styles.driverName}>{item.fullName || 'Driver'}</Text>
                    {item.vehicle ? (
                      <View style={styles.vehiclePill}>
                        <Text style={styles.vehiclePillText}>
                          {item.vehicle.make} {item.vehicle.model}
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.driverVehicle}>No vehicle info</Text>
                    )}
                  </View>
                  <View style={styles.requestButton}>
                    <Text style={styles.requestButtonText}>Request</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <Text style={styles.modalText}>{modalMessage}</Text>
            <TouchableOpacity 
              style={styles.modalButton} 
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Okay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <BottomTabBar 
        activeTab="home" 
        onTabChange={(tab) => {
          if (tab === 'history') onNavigateHistory();
          if (tab === 'profile') onNavigateProfile();
        }} 
      />
    </View>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  
  // Hero
  heroSection: {
    marginBottom: 24,
    paddingTop: 8,
  },
  greetingText: {
    fontSize: 16,
    color: colors.textMuted,
  },
  userName: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginTop: 4,
  },

  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },

  // Quick Actions
  quickActionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },

  // Driver List
  loader: {
    marginVertical: 40,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 12,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 15,
    color: colors.textMuted,
    fontWeight: '500',
  },
  driverList: {
    gap: 12,
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  driverAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  vehiclePill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  vehiclePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  driverVehicle: {
    fontSize: 13,
    color: colors.textLight,
  },
  requestButton: {
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  requestButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  pendingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 24,
  },
  pendingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  pendingText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});




