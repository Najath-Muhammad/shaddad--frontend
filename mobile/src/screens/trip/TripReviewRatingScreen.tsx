import React, { useState } from 'react';
import { View, StyleSheet, Text, Alert, TextInput } from 'react-native';
import { Button } from '../../components/common/Button';
import { tripApi } from '../../api/trip.api';

interface Props {
  tripId: string;
  onFinish: () => void;
  title?: string;
  role?: 'CUSTOMER' | 'DRIVER';
}

export const TripReviewRatingScreen: React.FC<Props> = ({ tripId, onFinish, title = 'Rate Your Driver', role = 'CUSTOMER' }) => {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await tripApi.submitReview(tripId, rating, comment, role);
      Alert.alert('Thank you', 'Your review has been submitted.');
      onFinish();
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error?.message || 'Failed to submit review');
      onFinish(); // Finish anyway so they don't get stuck
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      <Text style={styles.label}>Rating (1-5)</Text>
      <View style={styles.ratingRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Text
            key={star}
            style={[styles.star, rating >= star ? styles.starSelected : styles.starUnselected]}
            onPress={() => setRating(star)}
          >
            ★
          </Text>
        ))}
      </View>

      <Text style={styles.label}>Comment (Optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="How was your trip?"
        value={comment}
        onChangeText={setComment}
        multiline
      />

      <Button title="Submit Review" onPress={handleSubmit} isLoading={loading} />
      <Button title="Skip" onPress={onFinish} variant="outline" style={{ marginTop: 12 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#FFF', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 32, textAlign: 'center' },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  ratingRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 24 },
  star: { fontSize: 48 },
  starSelected: { color: '#FFD700' },
  starUnselected: { color: '#E0E0E0' },
  input: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 24
  }
});
