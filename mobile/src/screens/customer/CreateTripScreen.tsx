import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { tripApi } from '../../api/trip.api';

interface Props {
  driverId: string;
  vehicleType: string;
  onCalculatePrice: (tripDetails: any) => void;
  onCancel: () => void;
}

export const CreateTripScreen: React.FC<Props> = ({ driverId, vehicleType, onCalculatePrice, onCancel }) => {
  const [cargoType, setCargoType] = useState('Furniture');
  const [weightKg, setWeightKg] = useState('500');
  const [quantity, setQuantity] = useState('10');
  const [pickupAddress, setPickupAddress] = useState('Olaya St, Riyadh');
  const [destinationAddress, setDestinationAddress] = useState('King Abdullah Rd, Riyadh');
  const [loading, setLoading] = useState(false);

  const handleCalculatePrice = async () => {
    try {
      setLoading(true);
      const data = {
        pickupLatitude: 24.71,
        pickupLongitude: 46.67,
        destinationLatitude: 24.75,
        destinationLongitude: 46.72,
        weightKg: Number(weightKg),
        vehicleType
      };

      const res = await tripApi.calculatePrice(data);
      const breakdown = res.data.data;

      onCalculatePrice({
        driverId,
        cargoType,
        weightKg: Number(weightKg),
        quantity: Number(quantity),
        pickupAddress,
        destinationAddress,
        pickupLatitude: data.pickupLatitude,
        pickupLongitude: data.pickupLongitude,
        destinationLatitude: data.destinationLatitude,
        destinationLongitude: data.destinationLongitude,
        pricing: breakdown
      });
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error?.message || 'Failed to calculate price');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Input label="Cargo Type" value={cargoType} onChangeText={setCargoType} />
      <Input label="Weight (kg)" value={weightKg} onChangeText={setWeightKg} keyboardType="numeric" />
      <Input label="Quantity" value={quantity} onChangeText={setQuantity} keyboardType="numeric" />
      <Input label="Pickup Address" value={pickupAddress} onChangeText={setPickupAddress} />
      <Input label="Destination Address" value={destinationAddress} onChangeText={setDestinationAddress} />
      <Button title="Calculate Price" onPress={handleCalculatePrice} isLoading={loading} />
      <Button title="Cancel" onPress={onCancel} variant="outline" style={styles.cancelBtn} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#FFFFFF' },
  cancelBtn: { marginTop: 12 }
});
