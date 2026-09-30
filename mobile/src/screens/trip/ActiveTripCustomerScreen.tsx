import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ScrollView, Alert } from 'react-native';
import { tripApi } from '../../api/trip.api';
import { socketClient } from '../../api/socket.client';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';

interface Props {
  tripId: string;
  onTripCompleted: () => void;
  onNavigatePayment: () => void;
}

export const ActiveTripCustomerScreen: React.FC<Props> = ({ tripId, onTripCompleted, onNavigatePayment }) => {
  const [trip, setTrip] = useState<any>(null);
  const [driverLocation, setDriverLocation] = useState<{ lat: number, lng: number } | null>(null);

  useEffect(() => {
    let interval: any;

    const fetchTrip = async () => {
      try {
        const res = await tripApi.getTrip(tripId);
        setTrip(res.data.data);
        if (res.data.data.status === 'COMPLETED') {
          clearInterval(interval);
          Alert.alert('Trip Completed', 'Your cargo has been delivered successfully!');
          onTripCompleted();
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchTrip();
    interval = setInterval(fetchTrip, 5000); // Polling for status updates

    socketClient.connect();
    socketClient.joinTrip(tripId);
    socketClient.onLocationUpdate((data) => {
      setDriverLocation({ lat: data.lat, lng: data.lng });
    });

    return () => {
      clearInterval(interval);
      socketClient.offLocationUpdate();
      socketClient.disconnect();
    };
  }, [tripId]);


  if (!trip) return <View style={styles.container}><Text>Loading...</Text></View>;

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Trip Status</Text>
        <Text style={styles.statusBadge}>{trip.status}</Text>
      </Card>

      {(trip.status === 'ACCEPTED' || trip.status === 'PAYMENT_PENDING') && (
        <Button title="Pay Now" onPress={onNavigatePayment} />
      )}

      {trip.deliveryOtp && (
        <Card style={styles.card}>
          <Text style={styles.title}>Delivery OTP</Text>
          <Text style={styles.otp}>{trip.deliveryOtp}</Text>
          <Text>Show this to the driver when they deliver the cargo.</Text>
        </Card>
      )}

      <Card style={styles.card}>
        <Text style={styles.title}>Driver Location (Realtime)</Text>
        {driverLocation ? (
          <Text>Lat: {driverLocation.lat.toFixed(4)}, Lng: {driverLocation.lng.toFixed(4)}</Text>
        ) : (
          <Text>Waiting for driver GPS...</Text>
        )}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.title}>Driver Info</Text>
        <Text>Name: {trip.driver?.user?.fullName}</Text>
        <Text>Vehicle: {trip.driver?.vehicle?.make} {trip.driver?.vehicle?.model}</Text>
        <Text>Plate: {trip.driver?.vehicle?.plateNumber}</Text>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#FFFFFF' },
  card: { marginBottom: 16 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  statusBadge: { fontSize: 16, fontWeight: 'bold', color: '#007bff' },
  otp: { fontSize: 32, fontWeight: 'bold', letterSpacing: 5, color: 'green', marginVertical: 8 }
});

