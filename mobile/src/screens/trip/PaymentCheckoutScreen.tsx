import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Alert } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { Button } from '../../components/common/Button';
import { tripApi } from '../../api/trip.api';

interface Props {
  tripId: string;
  onPaymentSuccess: () => void;
  onCancel: () => void;
}

export const PaymentCheckoutScreen: React.FC<Props> = ({ tripId, onPaymentSuccess, onCancel }) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isSimulated, setIsSimulated] = useState(false);

  useEffect(() => {
    initializePaymentSheet();
  }, []);

  const initializePaymentSheet = async () => {
    try {
      setLoading(true);
      const res = await tripApi.initiatePayment(tripId);
      const secret = res.data.data.clientSecret;
      setClientSecret(secret);

      const { error } = await initPaymentSheet({
        merchantDisplayName: 'Shaddad Logistics',
        paymentIntentClientSecret: secret,
        allowsDelayedPaymentMethods: true,
        defaultBillingDetails: {
          name: 'Test Customer',
        }
      });
      if (error) {
        Alert.alert('Stripe Setup Error', error.message);
        setIsSimulated(true); // Fallback if keys are invalid
      }
    } catch (error: any) {
      Alert.alert('Backend Stripe Error', error.response?.data?.error?.message || 'Unknown error');
      setIsSimulated(true); // Fallback if backend keys are invalid
    } finally {
      setLoading(false);
    }
  };

  const openPaymentSheet = async () => {
    if (isSimulated || !clientSecret) {
      Alert.alert(
        'Stripe Not Configured', 
        'Valid Stripe keys were not found on the server or app. Simulating successful payment for testing purposes.',
        [{ text: 'OK', onPress: onPaymentSuccess }]
      );
      return;
    }

    const { error } = await presentPaymentSheet();

    if (error) {
      Alert.alert(`Error code: ${error.code}`, error.message);
    } else {
      Alert.alert('Success', 'Your payment is confirmed!');
      onPaymentSuccess();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Secure Checkout</Text>
      <Text style={styles.text}>Your trip has been accepted. Please complete the payment to confirm the dispatch.</Text>
      
      <Button
        title={isSimulated ? "Simulate Payment" : "Pay Now"}
        onPress={openPaymentSheet}
        isLoading={loading}
        disabled={loading}
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

