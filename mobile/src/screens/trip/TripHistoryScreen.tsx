import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, FlatList } from 'react-native';
import { tripApi } from '../../api/trip.api';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

interface Props {
  onBack: () => void;
}

export const TripHistoryScreen: React.FC<Props> = ({ onBack }) => {
  const [trips, setTrips] = useState<any[]>([]);
  const { activeRole } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      // Both customer and driver trip APIs are essentially fetching their own lists
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
      <Text style={styles.status}>Status: {item.status}</Text>
      <Text>Pickup: {item.pickupAddress}</Text>
      <Text>Destination: {item.destinationAddress}</Text>
      <Text>Date: {new Date(item.createdAt).toLocaleDateString()}</Text>
      <Text style={styles.price}>Total: SAR {item.totalPrice}</Text>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trip History</Text>
      {loading ? (
        <Text>Loading history...</Text>
      ) : trips.length === 0 ? (
        <Text>No trips found.</Text>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
      <Button title="Back to Home" onPress={onBack} variant="outline" style={styles.backButton} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#FFF' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  card: { marginBottom: 12 },
  status: { fontWeight: 'bold', color: '#007bff', marginBottom: 4 },
  price: { fontWeight: 'bold', marginTop: 8, color: '#28a745' },
  backButton: { marginTop: 16 }
});
