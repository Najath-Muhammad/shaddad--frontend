import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { colors } from '../../theme/colors';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { FormContainer } from '../../components/common/FormContainer';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { driverApi } from '../../api/driver.api';
import { useAuth } from '../../hooks/useAuth';

interface VehicleDetailsScreenProps {
  onBack: () => void;
}

export const VehicleDetailsScreen: React.FC<VehicleDetailsScreenProps> = ({ onBack }) => {
  const [vehicleType, setVehicleType] = useState('DYNA');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!make || !model || !year || !licensePlate) {
      setError('Please fill all fields');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await driverApi.createVehicle({
        vehicleType: vehicleType as any,
        make,
        model,
        year: parseInt(year),
        plateNumber: licensePlate
      });
      Alert.alert('Success', 'Vehicle details updated successfully');
      onBack();
    } catch (err: any) {
      setError(err.message || 'Failed to update vehicle details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Vehicle Details"
        subtitle="Manage your vehicle"
        rightAction={<Button title="Back" variant="outline" onPress={onBack} />}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <FormContainer>
            {error && <ErrorBanner message={error} />}
            <Input
              label="Vehicle Type (DYNA, PICKUP, TRUCK, etc.)"
              value={vehicleType}
              onChangeText={setVehicleType}
              autoCapitalize="characters"
            />
            <Input
              label="Make"
              value={make}
              onChangeText={setMake}
              placeholder="e.g. Toyota"
            />
            <Input
              label="Model"
              value={model}
              onChangeText={setModel}
              placeholder="e.g. Hilux"
            />
            <Input
              label="Year"
              value={year}
              onChangeText={setYear}
              keyboardType="numeric"
              placeholder="e.g. 2021"
            />
            <Input
              label="License Plate"
              value={licensePlate}
              onChangeText={setLicensePlate}
              autoCapitalize="characters"
              placeholder="e.g. ABC 1234"
            />
            <Button
              title="Save Details"
              onPress={handleSubmit}
              isLoading={loading}
              style={styles.saveButton}
            />
          </FormContainer>
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
  },
  saveButton: {
    marginTop: 10,
  }
});
