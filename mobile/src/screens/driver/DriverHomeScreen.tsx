import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { driverApi, DriverProfile } from '../../api/driver.api';
import { tripApi } from '../../api/trip.api';
import { socketClient } from '../../api/socket.client';
import { IncomingRequestModal } from './IncomingRequestModal';
import { ActiveTripCard } from '../../components/trip/ActiveTripCard';
import { BottomTabBar } from '../../components/layout/BottomTabBar';
import { showError, showSuccess } from '../../utils/alertUtils';

interface DriverHomeScreenProps {
  onNavigateVehicleDetails: () => void;
  onNavigateDocumentUpload: () => void;
  onNavigateActiveTrip: (tripId: string) => void;
  onNavigateHistory: () => void;
  onNavigateProfile: () => void;
}

// ─── Status banner config ────────────────────────────────────────────────────

type VerificationStatus = DriverProfile['verificationStatus'];

interface StatusConfig {
  label: string;
  description: (reason?: string | null) => string;
  pillStyle: ViewStyle;
  pillTextStyle: TextStyle;
  cardStyle: ViewStyle;
}


// ─── Main component ──────────────────────────────────────────────────────────

export const DriverHomeScreen: React.FC<DriverHomeScreenProps> = ({
  onNavigateVehicleDetails,
  onNavigateDocumentUpload,
  onNavigateActiveTrip,
  onNavigateHistory,
  onNavigateProfile,
}) => {const { colors } = useTheme();
  const styles = getStyles(colors);
  const STATUS_CONFIG: Record<VerificationStatus, StatusConfig> = {
  PENDING_VERIFICATION: {
    label: 'PENDING REVIEW',
    description: () =>
      'Your account is under review. Complete the steps below to speed up verification.',
    pillStyle: { backgroundColor: colors.warningBg, borderColor: colors.warning, borderWidth: 1 },
    pillTextStyle: { color: colors.warning },
    cardStyle: { borderLeftWidth: 4, borderLeftColor: colors.warning },
  },
  APPROVED: {
    label: 'APPROVED',
    description: () => 'Your account is verified. You can now go online and accept trips.',
    pillStyle: { backgroundColor: colors.successBg, borderColor: colors.success, borderWidth: 1 },
    pillTextStyle: { color: colors.success },
    cardStyle: { borderLeftWidth: 4, borderLeftColor: colors.success },
  },
  REJECTED: {
    label: 'REJECTED',
    description: (reason) =>
      reason
        ? `Your application was rejected: "${reason}". Please re-upload your documents.`
        : 'Your application was rejected. Please re-upload your documents and contact support.',
    pillStyle: { backgroundColor: colors.errorBg, borderColor: colors.error, borderWidth: 1 },
    pillTextStyle: { color: colors.error },
    cardStyle: { borderLeftWidth: 4, borderLeftColor: colors.error },
  },
  SUSPENDED: {
    label: 'SUSPENDED',
    description: (reason) =>
      reason
        ? `Your account has been suspended: "${reason}". Please contact support.`
        : 'Your account has been suspended. Please contact support.',
    pillStyle: { backgroundColor: colors.errorBg, borderColor: colors.error, borderWidth: 1 },
    pillTextStyle: { color: colors.error },
    cardStyle: { borderLeftWidth: 4, borderLeftColor: colors.error },
  },
};

  const { user } = useAuth();

  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [incomingTrip, setIncomingTrip] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState<string | null>(null);
  const [activeTrip, setActiveTrip] = useState<any>(null);

  // Listen for real-time cancellations
  useEffect(() => {
    socketClient.onTripCanceled((data: any) => {
      setCancelReason(data.reason || 'No reason provided');
      // Fallback alert for iOS or if modal is not open
      Alert.alert(
        'Request Canceled',
        `The customer canceled the trip request.\nReason: ${data.reason || 'No reason provided'}`,
        [{ text: 'OK', onPress: () => { setIncomingTrip(null); setCancelReason(null); } }]
      );
    });
    return () => {
      socketClient.offTripCanceled();
    };
  }, []);

  // Poll for trips when online
  useEffect(() => {
    let interval: any;
    if (isOnline) {
      interval = setInterval(async () => {
        try {
          // Poll incoming
          const incRes = await tripApi.getIncomingRequests();
          if (incRes.data?.data?.length > 0) {
            setIncomingTrip(incRes.data.data[0]);
          } else {
            setIncomingTrip(null);
          }

          // Poll active trips
          const activeRes = await tripApi.getDriverTrips();
          if (activeRes.data?.data && activeRes.data.data.length > 0) {
            const mostRecentTrip = activeRes.data.data[0];
            if (!['PENDING_DRIVER_RESPONSE', 'REJECTED', 'EXPIRED', 'COMPLETED', 'CANCELED'].includes(mostRecentTrip.status)) {
              setActiveTrip(mostRecentTrip);
            } else {
              setActiveTrip(null);
            }
          }
        } catch (error) {
          console.error(error);
        }
      }, 5000);
    } else {
      setIncomingTrip(null);
      setActiveTrip(null);
    }
    return () => clearInterval(interval);
  }, [isOnline]);

  // ── Fetch latest driver profile on mount ──────────────────────────────────
  const fetchProfile = useCallback(async () => {
    try {
      setLoadingProfile(true);
      const res = await driverApi.getDriverProfile();
      if (res.data) {
        setDriverProfile(res.data);
        setIsOnline(res.data.availability === 'ONLINE');
      }
    } catch {
      // fallback: use the auth store value
      if (user?.driverProfile) {
        setDriverProfile({
          id: user.driverProfile.id,
          verificationStatus:
            (user.driverProfile.verificationStatus as VerificationStatus) ??
            'PENDING_VERIFICATION',
          rejectionReason: null,
          suspensionReason: null,
          availability: 'OFFLINE',
          rating: user.driverProfile.rating ?? 5.0,
          walletBalance: user.driverProfile.walletBalance ?? '0.00',
          totalTripsCount: 0,
          nationalIdFrontUrl: null,
          nationalIdBackUrl: null,
          licenseUrl: null,
          profilePhotoUrl: null,
          vehicle: null,
        });
      }
    } finally {
      setLoadingProfile(false);
    }
  }, [user]);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const [withdrawing, setWithdrawing] = useState(false);

  const handleWithdraw = async () => {
    try {
      setWithdrawing(true);
      await driverApi.withdrawFunds();
      showSuccess('Withdrawal successful');
      fetchProfile();
    } catch (error) {
      showError(error, 'Withdrawal Failed');
    } finally {
      setWithdrawing(false);
    }
  };

  const handleToggleStatus = async (value: boolean) => {
    setUpdatingStatus(true);
    try {
      await driverApi.updateAvailability(value ? 'ONLINE' : 'OFFLINE');
      if (value) {
        await driverApi.updateLocation(24.7136, 46.6753);
      }
      setIsOnline(value);
    } catch (error) {
      showError(error, 'Failed to update availability');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // ── Derived values ────────────────────────────────────────────────────────
  const verificationStatus: VerificationStatus =
    driverProfile?.verificationStatus ?? 'PENDING_VERIFICATION';
  const isApproved = verificationStatus === 'APPROVED';
  const statusConfig = STATUS_CONFIG[verificationStatus];

  const walletDisplay =
    driverProfile
      ? `${parseFloat(String(driverProfile.walletBalance)).toFixed(2)} SAR`
      : '0.00 SAR';
  const ratingDisplay = driverProfile ? `${driverProfile.rating.toFixed(1)} ★` : '5.0 ★';

  // ── Onboarding checklist items ────────────────────────────────────────────
  const hasVehicle = !!driverProfile?.vehicle;
  const hasNationalId = !!driverProfile?.nationalIdFrontUrl;
  const hasLicense = !!driverProfile?.licenseUrl;
  const hasRegistration = !!driverProfile?.vehicle?.registrationUrl;
  const hasProfilePhoto = !!driverProfile?.profilePhotoUrl;
  const hasVehiclePhoto = !!driverProfile?.vehicle?.vehiclePhotoUrl;
  const hasInsurance = !!driverProfile?.vehicle?.insuranceUrl;
  
  const allDocsDone = 
    hasNationalId && 
    hasLicense && 
    hasRegistration && 
    hasProfilePhoto && 
    hasVehiclePhoto && 
    hasInsurance;

  // ────────────────────────────────────────────────────────────────────────────



  const StatusBanner = () => (
    <Card style={[styles.statusCard, statusConfig.cardStyle]}>
      <View style={styles.statusHeader}>
        <Text style={styles.statusTitle}>Verification Status</Text>
        <View style={[styles.statusPill, statusConfig.pillStyle]}>
          <Text style={[styles.statusPillText, statusConfig.pillTextStyle]}>
            {statusConfig.label}
          </Text>
        </View>
      </View>
      <Text style={styles.statusDesc}>
        {verificationStatus === 'PENDING_VERIFICATION' && allDocsDone && hasVehicle
          ? 'Your application is fully submitted and is currently waiting for admin approval. We will notify you once reviewed.'
          : statusConfig.description(
              driverProfile?.rejectionReason ?? driverProfile?.suspensionReason
            )}
      </Text>
    </Card>
  );

  const PendingView = () => (
    <ScrollView contentContainerStyle={styles.content}>
      <StatusBanner />

      <Card>
        {allDocsDone && hasVehicle ? (
          <View style={styles.underReviewContainer}>
            <Text style={styles.underReviewIcon}>⏳</Text>
            <Text style={styles.underReviewTitle}>Waiting for Admin Approval</Text>
            <Text style={styles.underReviewDesc}>
              Thank you for completing your profile! Our admin team is currently reviewing your documents. 
              You will be notified as soon as your account is approved.
            </Text>
            <Button 
              title="Review Submitted Documents" 
              variant="outline" 
              onPress={onNavigateDocumentUpload} 
              style={{ marginTop: 16, width: '100%' }}
            />
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>
              {verificationStatus === 'REJECTED'
                ? 'Re-submit Your Documents'
                : 'Complete Your Profile'}
            </Text>
            <Text style={styles.sectionDesc}>
              Finish these steps to submit your application for review.
            </Text>

            <ChecklistItem styles={styles} label="Add Vehicle Details" done={hasVehicle} onPress={onNavigateVehicleDetails} />
            <ChecklistItem styles={styles} label="Upload Profile Photo" done={hasProfilePhoto} onPress={onNavigateDocumentUpload} />
            <ChecklistItem styles={styles} label="Upload ID / Iqama" done={hasNationalId} onPress={onNavigateDocumentUpload} />
            <ChecklistItem styles={styles} label="Upload Driving License" done={hasLicense} onPress={onNavigateDocumentUpload} />
            <ChecklistItem styles={styles} label="Upload Vehicle Photo" done={hasVehiclePhoto} onPress={onNavigateDocumentUpload} />
            <ChecklistItem styles={styles} label="Upload Vehicle Registration" done={hasRegistration} onPress={onNavigateDocumentUpload} />
            <ChecklistItem styles={styles} label="Upload Vehicle Insurance" done={hasInsurance} onPress={onNavigateDocumentUpload} />
          </>
        )}
      </Card>
    </ScrollView>
  );

  const ApprovedView = () => (
    <ScrollView contentContainerStyle={styles.content}>
      {activeTrip && <ActiveTripCard trip={activeTrip} role="DRIVER" onPress={() => onNavigateActiveTrip(activeTrip.id)} />}

      <StatusBanner />

      {/* Stats row */}
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>WALLET</Text>
          <Text style={styles.statValue}>{walletDisplay}</Text>
          <Text style={styles.statSub}>Balance</Text>
          {driverProfile && Number(driverProfile.walletBalance) > 0 && (
            <Button
              title="Withdraw"
              onPress={handleWithdraw}
              isLoading={withdrawing}
              style={{ marginTop: 12, minHeight: 36, paddingVertical: 6 }}
            />
          )}
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>RATING</Text>
          <Text style={styles.statValue}>{ratingDisplay}</Text>
          <Text style={styles.statSub}>
            {driverProfile && driverProfile.totalTripsCount > 0
              ? `${driverProfile.totalTripsCount} trips`
              : 'New Driver'}
          </Text>
        </Card>
      </View>

      {/* Online/Offline toggle */}
      <Card>
        <Text style={styles.sectionTitle}>Driver Status</Text>
        <View style={styles.toggleRow}>
          <View>
            <Text style={styles.toggleLabel}>
              {isOnline ? '🟢  Online — Accepting trips' : '⚫  Offline — Not available'}
            </Text>
            <Text style={styles.toggleSub}>
              Toggle to {isOnline ? 'stop' : 'start'} receiving requests
            </Text>
          </View>
          {updatingStatus ? (
            <ActivityIndicator size="small" color={colors.secondary} />
          ) : (
            <Switch
              value={isOnline}
              onValueChange={handleToggleStatus}
              trackColor={{ false: colors.border, true: '#22c55e' }}
              thumbColor={isOnline ? '#fff' : '#fff'}
            />
          )}
        </View>
      </Card>

      {/* Quick Actions */}
      <Card>
        <Text style={styles.sectionTitle}>Manage</Text>
        <View style={styles.actionButtonsRow}>
          <Button
            title="Vehicle Details"
            variant="outline"
            onPress={onNavigateVehicleDetails}
            style={styles.actionButton}
          />
          <Button
            title="Documents"
            variant="outline"
            onPress={onNavigateDocumentUpload}
            style={styles.actionButton}
          />
        </View>
      </Card>
    </ScrollView>
  );

  if (loadingProfile) {
    return (
      <View style={styles.container}>
        <Header title="SHADDAD" subtitle="Driver Mode" />
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.secondary} />
          <Text style={styles.loaderText}>Loading your dashboard…</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="SHADDAD" subtitle="Driver Mode" />
      {isApproved ? <ApprovedView /> : <PendingView />}
      
      <IncomingRequestModal 
        trip={incomingTrip} 
        visible={!!incomingTrip} 
        onRespond={(accepted) => {
          if (accepted) {
            onNavigateActiveTrip(incomingTrip.id);
          }
          setIncomingTrip(null);
        }} 
      />

      <BottomTabBar 
        activeTab="home" 
        onTabChange={(tab) => {
          if (tab === 'history') onNavigateHistory();
          if (tab === 'profile') onNavigateProfile();
        }} 
      />
    </View>
  );
};

// ─── Checklist item component ────────────────────────────────────────────────

interface ChecklistItemProps {
  styles: any;
  label: string;
  done: boolean;
  onPress: () => void;
}

const ChecklistItem: React.FC<ChecklistItemProps> = ({ label, done, onPress, styles }) => (
  <TouchableOpacity
    style={[styles.checklistItem, done && styles.checklistItemDone]}
    onPress={done ? undefined : onPress}
    disabled={done}
    activeOpacity={done ? 1 : 0.7}
  >
    <View style={[styles.checklistIcon, done && styles.checklistIconDone]}>
      <Text style={[styles.checklistIconText, done && styles.checklistIconTextDone]}>
        {done ? '✓' : '›'}
      </Text>
    </View>
    <View style={styles.checklistTextGroup}>
      <Text style={[styles.checklistLabel, done && styles.checklistLabelDone]}>{label}</Text>
      <Text style={styles.checklistSub}>{done ? 'Completed' : 'Tap to complete'}</Text>
    </View>
  </TouchableOpacity>
);

// ─── Styles ──────────────────────────────────────────────────────────────────

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loaderText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  content: {
    padding: 20,
    paddingBottom: 48,
    gap: 16,
  },

  // Status banner
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
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusDesc: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
  },
  // Onboarding checklist
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 14,
    lineHeight: 18,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  checklistItemDone: {
    opacity: 0.65,
  },
  checklistIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  checklistIconDone: {
    backgroundColor: colors.successBg,
    borderColor: colors.success,
  },
  checklistIconText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMuted,
  },
  checklistIconTextDone: {
    color: colors.success,
    fontSize: 14,
  },
  checklistTextGroup: {
    flex: 1,
  },
  checklistLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  checklistLabelDone: {
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  checklistSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  submittedBanner: {
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.successBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.success,
  },
  submittedText: {
    fontSize: 13,
    color: colors.success,
    fontWeight: '600',
    lineHeight: 18,
  },
  // Under Review State
  underReviewContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  underReviewIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  underReviewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  underReviewDesc: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  // Stats row (approved only)
  statsRow: {
    flexDirection: 'row',
    gap: 12,
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
  // Toggle row (approved only)
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  toggleSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  // Action buttons (approved only)
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
  },
  // Sign out
  signOutBtn: {
    marginTop: 4,
  },
});




