import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, FlatList, ActivityIndicator } from 'react-native';
import { tripApi } from '../../api/trip.api';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/common/Card';
import { Header } from '../../components/layout/Header';
import { BottomTabBar } from '../../components/layout/BottomTabBar';
import { colors } from '../../theme/colors';

interface Props {
  onNavigateHome: () => void;
  onNavigateProfile: () => void;
}

export const TripHistoryScreen: React.FC<Props> = ({ onNavigateHome, onNavigateProfile }) => {
  const [trips, setTrips] = useState<any[]>([]);
  const { activeRole } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = activeRole === 'CUSTOMER' ? await tripApi.getCustomerTrips() : await tripApi.getDriverTrips();
      setTrips(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        <Text style={styles.status}>{item.status}</Text>
      </View>
      <Text style={styles.address}>📍 {item.pickupAddress}</Text>
      <Text style={styles.address}>🏁 {item.destinationAddress}</Text>
      <Text style={styles.price}>SAR {item.totalPrice}</Text>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Header title="Trip History" />
      
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.secondary} />
        </View>
      ) : trips.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No trips found.</Text>
        </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}

      <BottomTabBar 
        activeTab="history" 
        onTabChange={(tab) => {
          if (tab === 'home') onNavigateHome();
          if (tab === 'profile') onNavigateProfile();
        }} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  listContent: { padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: colors.textMuted, fontSize: 16 },
  card: { marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.surface, paddingBottom: 8 },
  date: { color: colors.textMuted, fontSize: 12 },
  status: { fontWeight: '700', color: colors.secondary, fontSize: 12 },
  address: { color: colors.text, marginBottom: 8, fontSize: 14 },
  price: { fontWeight: '800', marginTop: 8, color: '#28a745', fontSize: 16, textAlign: 'right' },
});
