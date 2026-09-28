import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors.js';
import { FormContainer } from '../../components/common/FormContainer.js';
import { Input } from '../../components/common/Input.js';
import { Button } from '../../components/common/Button.js';
import { ErrorBanner } from '../../components/common/ErrorBanner.js';
import { useAuth } from '../../hooks/useAuth.js';

interface DriverLoginScreenProps {
  onSuccess: () => void;
  onNavigateRegister: () => void;
  onBack: () => void;
}

export const DriverLoginScreen: React.FC<DriverLoginScreenProps> = ({
  onSuccess,
  onNavigateRegister,
  onBack,
}) => {
  const { login, isLoading, error } = useAuth();

  const [identifier, setIdentifier] = useState('+966559876543');
  const [password, setPassword] = useState('Password123');
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
        expectedRole: 'DRIVER',
      });
      onSuccess();
    } catch {
      // Handled by hook
    }
  };

  return (
    <FormContainer>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>‹ Back</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>DRIVER PORTAL</Text>
        </View>
        <Text style={styles.title}>Driver Sign In</Text>
        <Text style={styles.subtitle}>
          Access trip requests, update your availability, and earn with your truck.
        </Text>
      </View>

      <ErrorBanner message={error || localError} />

      <View style={styles.form}>
        <Input
          label="Saudi Mobile or Email"
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
          title="Sign In as Driver"
          variant="primary"
          isLoading={isLoading}
          onPress={handleSubmit}
          style={styles.submitButton}
        />

        <View style={styles.footerLinkRow}>
          <Text style={styles.footerLinkText}>Want to drive with us? </Text>
          <TouchableOpacity onPress={onNavigateRegister}>
            <Text style={styles.footerLinkAction}>Register as Driver</Text>
          </TouchableOpacity>
        </View>
      </View>
    </FormContainer>
  );
};

const styles = StyleSheet.create({
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
