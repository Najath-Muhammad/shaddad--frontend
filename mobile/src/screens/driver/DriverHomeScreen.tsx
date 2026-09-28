import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import { colors } from '../../theme/colors';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { driverApi } from '../../api/driver.api';

interface DriverHomeScreenProps {
  onLogout: () => void;
  onNavigateVehicleDetails: () => void;
  onNavigateDocumentUpload: () => void;
}

export const DriverHomeScreen: React.FC<DriverHomeScreenProps> = ({
  onLogout,
  onNavigateVehicleDetails,
  onNavigateDocumentUpload,
}) => {
  const { user, logout } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const handleLogout = async () => {
    await logout();
    onLogout();
  };

  const verificationStatus =
    user?.driverProfile?.verificationStatus || 'PENDING';

  const handleToggleStatus = async (value: boolean) => {
    if (value && verificationStatus !== 'APPROVED') {
      Alert.alert('Action Denied', 'You must be verified to go online.');
      return;
    }
    
    setUpdatingStatus(true);
    try {
      await driverApi.updateAvailability(value ? 'ONLINE' : 'OFFLINE');
      if (value) {
        // Mock location update
        await driverApi.updateLocation(24.7136, 46.6753); // Riyadh coordinates
      }
      setIsOnline(value);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update availability');
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="SHADDAD"
        subtitle="Driver Mode"
        rightAction={
          <Button
            title="Sign Out"
            variant="outline"
            onPress={handleLogout}
            style={styles.signOutButton}
            textStyle={styles.signOutText}
          />
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Driver Card */}
        <Card style={styles.profileCard}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.fullName?.charAt(0).toUpperCase() || 'D'}
              </Text>
            </View>
            <View style={styles.profileText}>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>INDEPENDENT DRIVER</Text>
              </View>
              <Text style={styles.userName}>{user?.fullName || 'Driver'}</Text>
              <Text style={styles.userPhone}>{user?.phoneNumber}</Text>
            </View>
          </View>
        </Card>

        {/* Verification Status Banner */}
        <Card style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>Document Verification</Text>
            <View
              style={[
                styles.statusPill,
                verificationStatus === 'APPROVED'
                  ? styles.statusApproved
                  : styles.statusPending,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  verificationStatus === 'APPROVED'
                    ? styles.statusTextApproved
                    : styles.statusTextPending,
                ]}
              >
                {verificationStatus}
              </Text>
            </View>
          </View>
          <Text style={styles.statusDesc}>
            {verificationStatus === 'PENDING'
              ? 'Your driver account has been created. Vehicle registration, Istimara, and license document submission will be unlocked in Phase 3.'
              : 'Your driver credentials have been approved.'}
          </Text>
        </Card>

        {/* Wallet & Stats Preview */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>WALLET</Text>
            <Text style={styles.statValue}>0.00 SAR</Text>
            <Text style={styles.statSub}>Balance</Text>
          </Card>

          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>RATING</Text>
            <Text style={styles.statValue}>5.0 ★</Text>
            <Text style={styles.statSub}>New Driver</Text>
          </Card>
        </View>

        {/* Driver Capabilities Card */}
        <Card>
          <Text style={styles.sectionTitle}>Driver Actions</Text>
          <View style={styles.actionButtonsRow}>
            <Button
              title="Vehicle Details"
              onPress={onNavigateVehicleDetails}
              style={styles.actionButton}
            />
            <Button
              title="Upload Documents"
              onPress={onNavigateDocumentUpload}
              style={styles.actionButton}
            />
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleText}>Driver Status: {isOnline ? 'Online' : 'Offline'}</Text>
            <Switch
              value={isOnline}
              onValueChange={handleToggleStatus}
              disabled={updatingStatus}
            />
          </View>
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
  signOutButton: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  signOutText: {
    fontSize: 12,
    fontWeight: '600',
  },
  profileCard: {
    backgroundColor: colors.secondary, // Black
    borderColor: colors.secondary,
    padding: 20,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary, // White
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.secondary, // Black
  },
  profileText: {
    flex: 1,
  },
  roleBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  roleBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.8,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary, // White
  },
  userPhone: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
  statusCard: {
    backgroundColor: colors.surface,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPending: {
    backgroundColor: colors.warningBg,
    borderColor: colors.warning,
    borderWidth: 1,
  },
  statusApproved: {
    backgroundColor: colors.successBg,
    borderColor: colors.success,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusTextPending: {
    color: colors.warning,
  },
  statusTextApproved: {
    color: colors.success,
  },
  statusDesc: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 0,
  },
  statCard: {
    flex: 1,
    padding: 16,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginVertical: 4,
  },
  statSub: {
    fontSize: 11,
    color: colors.textLight,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
});
