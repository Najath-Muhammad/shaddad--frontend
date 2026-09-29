import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ScrollView, Alert } from 'react-native';
import { tripApi } from '../../api/trip.api';
import { socketClient } from '../../api/socket.client';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';

interface Props {
  tripId: string;
  onTripCompleted: () => void;
}

export const ActiveTripDriverScreen: React.FC<Props> = ({ tripId, onTripCompleted }) => {
  const [trip, setTrip] = useState<any>(null);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchTrip = async () => {
    try {
      const res = await tripApi.getDriverTrip(tripId);
      setTrip(res.data.data);
      if (res.data.data.status === 'COMPLETED') {
        onTripCompleted();
      }
    } catch (e: any) {
      console.error('fetchTrip Error:', e.response?.data || e.message);
      if (e.response?.status === 404) {
        Alert.alert('Trip not found', 'This trip may have been deleted or expired.');
        onTripCompleted(); // Navigate away
      }
    }
  };

  useEffect(() => {
    fetchTrip();
    const interval = setInterval(fetchTrip, 5000); // Polling for status

    socketClient.connect();
    socketClient.joinTrip(tripId);

    // Simulate GPS updates every 3 seconds
    let lat = 24.71;
    let lng = 46.67;
    const gpsInterval = setInterval(() => {
      lat += 0.001; // simulate moving
      lng += 0.001;
      socketClient.sendLocation(tripId, lat, lng);
    }, 3000);

    return () => {
      clearInterval(interval);
      clearInterval(gpsInterval);
      socketClient.disconnect();
    };
  }, [tripId]);

  const handleUpdateStatus = (status: string) => {
    const actionNames: Record<string, string> = {
      GOING_TO_PICKUP: 'Go To Pickup',
      DRIVER_ARRIVED: 'Arrived at Pickup',
      CARGO_PICKED_UP: 'Confirm Cargo Picked Up',
      IN_TRANSIT: 'Start Transit',
      ARRIVED_AT_DESTINATION: 'Arrived at Destination'
    };
    
    Alert.alert(
      'Confirm Action',
      `Are you sure you want to update the trip status to "${actionNames[status] || status}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: async () => {
            try {
              setLoading(true);
              await tripApi.updateStatus(tripId, status);
              await fetchTrip();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.error?.message || 'Failed to update status');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleSubmitProof = async () => {
    try {
      setLoading(true);
      await tripApi.submitDeliveryProof(tripId, otp, 'dummy-photo-url');
      Alert.alert('Success', 'Trip Completed!');
      onTripCompleted();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  if (!trip) return <View style={styles.container}><Text>Loading...</Text></View>;

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Trip Status</Text>
        <Text style={styles.statusBadge}>{trip.status}</Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.title}>Actions</Text>
        {trip.status === 'CONFIRMED' && (
          <Button title="Go To Pickup" onPress={() => handleUpdateStatus('GOING_TO_PICKUP')} isLoading={loading} />
        )}
        {trip.status === 'GOING_TO_PICKUP' && (
          <Button title="Arrived at Pickup" onPress={() => handleUpdateStatus('DRIVER_ARRIVED')} isLoading={loading} />
        )}
        {trip.status === 'DRIVER_ARRIVED' && (
          <Button title="Confirm Cargo Picked Up" onPress={() => handleUpdateStatus('CARGO_PICKED_UP')} isLoading={loading} />
        )}
        {trip.status === 'CARGO_PICKED_UP' && (
          <Button title="Start Transit" onPress={() => handleUpdateStatus('IN_TRANSIT')} isLoading={loading} />
        )}
        {trip.status === 'IN_TRANSIT' && (
          <Button title="Arrived at Destination" onPress={() => handleUpdateStatus('ARRIVED_AT_DESTINATION')} isLoading={loading} />
        )}
        
        {trip.status === 'ARRIVED_AT_DESTINATION' && (
          <View>
            <Input label="Customer OTP" value={otp} onChangeText={setOtp} keyboardType="numeric" />
            <Button title="Submit Proof & Complete" onPress={handleSubmitProof} isLoading={loading} />
          </View>
        )}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.title}>Customer Info</Text>
        <Text>Name: {trip.customer?.user?.fullName}</Text>
        <Text>Phone: {trip.customer?.user?.phoneNumber}</Text>
      </Card>
      
      <Card style={styles.card}>
        <Text style={styles.title}>Trip Details</Text>
        <Text>From: {trip.pickupAddress}</Text>
        <Text>To: {trip.destinationAddress}</Text>
        <Text>Cargo: {trip.cargoType} ({trip.weightKg}kg)</Text>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#FFFFFF' },
  card: { marginBottom: 16 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  statusBadge: { fontSize: 16, fontWeight: 'bold', color: '#007bff', marginBottom: 12 }
});
