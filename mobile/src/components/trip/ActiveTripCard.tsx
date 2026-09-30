import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../common/Card';
import { useTheme } from '../../theme/useTheme';

interface ActiveTripCardProps {
  trip: any;
  role: 'CUSTOMER' | 'DRIVER';
  onPress?: () => void;
}

export const ActiveTripCard: React.FC<ActiveTripCardProps> = ({ trip, role, onPress }) => {const { colors } = useTheme();
  const styles = getStyles(colors);
  if (!trip) return null;

  const isCustomer = role === 'CUSTOMER';
  const displayUser = isCustomer ? trip.driver?.user : trip.customer?.user;
  
  const CardContent = (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Active Trip: {trip.status}</Text>
      </View>
      
      <View style={styles.details}>
        <Text style={styles.addressText} numberOfLines={1}>
          <Text style={styles.label}>From: </Text>
          {trip.pickupAddress}
        </Text>
        <Text style={styles.addressText} numberOfLines={1}>
          <Text style={styles.label}>To: </Text>
          {trip.destinationAddress}
        </Text>
        <Text style={styles.cargoText}>
          Cargo: {trip.cargoType} ({trip.weightKg}kg)
        </Text>
      </View>

      {displayUser && (
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {displayUser.fullName?.charAt(0).toUpperCase() || (isCustomer ? 'D' : 'C')}
            </Text>
          </View>
          <View>
            <Text style={styles.userName}>{displayUser.fullName}</Text>
            <Text style={styles.userPhone}>{displayUser.phoneNumber}</Text>
          </View>
        </View>
      )}
    </Card>
  );

  if (onPress) {
    return <TouchableOpacity onPress={onPress} activeOpacity={0.8}>{CardContent}</TouchableOpacity>;
  }

  return CardContent;
};

const getStyles = (colors: any) => StyleSheet.create({
  card: {
    backgroundColor: '#e0f2fe',
    borderColor: '#bae6fd',
    marginBottom: 16,
    padding: 16,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#bae6fd',
    paddingBottom: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0369a1',
  },
  details: {
    marginBottom: 12,
  },
  label: {
    fontWeight: 'bold',
    color: '#0284c7',
  },
  addressText: {
    fontSize: 14,
    color: '#0f172a',
    marginBottom: 4,
  },
  cargoText: {
    fontSize: 14,
    color: '#475569',
    marginTop: 4,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#bae6fd',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0ea5e9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  userPhone: {
    fontSize: 12,
    color: '#475569',
  }
});

