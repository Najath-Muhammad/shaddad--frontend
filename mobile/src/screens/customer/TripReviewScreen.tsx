import React, { useState } from 'react';
import { View, StyleSheet, Text, Modal, TouchableOpacity } from 'react-native';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { tripApi } from '../../api/trip.api';
import { showError } from '../../utils/alertUtils';

interface Props {
  tripDetails: any;
  onConfirm: (tripId: string) => void;
  onCancel: () => void;
}

export const TripReviewScreen: React.FC<Props> = ({ tripDetails, onConfirm, onCancel }) => {
  const { 
    driverId, cargoType, weightKg, quantity, 
    pickupAddress, destinationAddress, pickupLatitude, pickupLongitude, 
    destinationLatitude, destinationLongitude, pricing 
  } = tripDetails;

  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdTripId, setCreatedTripId] = useState<string>('');

  const handleConfirm = async () => {
    try {
      setLoading(true);
      const tripData = {
        driverProfileId: driverId,
        pickupLatitude, pickupLongitude, pickupAddress,
        destinationLatitude, destinationLongitude, destinationAddress,
        pickupDateTime: new Date(Date.now() + 3600000).toISOString(),
        cargoType, weightKg: Number(weightKg), quantity: Number(quantity),
        additionalRequirements: 'None'
      };

      const res = await tripApi.createTrip(tripData);
      setCreatedTripId(res.data.data.id);
      setShowSuccessModal(true);
    } catch (error) {
      showError(error, 'Failed to create trip');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Trip Summary</Text>
        <Text>From: {pickupAddress}</Text>
        <Text>To: {destinationAddress}</Text>
        <Text>Cargo: {cargoType} ({weightKg}kg)</Text>
      </Card>
      
      <Card style={styles.card}>
        <Text style={styles.title}>Price Breakdown</Text>
        <Text>Base Fare: {pricing.pricing.baseFare} SAR</Text>
        <Text>Distance Charge: {pricing.pricing.distanceCharge} SAR</Text>
        <Text>Weight Charge: {pricing.pricing.weightCharge} SAR</Text>
        <Text style={styles.total}>Total Price: {pricing.pricing.totalPrice} SAR</Text>
      </Card>

      <Button title="Confirm & Request" onPress={handleConfirm} isLoading={loading} />
      <Button title="Cancel" onPress={onCancel} variant="outline" style={{ marginTop: 12 }} />

      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successIconContainer}>
              <Text style={styles.successIcon}>✨</Text>
            </View>
            <Text style={styles.modalTitle}>Request Sent!</Text>
            <Text style={styles.modalText}>
              Your trip request has been successfully sent to the driver. 
              You can now request other nearby drivers if you'd like.
            </Text>
            <TouchableOpacity 
              style={styles.modalButton} 
              onPress={() => onConfirm(createdTripId)}
            >
              <Text style={styles.modalButtonText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#FFFFFF' },
  card: { marginBottom: 16 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  total: { fontSize: 18, fontWeight: 'bold', marginTop: 12, color: '#000' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  successIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successIcon: {
    fontSize: 32,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  }
});

