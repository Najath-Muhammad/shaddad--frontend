import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
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
      onConfirm(res.data.data.id);
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#FFFFFF' },
  card: { marginBottom: 16 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  total: { fontSize: 18, fontWeight: 'bold', marginTop: 12, color: '#000' }
});

