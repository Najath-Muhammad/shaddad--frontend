import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { tripApi } from '../../api/trip.api';
import { Button } from '../../components/common/Button';

interface Props {
  tripId: string;
  onFinish: () => void;
}

export const WaitingForDriverScreen: React.FC<Props> = ({ tripId, onFinish }) => {
  const [status, setStatus] = useState('PENDING_DRIVER_RESPONSE');

  useEffect(() => {
    let interval = setInterval(async () => {
      try {
        const res = await tripApi.getTrip(tripId);
        const currentStatus = res.data.data.status;
        setStatus(currentStatus);
        
        if (currentStatus !== 'PENDING_DRIVER_RESPONSE') {
          clearInterval(interval);
        }
      } catch (error) {
        console.error(error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [tripId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trip Status</Text>
      
      {status === 'PENDING_DRIVER_RESPONSE' && (
        <>
          <ActivityIndicator size="large" color="#000" style={styles.loader} />
          <Text style={styles.text}>Waiting for driver to accept...</Text>
        </>
      )}

      {status === 'ACCEPTED' && (
        <View style={styles.resultBox}>
          <Text style={[styles.text, { color: 'green' }]}>Driver Accepted your Request!</Text>
          <Button title="Go Home" onPress={onFinish} />
        </View>
      )}

      {status === 'REJECTED' && (
        <View style={styles.resultBox}>
          <Text style={[styles.text, { color: 'red' }]}>Driver Rejected your Request.</Text>
          <Button title="Find Another Driver" onPress={onFinish} />
        </View>
      )}

      {status === 'EXPIRED' && (
        <View style={styles.resultBox}>
          <Text style={[styles.text, { color: 'orange' }]}>Request Expired (No response).</Text>
          <Button title="Find Another Driver" onPress={onFinish} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
  text: { fontSize: 18, textAlign: 'center', marginVertical: 16 },
  loader: { marginVertical: 20 },
  resultBox: { alignItems: 'center', width: '100%' }
});
