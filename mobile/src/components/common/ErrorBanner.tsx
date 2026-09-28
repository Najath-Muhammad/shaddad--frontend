import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors.js';

interface ErrorBannerProps {
  message?: string | null;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message }) => {
  if (!message) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.errorBg,
    borderColor: colors.error,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
    width: '100%',
  },
  text: {
    color: colors.error,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
});
