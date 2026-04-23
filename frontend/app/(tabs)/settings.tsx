import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import {
  clearAllData,
  DEFAULT_SETTINGS,
  getSettings,
  saveSettings,
  Settings,
  Unit,
  BodyType,
} from '../../src/storage';
import { theme } from '../../src/theme';
import { tap } from '../../src/haptics';

const REST_PRESETS = [45, 60, 120, 300]; // seconds

export default function SettingsScreen() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [customSec, setCustomSec] = useState('');

  useFocusEffect(
    useCallback(() => {
      getSettings().then((s) => {
        setSettings(s);
        if (!REST_PRESETS.includes(s.restTimerSeconds)) {
          setCustomSec(String(s.restTimerSeconds));
        } else {
          setCustomSec('');
        }
      });
    }, [])
  );

  const persist = async (next: Settings) => {
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
            setSettings({ ...DEFAULT_SETTINGS });
            Alert.alert('Done', 'All data has been cleared.');
          },
        },
      ]
    );
  };

  const applyCustom = () => {
    const n = parseInt(customSec, 10);
    if (!n || n < 5 || n > 1800) {
      Alert.alert('Invalid', 'Enter a value between 5 and 1800 seconds.');
      return;
    }
    persist({ ...settings, restTimerSeconds: n });
    tap();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>Settings</Text>

        {/* Unit */}
        <Text style={styles.sectionTitle}>WEIGHT UNIT</Text>
        <View style={styles.card}>
          {(['kg', 'lbs'] as Unit[]).map((u, i) => (
            <TouchableOpacity
              key={u}
              testID={`unit-${u}`}
              style={[styles.optionRow, i === 1 && { borderBottomWidth: 0 }]}
              onPress={() => {
                tap();
                persist({ ...settings, unit: u });
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.optionText}>{u.toUpperCase()}</Text>
              {settings.unit === u && (
                <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Body type */}
        <Text style={styles.sectionTitle}>MUSCLE DIAGRAM</Text>
        <View style={styles.card}>
          {(['female', 'male'] as BodyType[]).map((b, i) => (
            <TouchableOpacity
              key={b}
              testID={`body-${b}`}
              style={[styles.optionRow, i === 1 && { borderBottomWidth: 0 }]}
              onPress={() => {
                tap();
                persist({ ...settings, bodyType: b });
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.optionText}>{b === 'female' ? 'Female' : 'Male'}</Text>
              {settings.bodyType === b && (
                <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Rest timer */}
        <Text style={styles.sectionTitle}>REST TIMER</Text>
        <View style={styles.card}>
          <View style={[styles.optionRow, { borderBottomWidth: 1 }]}>
            <Text style={styles.optionText}>Auto-start after logging</Text>
            <Switch
              testID="rest-timer-enabled-switch"
              value={settings.restTimerEnabled}
              onValueChange={(v) => {
                tap();
                persist({ ...settings, restTimerEnabled: v });
              }}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor="#fff"
            />
          </View>
          {settings.restTimerEnabled && (
            <View style={styles.presetWrap}>
              <Text style={styles.presetHelp}>Preset duration</Text>
              <View style={styles.presetRow}>
                {REST_PRESETS.map((p) => (
                  <TouchableOpacity
                    key={p}
                    testID={`rest-preset-${p}`}
                    onPress={() => {
                      tap();
                      persist({ ...settings, restTimerSeconds: p });
                      setCustomSec('');
                    }}
                    style={[
                      styles.presetPill,
                      settings.restTimerSeconds === p && styles.presetPillActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.presetPillText,
                        settings.restTimerSeconds === p && styles.presetPillTextActive,
                      ]}
                    >
                      {p < 60 ? `${p}s` : `${Math.floor(p / 60)}m${p % 60 ? ` ${p % 60}s` : ''}`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={[styles.presetHelp, { marginTop: theme.spacing.md }]}>Custom (seconds)</Text>
              <View style={styles.customRow}>
                <TextInput
                  testID="rest-custom-input"
                  style={styles.customInput}
                  value={customSec}
                  onChangeText={setCustomSec}
                  placeholder="e.g. 90"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="number-pad"
                />
                <TouchableOpacity
                  testID="rest-custom-apply"
                  style={styles.applyBtn}
                  onPress={applyCustom}
                >
                  <Text style={styles.applyText}>APPLY</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Data */}
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

        {/* About */}
        <Text style={styles.sectionTitle}>ABOUT</Text>
        <View style={styles.card}>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Gym Log</Text>
            <Text style={styles.aboutValue}>v1.1</Text>
          </View>
          <Text style={styles.aboutSub}>
            Your workouts are stored securely on your device. No account required.
          </Text>
        </View>
        <View style={{ height: theme.spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { padding: theme.spacing.md },
  headerTitle: {
    color: theme.colors.textPrimary,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: theme.spacing.md,
  },
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
    letterSpacing: 0.5,
  },
  presetWrap: { padding: theme.spacing.md },
  presetHelp: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    letterSpacing: 1.2,
    fontWeight: '700',
    marginBottom: 8,
  },
  presetRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  presetPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  presetPillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  presetPillText: { color: theme.colors.textPrimary, fontWeight: '800', fontSize: 13 },
  presetPillTextActive: { color: '#fff' },
  customRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  customInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: 12,
    color: theme.colors.textPrimary,
    fontSize: 15,
    backgroundColor: theme.colors.background,
  },
  applyBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
  },
  applyText: { color: '#fff', fontWeight: '900', fontSize: 12, letterSpacing: 1 },
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
  dangerText: { color: theme.colors.primary, fontWeight: '900', letterSpacing: 1 },
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
