import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors } from '../../theme/colors';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  isLoading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  isLoading = false,
  disabled,
  style,
  textStyle,
  ...props
}) => {
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';

  const buttonStyles = [
    styles.base,
    isPrimary && styles.primary,
    variant === 'secondary' && styles.secondary,
    isOutline && styles.outline,
    (disabled || isLoading) && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.textBase,
    isPrimary && styles.primaryText,
    variant === 'secondary' && styles.secondaryText,
    isOutline && styles.outlineText,
    (disabled || isLoading) && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={isPrimary ? colors.primary : colors.secondary}
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  primary: {
    backgroundColor: colors.secondary, // Black
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.secondary,
  },
  disabled: {
    backgroundColor: colors.disabled,
    borderColor: colors.disabled,
  },
  textBase: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  primaryText: {
    color: colors.primary, // White
  },
  secondaryText: {
    color: colors.text,
  },
  outlineText: {
    color: colors.secondary,
  },
  disabledText: {
    color: colors.disabledText,
  },
});
