import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { useAuthStore } from '../../store/authStore';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { FormContainer } from '../../components/common/FormContainer';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { driverApi } from '../../api/driver.api';

type VehicleTypeValue =
  | 'DYNA'
  | 'PICKUP_SMALL'
  | 'PICKUP_LARGE'
  | 'TRAILER'
  | 'FLATBED'
  | 'REFRIGERATED'
  | 'BOX_TRUCK';

interface VehicleTypeOption {
  value: VehicleTypeValue;
  label: string;
  labelAr: string;
  emoji: string;
  description: string;
  capacity: string;
  autoRefrigerated?: boolean;
}

const VEHICLE_TYPES: VehicleTypeOption[] = [
  {
    value: 'DYNA',
    label: 'Dyna',
    labelAr: 'دينا',
    emoji: '🚛',
    description: 'City & local deliveries',
    capacity: 'Up to 3 tons',
  },
  {
    value: 'PICKUP_SMALL',
    label: 'Small Pickup',
    labelAr: 'بيك أب صغير',
    emoji: '🛻',
    description: 'Light cargo & small loads',
    capacity: 'Up to 1.5 tons',
  },
  {
    value: 'PICKUP_LARGE',
    label: 'Large Pickup',
    labelAr: 'بيك أب كبير',
    emoji: '🛻',
    description: 'Medium cargo loads',
    capacity: 'Up to 5 tons',
  },
  {
    value: 'TRAILER',
    label: 'Trailer',
    labelAr: 'تريلا',
    emoji: '🚚',
    description: 'Long haul & heavy freight',
    capacity: 'Up to 40 tons',
  },
  {
    value: 'FLATBED',
    label: 'Flatbed',
    labelAr: 'شاحنة مسطحة',
    emoji: '🏗️',
    description: 'Construction & oversized cargo',
    capacity: 'Up to 20 tons',
  },
  {
    value: 'REFRIGERATED',
    label: 'Refrigerated',
    labelAr: 'مبردة',
    emoji: '❄️',
    description: 'Cold chain & perishable goods',
    capacity: 'Up to 10 tons',
    autoRefrigerated: true,
  },
  {
    value: 'BOX_TRUCK',
    label: 'Box Truck',
    labelAr: 'شاحنة صندوق',
    emoji: '📦',
    description: 'Enclosed cargo, all weather',
    capacity: 'Up to 8 tons',
  },
];

interface VehicleDetailsScreenProps {
  onBack: () => void;
}

export const VehicleDetailsScreen: React.FC<VehicleDetailsScreenProps> = ({ onBack }) => {const { colors } = useTheme();
  const user = useAuthStore((state) => state.user);
  const vehicle = user?.driverProfile?.vehicle;
  const styles = getStyles(colors);
  const [vehicleType, setVehicleType] = useState<VehicleTypeValue>((vehicle?.vehicleType as VehicleTypeValue) || 'DYNA');
  const [make, setMake] = useState(vehicle?.make || '');
  const [model, setModel] = useState(vehicle?.model || '');
  const [year, setYear] = useState(vehicle?.year?.toString() || '');
  const [licensePlate, setLicensePlate] = useState(vehicle?.plateNumber || '');
  const [color, setColor] = useState(vehicle?.color || '');
  const [maxWeightKg, setMaxWeightKg] = useState(vehicle?.maxWeightKg?.toString() || '');
  const [maxLengthCm, setMaxLengthCm] = useState(vehicle?.maxLengthCm?.toString() || '');
  const [isRefrigerated, setIsRefrigerated] = useState(vehicle?.isRefrigerated || false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectType = (option: VehicleTypeOption) => {
    setVehicleType(option.value);
    // Auto-check refrigerated when selecting the refrigerated vehicle type
    if (option.autoRefrigerated) {
      setIsRefrigerated(true);
    } else {
      setIsRefrigerated(false);
    }
  };

  const handleSubmit = async () => {
    if (!make || !model || !year || !licensePlate || !color || !maxWeightKg) {
      setError('Please fill all required fields');
      return;
    }
    const yearInt = parseInt(year, 10);
    const weightFloat = parseFloat(maxWeightKg);
    if (isNaN(yearInt) || isNaN(weightFloat) || weightFloat <= 0) {
      setError('Year and max weight must be valid numbers');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const payload = {
        vehicleType,
        make,
        model,
        year: yearInt,
        plateNumber: licensePlate,
        color,
        maxWeightKg: weightFloat,
        ...(maxLengthCm ? { maxLengthCm: parseFloat(maxLengthCm) } : {}),
        isRefrigerated,
      };

      let updatedVehicle;
      if (vehicle?.id) {
        const res = await driverApi.updateVehicle(payload);
        updatedVehicle = res.data;
      } else {
        const res = await driverApi.createVehicle(payload as any);
        updatedVehicle = res.data;
      }

      if (user && user.driverProfile) {
        useAuthStore.getState().setUser({
          ...user,
          driverProfile: {
            ...user.driverProfile,
            vehicle: updatedVehicle
          }
        });
      }

      Alert.alert('Success', 'Vehicle details saved successfully');
      onBack();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save vehicle details';
      setError(message);
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

            {/* ── Vehicle Type Selector ── */}
            <Text style={styles.sectionLabel}>Vehicle Type *</Text>
            <Text style={styles.sectionHint}>Select the category that best matches your truck</Text>

            <View style={styles.typeGrid}>
              {VEHICLE_TYPES.map((option) => {
                const selected = vehicleType === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.typeCard, selected && styles.typeCardSelected]}
                    onPress={() => handleSelectType(option)}
                    activeOpacity={0.75}
                  >
                    {/* Checkmark badge */}
                    {selected && (
                      <View style={styles.checkBadge}>
                        <Text style={styles.checkBadgeText}>✓</Text>
                      </View>
                    )}

                    <Text style={styles.typeEmoji}>{option.emoji}</Text>

                    <Text style={[styles.typeLabel, selected && styles.typeLabelSelected]}>
                      {option.label}
                    </Text>
                    <Text style={[styles.typeLabelAr, selected && styles.typeLabelArSelected]}>
                      {option.labelAr}
                    </Text>
                    <Text style={[styles.typeDesc, selected && styles.typeDescSelected]}>
                      {option.description}
                    </Text>
                    <View style={[styles.capacityBadge, selected && styles.capacityBadgeSelected]}>
                      <Text style={[styles.typeCapacity, selected && styles.typeCapacitySelected]}>
                        {option.capacity}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* ── Rest of the form ── */}
            <Input
              label="Make *"
              value={make}
              onChangeText={setMake}
              placeholder="e.g. Toyota"
            />
            <Input
              label="Model *"
              value={model}
              onChangeText={setModel}
              placeholder="e.g. Hilux"
            />
            <Input
              label="Year *"
              value={year}
              onChangeText={setYear}
              keyboardType="numeric"
              placeholder="e.g. 2021"
            />
            <Input
              label="License Plate *"
              value={licensePlate}
              onChangeText={setLicensePlate}
              autoCapitalize="characters"
              placeholder="e.g. ABC 1234"
            />
            <Input
              label="Color *"
              value={color}
              onChangeText={setColor}
              placeholder="e.g. White"
            />
            <Input
              label="Max Weight (kg) *"
              value={maxWeightKg}
              onChangeText={setMaxWeightKg}
              keyboardType="numeric"
              placeholder="e.g. 1500"
            />
            <Input
              label="Max Length (cm) — optional"
              value={maxLengthCm}
              onChangeText={setMaxLengthCm}
              keyboardType="numeric"
              placeholder="e.g. 500"
            />

            {/* ── Refrigerated Toggle ── */}
            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => setIsRefrigerated((prev) => !prev)}
            >
              <View style={[styles.checkbox, isRefrigerated && styles.checkboxChecked]}>
                {isRefrigerated && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View>
                <Text style={styles.toggleLabel}>Refrigerated Vehicle</Text>
                <Text style={styles.toggleSub}>Has built-in cooling/freezing unit</Text>
              </View>
            </TouchableOpacity>

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

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 48,
  },
  saveButton: {
    marginTop: 10,
  },

  // Section header
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  sectionHint: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 14,
  },

  // Vehicle type card grid
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  typeCard: {
    width: '47%',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    position: 'relative',
  },
  typeCardSelected: {
    backgroundColor: colors.secondary, // #000000
    borderColor: colors.secondary,
  },

  // Checkmark badge (top-right corner of selected card)
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000',
  },

  // Card content
  typeEmoji: {
    fontSize: 30,
    marginBottom: 10,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  typeLabelSelected: {
    color: '#fff',
  },
  typeLabelAr: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 1,
    marginBottom: 4,
    textAlign: 'left',
  },
  typeLabelArSelected: {
    color: 'rgba(255,255,255,0.55)',
  },
  typeDesc: {
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 15,
    marginTop: 4,
  },
  typeDescSelected: {
    color: 'rgba(255,255,255,0.7)',
  },
  capacityBadge: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: colors.border,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  capacityBadgeSelected: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  typeCapacity: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.2,
  },
  typeCapacitySelected: {
    color: 'rgba(255,255,255,0.6)',
  },

  // Refrigerated toggle
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  checkmark: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
  },
  toggleLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  toggleSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
});




