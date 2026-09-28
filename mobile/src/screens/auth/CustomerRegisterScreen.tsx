import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { FormContainer } from '../../components/common/FormContainer';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { useAuth } from '../../hooks/useAuth';

interface CustomerRegisterScreenProps {
  onSuccess: () => void;
  onNavigateLogin: () => void;
  onBack: () => void;
}

export const CustomerRegisterScreen: React.FC<CustomerRegisterScreenProps> = ({
  onSuccess,
  onNavigateLogin,
  onBack,
}) => {
  const { registerCustomer, isLoading, error } = useAuth();

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+9665');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLocalError(null);

    if (!fullName.trim() || fullName.trim().length < 2) {
      setLocalError('Please enter your full name (at least 2 characters)');
      return;
    }
    if (!phoneNumber.trim() || !/^(\+966|0)?5\d{8}$/.test(phoneNumber.trim())) {
      setLocalError('Please enter a valid Saudi phone number (+9665XXXXXXXX or 05XXXXXXXX)');
      return;
    }
    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    try {
      await registerCustomer({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim() || undefined,
        password,
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
          <Text style={styles.badgeText}>CUSTOMER REGISTRATION</Text>
        </View>
        <Text style={styles.title}>Create Customer Account</Text>
        <Text style={styles.subtitle}>
          Sign up to request freight services, dynas, and heavy trucks on-demand.
        </Text>
      </View>

      <ErrorBanner message={error || localError} />

      <View style={styles.form}>
        <Input
          label="Full Legal Name"
          placeholder="e.g. Sultan Al-Harbi"
          value={fullName}
          onChangeText={setFullName}
        />

        <Input
          label="Saudi Mobile Number"
          placeholder="+966 5X XXX XXXX"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />

        <Input
          label="Email (Optional)"
          placeholder="sultan@example.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Input
          label="Password (min 8 chars, 1 letter, 1 number)"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          isPassword
        />

        <Input
          label="Confirm Password"
          placeholder="••••••••"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          isPassword
        />

        <Button
          title="Create Account"
          variant="primary"
          isLoading={isLoading}
          onPress={handleSubmit}
          style={styles.submitButton}
        />

        <View style={styles.footerLinkRow}>
          <Text style={styles.footerLinkText}>Already have an account? </Text>
          <TouchableOpacity onPress={onNavigateLogin}>
            <Text style={styles.footerLinkAction}>Sign In</Text>
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
    marginBottom: 24,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1,
  },
  title: {
    fontSize: 24,
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
    marginTop: 20,
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
