import { Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, FlatList, ActivityIndicator } from 'react-native';
import { tripApi } from '../../api/trip.api';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/common/Card';
import { Header } from '../../components/layout/Header';
import { BottomTabBar } from '../../components/layout/BottomTabBar';
import { useTheme } from '../../theme/useTheme';

interface Props {
  onNavigateHome: () => void;
  onNavigateProfile: () => void;
}

export const TripHistoryScreen: React.FC<Props> = ({ onNavigateHome, onNavigateProfile }) => {const { colors } = useTheme();
  const styles = getStyles(colors);
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
    } catch (e: any) {
      console.error(e); Alert.alert('Error loading history', e.response?.data?.error?.message || e.message);
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
      <View style={styles.cardFooter}><View style={styles.reviewsContainer}>{item.reviews?.find((r: any) => r.reviewerRole === activeRole) && <Text style={styles.reviewText}>You rated: {item.reviews?.find((r: any) => r.reviewerRole === activeRole).rating} star</Text>}{item.reviews?.find((r: any) => r.reviewerRole !== activeRole) && <Text style={styles.reviewText}>They rated: {item.reviews?.find((r: any) => r.reviewerRole !== activeRole).rating} star</Text>}</View><Text style={styles.price}>SAR {item.totalPrice}</Text></View>
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

const getStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  listContent: { padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: colors.textMuted, fontSize: 16 },
  card: { marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.surface, paddingBottom: 8 },
  date: { color: colors.textMuted, fontSize: 12 },
  status: { fontWeight: '700', color: colors.secondary, fontSize: 12 },
  address: { color: colors.text, marginBottom: 8, fontSize: 14 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 8 }, reviewsContainer: { flex: 1 }, reviewText: { fontSize: 12, color: colors.textMuted }, price: { fontWeight: '800', color: '#28a745', fontSize: 16, textAlign: 'right' },
});



