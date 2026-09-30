import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/useTheme';

interface LoadingIndicatorProps {
  message?: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message = 'Loading...',
}) => {const { colors } = useTheme();
  const styles = getStyles(colors);
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.secondary} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  message: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '500',
  },
});

