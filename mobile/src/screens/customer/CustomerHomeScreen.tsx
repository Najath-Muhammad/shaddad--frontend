import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../../theme/colors.js';
import { Header } from '../../components/layout/Header.js';
import { Card } from '../../components/common/Card.js';
import { Button } from '../../components/common/Button.js';
import { useAuth } from '../../hooks/useAuth.js';

interface CustomerHomeScreenProps {
  onLogout: () => void;
}

export const CustomerHomeScreen: React.FC<CustomerHomeScreenProps> = ({
  onLogout,
}) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    onLogout();
  };

  return (
    <View style={styles.container}>
      <Header
        title="SHADDAD"
        subtitle="Customer Mode"
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
        {/* User Card */}
        <Card style={styles.profileCard}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.fullName?.charAt(0).toUpperCase() || 'C'}
              </Text>
            </View>
            <View style={styles.profileText}>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>VERIFIED CUSTOMER</Text>
              </View>
              <Text style={styles.userName}>{user?.fullName || 'Customer'}</Text>
              <Text style={styles.userPhone}>{user?.phoneNumber}</Text>
            </View>
          </View>
        </Card>

        {/* Phase 1 Verification Notice */}
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>Phase 1 Foundation Active</Text>
          <Text style={styles.infoBody}>
            Role-based authentication & token rotation verified.
            {'\n\n'}
            • Token Expiry: 15 min access, 7 day rotating refresh token.
            {'\n'}
            • Role: Customer access strictly enforced.
          </Text>
        </Card>

        {/* Action Preview */}
        <Card>
          <Text style={styles.sectionTitle}>Cargo Transport Services</Text>
          <Text style={styles.sectionSubtitle}>
            Available in upcoming Phase 4 & Phase 5:
          </Text>
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>• Dyna (3-4 Ton) On-demand dispatch</Text>
            <Text style={styles.featureItem}>• Pickup (1-2 Ton) local delivery</Text>
            <Text style={styles.featureItem}>• Heavy Freight & Flatbeds across KSA</Text>
            <Text style={styles.featureItem}>• Real-time driver GPS tracking</Text>
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
  infoCard: {
    backgroundColor: colors.surface,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  infoBody: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 12,
  },
  featureList: {
    gap: 6,
  },
  featureItem: {
    fontSize: 13,
    color: colors.text,
  },
});
