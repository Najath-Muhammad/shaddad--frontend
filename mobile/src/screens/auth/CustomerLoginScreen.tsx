import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { FormContainer } from '../../components/common/FormContainer';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { useAuth } from '../../hooks/useAuth';

interface CustomerLoginScreenProps {
  onSuccess: () => void;
  onNavigateRegister: () => void;
  onBack: () => void;
}

export const CustomerLoginScreen: React.FC<CustomerLoginScreenProps> = ({
  onSuccess,
  onNavigateRegister,
  onBack,
}) => {const { colors } = useTheme();
  const styles = getStyles(colors);
  const { login, isLoading, error } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLocalError(null);
    if (!identifier.trim()) {
      setLocalError('Please enter your phone number or email');
      return;
    }
    if (!password) {
      setLocalError('Please enter your password');
      return;
    }

    try {
      await login({
        identifier: identifier.trim(),
        password,
        expectedRole: 'CUSTOMER',
      });
      onSuccess();
    } catch {
      // Handled by hook error banner
    }
  };

  return (
    <FormContainer>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>‹ Back</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>CUSTOMER PORTAL</Text>
        </View>
        <Text style={styles.title}>Sign in to Ship Cargo</Text>
        <Text style={styles.subtitle}>
          Track your logistics bookings and find nearby trucks in Saudi Arabia.
        </Text>
      </View>

      <ErrorBanner message={error || localError} />

      <View style={styles.form}>
        <Input
          label="Saudi Phone or Email"
          placeholder="+966 5X XXX XXXX"
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
          keyboardType="default"
        />

        <Input
          label="Password"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          isPassword
        />

        <Button
          title="Sign In"
          variant="primary"
          isLoading={isLoading}
          onPress={handleSubmit}
          style={styles.submitButton}
        />

        <View style={styles.footerLinkRow}>
          <Text style={styles.footerLinkText}>New to SHADDAD? </Text>
          <TouchableOpacity onPress={onNavigateRegister}>
            <Text style={styles.footerLinkAction}>Create Customer Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </FormContainer>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    paddingVertical: 4,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondary,
  },
  header: {
    marginBottom: 28,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 6,
    lineHeight: 18,
  },
  form: {
    width: '100%',
  },
  submitButton: {
    marginTop: 8,
  },
  footerLinkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerLinkText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  footerLinkAction: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.secondary,
    textDecorationLine: 'underline',
  },
});

