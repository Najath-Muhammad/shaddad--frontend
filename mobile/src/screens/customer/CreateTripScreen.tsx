import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { tripApi } from '../../api/trip.api';
import { showError } from '../../utils/alertUtils';

interface Props {
  driverId: string;
  vehicleType: string;
  onCalculatePrice: (tripDetails: any) => void;
  onCancel: () => void;
}

export const CreateTripScreen: React.FC<Props> = ({ driverId, vehicleType, onCalculatePrice, onCancel }) => {
  const [cargoType, setCargoType] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [quantity, setQuantity] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleCalculatePrice = async () => {
    setLocalError(null);

    if (!cargoType.trim()) {
      setLocalError('Please specify the cargo type.');
      return;
    }
    const parsedWeight = Number(weightKg);
    if (!weightKg.trim() || isNaN(parsedWeight) || parsedWeight <= 0) {
      setLocalError('Please enter a valid weight greater than 0.');
      return;
    }
    const parsedQuantity = Number(quantity);
    if (!quantity.trim() || isNaN(parsedQuantity) || parsedQuantity <= 0) {
      setLocalError('Please enter a valid quantity greater than 0.');
      return;
    }
    if (!pickupAddress.trim()) {
      setLocalError('Please enter a pickup address.');
      return;
    }
    if (!destinationAddress.trim()) {
      setLocalError('Please enter a destination address.');
      return;
    }

    try {
      setLoading(true);
      // Generate some offset coords for mock calculation
      const data = {
        pickupLatitude: 24.71 + (Math.random() * 0.05),
        pickupLongitude: 46.67 + (Math.random() * 0.05),
        destinationLatitude: 24.75 + (Math.random() * 0.05),
        destinationLongitude: 46.72 + (Math.random() * 0.05),
        weightKg: parsedWeight,
        vehicleType
      };

      const res = await tripApi.calculatePrice(data);
      const breakdown = res.data.data;

      onCalculatePrice({
        driverId,
        cargoType,
        weightKg: parsedWeight,
        quantity: parsedQuantity,
        pickupAddress,
        destinationAddress,
        pickupLatitude: data.pickupLatitude,
        pickupLongitude: data.pickupLongitude,
        destinationLatitude: data.destinationLatitude,
        destinationLongitude: data.destinationLongitude,
        pricing: breakdown
      });
    } catch (error) {
      showError(error, 'Failed to calculate price');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <ErrorBanner message={localError} />
      <Input label="Cargo Type" value={cargoType} onChangeText={setCargoType} placeholder="e.g. Furniture, Electronics" />
      <Input label="Weight (kg)" value={weightKg} onChangeText={setWeightKg} keyboardType="numeric" placeholder="e.g. 50" />
      <Input label="Quantity" value={quantity} onChangeText={setQuantity} keyboardType="numeric" placeholder="e.g. 2" />
      <Input label="Pickup Address" value={pickupAddress} onChangeText={setPickupAddress} placeholder="Enter pickup address" />
      <Input label="Destination Address" value={destinationAddress} onChangeText={setDestinationAddress} placeholder="Enter destination address" />
      <Button title="Calculate Price" onPress={handleCalculatePrice} isLoading={loading} style={{ marginTop: 12 }} />
      <Button title="Cancel" onPress={onCancel} variant="outline" style={styles.cancelBtn} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#FFFFFF' },
  cancelBtn: { marginTop: 12 }
});
