import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Text } from 'react-native';
import { colors } from '../../theme/colors';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { driverApi } from '../../api/driver.api';

interface DocumentUploadScreenProps {
  onBack: () => void;
}

export const DocumentUploadScreen: React.FC<DocumentUploadScreenProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(false);

  const handleUpload = async (docType: string) => {
    setLoading(true);
    try {
      // Mock document upload for Expo without image picker
      const formData = new FormData();
      formData.append('documentType', docType);
      
      // Simulating a file blob
      formData.append('file', {
        uri: 'file://dummy/path/to/image.jpg',
        name: 'dummy.jpg',
        type: 'image/jpeg',
      } as any);

      await driverApi.uploadDocuments(formData);
      Alert.alert('Success', `${docType} uploaded successfully (Simulated)`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Upload Documents"
        subtitle="Verification documents"
        rightAction={<Button title="Back" variant="outline" onPress={onBack} />}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.title}>ID / Iqama</Text>
          <Text style={styles.desc}>Upload a clear picture of your ID.</Text>
          <Button
            title="Upload ID"
            onPress={() => handleUpload('ID')}
            isLoading={loading}
          />
        </Card>

        <Card style={styles.card}>
          <Text style={styles.title}>Driving License</Text>
          <Text style={styles.desc}>Upload your valid driving license.</Text>
          <Button
            title="Upload License"
            onPress={() => handleUpload('LICENSE')}
            isLoading={loading}
          />
        </Card>

        <Card style={styles.card}>
          <Text style={styles.title}>Vehicle Registration (Istimara)</Text>
          <Text style={styles.desc}>Upload your vehicle registration.</Text>
          <Button
            title="Upload Registration"
            onPress={() => handleUpload('REGISTRATION')}
            isLoading={loading}
          />
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  card: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  desc: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 16,
  },
});
