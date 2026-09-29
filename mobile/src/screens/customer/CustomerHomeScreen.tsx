import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { colors } from '../../theme/colors';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { customerDriverApi } from '../../api/driver.api';
import { tripApi } from '../../api/trip.api';
import { ActiveTripCard } from '../../components/trip/ActiveTripCard';
interface CustomerHomeScreenProps {
  onLogout: () => void;
  onNavigateCreateTrip: (driverId: string, vehicleType: string) => void;
  onNavigateActiveTrip: (tripId: string) => void;
}

export const CustomerHomeScreen: React.FC<CustomerHomeScreenProps> = ({
  onLogout,
  onNavigateCreateTrip,
  onNavigateActiveTrip,
}) => {
  const { user, logout } = useAuth();
  const [nearbyDrivers, setNearbyDrivers] = useState<any[]>([]);
  const [loadingDrivers, setLoadingDrivers] = useState(true);
  const [activeTrip, setActiveTrip] = useState<any>(null);

  const fetchActiveTrip = async () => {
    try {
      const response = await tripApi.getCustomerTrips();
      if (response.data?.data) {
        const acceptedTrip = response.data.data.find((t: any) => 
          !['PENDING_DRIVER_RESPONSE', 'REJECTED', 'EXPIRED', 'COMPLETED'].includes(t.status)
        );
        setActiveTrip(acceptedTrip || null);
      }
    } catch (error) {
      console.error('Failed to fetch customer trips:', error);
    }
  };

  const fetchNearbyDrivers = async () => {
    setLoadingDrivers(true);
    try {
      // Hardcoding Riyadh coordinates for simulation
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
    
    // Poll for active trips every 10 seconds
    const intervalId = setInterval(fetchActiveTrip, 10000);
    return () => clearInterval(intervalId);
  }, []);

  const handleLogout = async () => {
    await logout();
    onLogout();
  };

  return (
    <View style={styles.container}>
      <Header
        title="SHADDAD"
        subtitle="Customer Mode"
        rightAction={
          <Button
            title="Sign Out"
            variant="outline"
            onPress={handleLogout}
            style={styles.signOutButton}
            textStyle={styles.signOutText}
          />
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Active Trip Section */}
        {activeTrip && <ActiveTripCard trip={activeTrip} role="CUSTOMER" onPress={() => onNavigateActiveTrip(activeTrip.id)} />}

        {/* Nearby Drivers */}
        <Card style={styles.driversCard}>
          <View style={styles.driversHeader}>
            <Text style={styles.sectionTitle}>Nearby Drivers</Text>
            <Button
              title="Refresh"
              onPress={fetchNearbyDrivers}
              variant="outline"
              style={styles.refreshButton}
              textStyle={styles.refreshText}
            />
          </View>
          
          {loadingDrivers ? (
            <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />
          ) : nearbyDrivers.length === 0 ? (
            <Text style={styles.noDriversText}>No drivers found nearby.</Text>
          ) : (
            <FlatList
              data={nearbyDrivers}
              keyExtractor={(item, index) => index.toString()}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={styles.driverItem}>
                  <View style={styles.driverAvatar}>
                    <Text style={styles.driverAvatarText}>
                      {item.fullName?.charAt(0).toUpperCase() || 'D'}
                    </Text>
                  </View>
                  <View style={styles.driverInfo}>
                    <Text style={styles.driverName}>{item.fullName || 'Driver'}</Text>
                    {item.vehicle && (
                      <Text style={styles.driverVehicle}>
                        {item.vehicle.make} {item.vehicle.model}
                      </Text>
                    )}
                  </View>
                  <Button 
                    title="Request" 
                    onPress={() => onNavigateCreateTrip(
                      item.id, 
                      item.vehicle?.vehicleType || 'DYNA' 
                    )} 
                  />
                </View>
              )}
            />
          )}
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  signOutButton: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  signOutText: {
    fontSize: 12,
    fontWeight: '600',
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  driversCard: {
    padding: 16,
  },
  driversHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  refreshButton: {
    height: 30,
    paddingHorizontal: 12,
  },
  refreshText: {
    fontSize: 12,
  },
  loader: {
    marginVertical: 20,
  },
  noDriversText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginVertical: 20,
  },
  driverItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  driverAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  driverAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.secondary,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  driverVehicle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
});
