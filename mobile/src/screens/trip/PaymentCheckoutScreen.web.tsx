import React, { useState } from 'react';
import { View, StyleSheet, Text, Alert } from 'react-native';
import { Button } from '../../components/common/Button';
import { tripApi } from '../../api/trip.api';

interface Props {
  tripId: string;
  onPaymentSuccess: () => void;
  onCancel: () => void;
}

export const PaymentCheckoutScreen: React.FC<Props> = ({ tripId, onPaymentSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);

  const simulatePayment = async () => {
    try {
      setLoading(true);
      await tripApi.initiatePayment(tripId);
      // Call simulation endpoint to trigger the backend webhook flow
      await tripApi.simulatePaymentSuccess(tripId);

      Alert.alert('Success', 'Web payment simulated (Native Stripe required for real sheet).');
      onPaymentSuccess();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Secure Checkout (Web Mode)</Text>
      <Text style={styles.text}>Stripe Native is not supported on Web. Click below to simulate.</Text>
      
      <Button
        title="Simulate Payment"
        onPress={simulatePayment}
        isLoading={loading}
      />
      <Button title="Cancel" onPress={onCancel} variant="outline" style={{ marginTop: 12 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#FFFFFF', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  text: { fontSize: 16, textAlign: 'center', marginBottom: 32, color: '#666' }
});
