import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ScrollView, Platform, Modal, TouchableOpacity } from 'react-native';
import { tripApi } from '../../api/trip.api';
import { socketClient } from '../../api/socket.client';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { showError, showSuccess } from '../../utils/alertUtils';

interface Props {
  tripId: string;
  onTripCompleted: () => void;
}

export const ActiveTripDriverScreen: React.FC<Props> = ({ tripId, onTripCompleted }) => {
  const [trip, setTrip] = useState<any>(null);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);

  const actionNames: Record<string, string> = {
    GOING_TO_PICKUP: 'Go To Pickup',
    DRIVER_ARRIVED: 'Arrived at Pickup',
    CARGO_PICKED_UP: 'Confirm Cargo Picked Up',
    IN_TRANSIT: 'Start Transit',
    ARRIVED_AT_DESTINATION: 'Arrived at Destination'
  };

  const fetchTrip = async () => {
    try {
      const res = await tripApi.getDriverTrip(tripId);
      setTrip(res.data.data);
      if (res.data.data.status === 'COMPLETED') {
        onTripCompleted();
      }
    } catch (e) {
      console.error('fetchTrip Error:', e);
      showError(e, 'Trip Error');
      if ((e as any)?.response?.status === 404) {
        onTripCompleted();
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
    setPendingStatus(status);
    setModalVisible(true);
  };

  const confirmStatusUpdate = () => {
    if (pendingStatus) {
      setModalVisible(false);
      executeStatusUpdate(pendingStatus);
      setPendingStatus(null);
    }
  };

  const executeStatusUpdate = async (status: string) => {
    try {
      setLoading(true);
      await tripApi.updateStatus(tripId, status);
      await fetchTrip();
    } catch (error) {
      showError(error, 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProof = async () => {
    try {
      setLoading(true);
      await tripApi.submitDeliveryProof(tripId, otp, 'dummy-photo-url');
      showSuccess('Trip Completed!');
      onTripCompleted();
    } catch (error) {
      showError(error, 'Invalid OTP');
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

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirm Action</Text>
            </View>
            
            <Text style={styles.modalBody}>
              Are you sure you want to update the trip status to "{pendingStatus ? actionNames[pendingStatus] : ''}"?
            </Text>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonCancel]} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonConfirm]} 
                onPress={confirmStatusUpdate}
              >
                <Text style={styles.modalButtonTextConfirm}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#FFFFFF' },
  card: { marginBottom: 16 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  statusBadge: { fontSize: 16, fontWeight: 'bold', color: '#007bff', marginBottom: 12 },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  modalBody: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  modalButtonCancel: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  modalButtonConfirm: {
    backgroundColor: '#007bff',
  },
  modalButtonTextCancel: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  modalButtonTextConfirm: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});

