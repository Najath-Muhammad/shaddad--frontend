import React from 'react';
import { View, Text, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { tripApi } from '../../api/trip.api';

interface Props {
  trip: any;
  visible: boolean;
  onRespond: (accepted: boolean) => void;
}

export const IncomingRequestModal: React.FC<Props> = ({ trip, visible, onRespond }) => {
  const [loading, setLoading] = React.useState(false);

  const handleRespond = async (accept: boolean) => {
    try {
      setLoading(true);
      await tripApi.respondToTrip(trip.id, accept);
      onRespond(accept);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!trip) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <Card style={styles.card}>
          <Text style={styles.title}>New Trip Request</Text>
          <Text style={styles.text}>From: {trip.pickupAddress}</Text>
          <Text style={styles.text}>To: {trip.destinationAddress}</Text>
          <Text style={styles.text}>Distance: {trip.distanceKm} km</Text>
          <Text style={styles.text}>Cargo: {trip.cargoType} ({trip.weightKg}kg)</Text>
          <Text style={styles.earnings}>Earnings: {trip.driverEarnings} SAR</Text>
          
          <View style={styles.buttons}>
            {loading ? <ActivityIndicator /> : (
              <>
                <Button title="Reject" onPress={() => handleRespond(false)} variant="outline" style={styles.btn} />
                <Button title="Accept" onPress={() => handleRespond(true)} style={styles.btn} />
              </>
            )}
          </View>
        </Card>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  card: { padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  text: { fontSize: 14, marginVertical: 4 },
  earnings: { fontSize: 18, fontWeight: 'bold', marginVertical: 12, color: 'green', textAlign: 'center' },
  buttons: { flexDirection: 'row', gap: 10, marginTop: 10 },
  btn: { flex: 1 }
});
