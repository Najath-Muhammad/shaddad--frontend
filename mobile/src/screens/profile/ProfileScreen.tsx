import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { Header } from '../../components/layout/Header';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { BottomTabBar } from '../../components/layout/BottomTabBar';

interface ProfileScreenProps {
  onLogout: () => void;
  onNavigateHome: () => void;
  onNavigateHistory: () => void;
  role: 'CUSTOMER' | 'DRIVER';
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ 
  onLogout, 
  onNavigateHome,
  onNavigateHistory,
  role 
}) => {const { colors } = useTheme();
  const styles = getStyles(colors);
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = require('../../store/themeStore').useThemeStore();

  const handleLogout = async () => {
    await logout();
    onLogout();
  };

  const getInitials = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  return (
    <View style={styles.container}>
      <Header title="Profile" />

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Profile Hero */}
        <View style={styles.heroSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(user?.fullName || '')}</Text>
          </View>
          <Text style={styles.userName}>{user?.fullName || 'User Name'}</Text>
          <Text style={styles.userPhone}>{user?.phoneNumber || '+966'}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{role}</Text>
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingTextGroup}>
              <Text style={styles.settingIcon}>🌙</Text>
              <Text style={styles.settingLabel}>Dark Mode</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: '#22c55e' }}
              thumbColor="#fff"
            />
          </View>
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingTextGroup}>
              <Text style={styles.settingIcon}>🌐</Text>
              <Text style={styles.settingLabel}>Language</Text>
            </View>
            <Text style={styles.settingValue}>English ›</Text>
          </TouchableOpacity>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          {role === 'CUSTOMER' && (
            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingTextGroup}>
                <Text style={styles.settingIcon}>💳</Text>
                <Text style={styles.settingLabel}>Payment Methods</Text>
              </View>
              <Text style={styles.settingValue}>›</Text>
            </TouchableOpacity>
          )}
          {role === 'DRIVER' && (
            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingTextGroup}>
                <Text style={styles.settingIcon}>🏦</Text>
                <Text style={styles.settingLabel}>Bank Details</Text>
              </View>
              <Text style={styles.settingValue}>›</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingTextGroup}>
              <Text style={styles.settingIcon}>🎧</Text>
              <Text style={styles.settingLabel}>Support</Text>
            </View>
            <Text style={styles.settingValue}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingTextGroup}>
              <Text style={styles.settingIcon}>🔒</Text>
              <Text style={styles.settingLabel}>Privacy Policy</Text>
            </View>
            <Text style={styles.settingValue}>›</Text>
          </TouchableOpacity>
        </View>

        <Button 
          title="Sign Out" 
          variant="outline" 
          onPress={handleLogout} 
          style={styles.signOutBtn}
          textStyle={{ color: colors.error }}
        />

        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>

      <BottomTabBar 
        activeTab="profile" 
        onTabChange={(tab) => {
          if (tab === 'home') onNavigateHome();
          if (tab === 'history') onNavigateHistory();
        }} 
      />
    </View>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 15,
    color: colors.textMuted,
    marginBottom: 12,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 16,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  settingTextGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 15,
    color: colors.textMuted,
  },
  signOutBtn: {
    marginTop: 8,
    borderColor: colors.error,
  },
  versionText: {
    textAlign: 'center',
    color: colors.textLight,
    fontSize: 12,
    marginTop: 24,
  },
});

