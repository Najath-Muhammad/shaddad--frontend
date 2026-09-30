import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { FormContainer } from '../../components/common/FormContainer';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { useAuth } from '../../hooks/useAuth';

interface DriverRegisterScreenProps {
  onSuccess: () => void;
  onNavigateLogin: () => void;
  onBack: () => void;
}

export const DriverRegisterScreen: React.FC<DriverRegisterScreenProps> = ({
  onSuccess,
  onNavigateLogin,
  onBack,
}) => {const { colors } = useTheme();
  const styles = getStyles(colors);
  const { registerDriver, isLoading, error } = useAuth();

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+9665');
  const [nationalIdNumber, setNationalIdNumber] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
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
    if (nationalIdNumber.trim() && !/^[12]\d{9}$/.test(nationalIdNumber.trim())) {
      setLocalError('National ID or Iqama must be exactly 10 digits starting with 1 or 2');
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
      await registerDriver({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        nationalIdNumber: nationalIdNumber.trim() || undefined,
        licenseNumber: licenseNumber.trim() || undefined,
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
          <Text style={styles.badgeText}>DRIVER REGISTRATION</Text>
        </View>
        <Text style={styles.title}>Register as Independent Driver</Text>
        <Text style={styles.subtitle}>
          Earn with your Dyna, Pickup, or Heavy Truck on the SHADDAD platform.
        </Text>
      </View>

      <ErrorBanner message={error || localError} />

      <View style={styles.form}>
        <Input
          label="Full Legal Name"
          placeholder="e.g. Fahad Al-Otaibi"
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
          label="National ID / Iqama (10 digits)"
          placeholder="1XXXXXXXXX or 2XXXXXXXXX"
          value={nationalIdNumber}
          onChangeText={setNationalIdNumber}
          keyboardType="numeric"
          maxLength={10}
        />

        <Input
          label="Driving License Number (Optional)"
          placeholder="e.g. 1XXXXXXXXX"
          value={licenseNumber}
          onChangeText={setLicenseNumber}
          keyboardType="numeric"
          maxLength={10}
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
          title="Create Driver Account"
          variant="primary"
          isLoading={isLoading}
          onPress={handleSubmit}
          style={styles.submitButton}
        />

        <View style={styles.footerLinkRow}>
          <Text style={styles.footerLinkText}>Already registered as a driver? </Text>
          <TouchableOpacity onPress={onNavigateLogin}>
            <Text style={styles.footerLinkAction}>Sign In</Text>
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

