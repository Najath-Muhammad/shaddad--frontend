import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';

interface RoleSelectionScreenProps {
  onSelectCustomer: () => void;
  onSelectDriver: () => void;
}

export const RoleSelectionScreen: React.FC<RoleSelectionScreenProps> = ({
  onSelectCustomer,
  onSelectDriver,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>SHADDAD</Text>
        </View>
        <Text style={styles.title}>Welcome to SHADDAD</Text>
        <Text style={styles.subtitle}>
          Connecting Saudi cargo shippers with verified independent truck drivers.
        </Text>
      </View>

      <View style={styles.optionsContainer}>
        {/* Customer Choice */}
        <Card style={styles.roleCard}>
          <View style={styles.roleHeader}>
            <View style={styles.roleIconBox}>
              <Text style={styles.roleIconText}>📦</Text>
            </View>
            <View style={styles.roleTextContainer}>
              <Text style={styles.roleTitle}>I Need Cargo Transport</Text>
              <Text style={styles.roleDesc}>
                Ship goods, Dyna, flatbeds, and heavy freight across KSA.
              </Text>
            </View>
          </View>
          <Button
            title="Continue as Customer"
            variant="primary"
            onPress={onSelectCustomer}
            style={styles.cardButton}
          />
        </Card>

        {/* Driver Choice */}
        <Card style={styles.roleCard}>
          <View style={styles.roleHeader}>
            <View style={styles.roleIconBox}>
              <Text style={styles.roleIconText}>🚛</Text>
            </View>
            <View style={styles.roleTextContainer}>
              <Text style={styles.roleTitle}>I Am a Truck Driver</Text>
              <Text style={styles.roleDesc}>
                Drive independent trucks, receive trip requests, and earn daily.
              </Text>
            </View>
          </View>
          <Button
            title="Continue as Driver"
            variant="outline"
            onPress={onSelectDriver}
            style={styles.cardButton}
          />
        </Card>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Regulated Kingdom of Saudi Arabia Logistics Network
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 30,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  badge: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 16,
  },
  badgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  optionsContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
  roleCard: {
    padding: 20,
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  roleIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  roleIconText: {
    fontSize: 22,
  },
  roleTextContainer: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  roleDesc: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 16,
  },
  cardButton: {
    height: 48,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: colors.textLight,
    fontWeight: '500',
  },
});
