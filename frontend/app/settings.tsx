import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import {
  clearAllData,
  getSettings,
  saveSettings,
  Settings,
  Unit,
} from '../src/storage';
import { theme } from '../src/theme';

export default function SettingsScreen() {
  const [settings, setSettings] = useState<Settings>({ unit: 'kg' });

  useFocusEffect(
    useCallback(() => {
      getSettings().then(setSettings);
    }, [])
  );

  const changeUnit = async (u: Unit) => {
    const next = { ...settings, unit: u };
    setSettings(next);
    await saveSettings(next);
  };

  const handleClear = () => {
    Alert.alert(
      'Clear all data?',
      'This will delete all logged sets, custom exercises, and preferences. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            setSettings({ unit: 'kg' });
            Alert.alert('Done', 'All data has been cleared.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionTitle}>WEIGHT UNIT</Text>
        <View style={styles.card}>
          {(['kg', 'lbs'] as Unit[]).map((u) => (
            <TouchableOpacity
              key={u}
              testID={`unit-${u}`}
              style={styles.optionRow}
              onPress={() => changeUnit(u)}
              activeOpacity={0.8}
            >
              <Text style={styles.optionText}>{u.toUpperCase()}</Text>
              {settings.unit === u && (
                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color={theme.colors.primary}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>DATA</Text>
        <TouchableOpacity
          testID="clear-data-btn"
          style={styles.dangerBtn}
          onPress={handleClear}
          activeOpacity={0.85}
        >
          <Ionicons name="trash-outline" size={18} color={theme.colors.primary} />
          <Text style={styles.dangerText}>CLEAR ALL DATA</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>ABOUT</Text>
        <View style={styles.card}>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Iron Log</Text>
            <Text style={styles.aboutValue}>v1.0</Text>
          </View>
          <Text style={styles.aboutSub}>
            Your workouts are stored securely on your device. No account required.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { padding: theme.spacing.md },
  sectionTitle: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    letterSpacing: 1.8,
    fontWeight: '700',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  optionText: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1,
  },
  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primaryMuted,
  },
  dangerText: {
    color: theme.colors.primary,
    fontWeight: '900',
    letterSpacing: 1,
  },
  aboutRow: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    justifyContent: 'space-between',
  },
  aboutLabel: { color: theme.colors.textPrimary, fontWeight: '800' },
  aboutValue: { color: theme.colors.textSecondary },
  aboutSub: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    lineHeight: 18,
  },
});
