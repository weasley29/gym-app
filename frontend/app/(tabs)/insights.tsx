import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import {
  getAllSets,
  getSettings,
  LoggedSet,
  lastTrainedDayForMuscle,
  muscleVolumeLastDays,
  Settings,
  toDisplay,
  todaysVolumeKg,
  totalWorkoutDays,
  computeStreak,
} from '../../src/storage';
import { MUSCLE_IDS, MUSCLE_LABELS, MuscleId } from '../../src/muscles';
import { theme } from '../../src/theme';

export default function InsightsScreen() {
  const [sets, setSets] = useState<LoggedSet[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [volMap, setVolMap] = useState<Record<MuscleId, number>>({} as any);
  const [stale, setStale] = useState<{ muscle: MuscleId; days: number }[]>([]);

  const compute = useCallback(async () => {
    const [s, st] = await Promise.all([getAllSets(), getSettings()]);
    setSets(s);
    setSettings(st);
    const v = await muscleVolumeLastDays(s, 7);
    setVolMap(v);
    // compute stale per-muscle
    const results: { muscle: MuscleId; days: number }[] = [];
    for (const m of MUSCLE_IDS) {
      const last = await lastTrainedDayForMuscle(s, m);
      const days = last
        ? Math.floor((Date.now() - last.getTime()) / (1000 * 60 * 60 * 24))
        : 999;
      if (days >= 5) results.push({ muscle: m, days });
    }
    results.sort((a, b) => b.days - a.days);
    setStale(results.slice(0, 4));
  }, []);

  useFocusEffect(
    useCallback(() => {
      compute();
    }, [compute])
  );

  const maxVol = Math.max(1, ...Object.values(volMap));
  const totalDays = totalWorkoutDays(sets);
  const streak = computeStreak(sets);
  const todayVol = settings ? toDisplay(todaysVolumeKg(sets), settings.unit) : 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>Insights</Text>

        {/* Quick stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="barbell" size={16} color={theme.colors.primary} />
            <Text style={styles.statValue}>{totalDays}</Text>
            <Text style={styles.statLabel}>Workout days</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="flame" size={16} color={theme.colors.primary} />
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statLabel}>Day streak</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="stats-chart" size={16} color={theme.colors.primary} />
            <Text style={styles.statValue}>{Math.round(todayVol)}</Text>
            <Text style={styles.statLabel}>{settings?.unit || 'kg'} today</Text>
          </View>
        </View>

        {/* Muscle Heatmap */}
        <Text style={styles.sectionTitle}>LAST 7 DAYS — MUSCLE VOLUME</Text>
        <View style={styles.card}>
          {MUSCLE_IDS.map((m) => {
            const v = volMap[m] || 0;
            const pct = (v / maxVol) * 100;
            return (
              <View key={m} style={styles.barRow} testID={`heatmap-${m}`}>
                <Text style={styles.barLabel}>{MUSCLE_LABELS[m]}</Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${pct}%`, opacity: v === 0 ? 0.1 : 1 },
                    ]}
                  />
                </View>
                <Text style={styles.barValue}>
                  {v === 0 ? '—' : Math.round(v)}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Suggestions */}
        <Text style={styles.sectionTitle}>SUGGESTIONS</Text>
        {stale.length === 0 ? (
          <View style={[styles.card, { padding: theme.spacing.md }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
              <Text style={styles.suggestionText}>
                Great balance! All major muscle groups trained recently.
              </Text>
            </View>
          </View>
        ) : (
          stale.map((s) => (
            <View key={s.muscle} style={styles.warnCard} testID={`suggestion-${s.muscle}`}>
              <Ionicons name="alert-circle" size={18} color={theme.colors.primary} />
              <Text style={styles.warnText}>
                You haven&apos;t trained <Text style={styles.warnBold}>{MUSCLE_LABELS[s.muscle]}</Text>{' '}
                in {s.days >= 999 ? 'a while' : `${s.days} days`}.
              </Text>
            </View>
          ))
        )}

        <View style={{ height: theme.spacing.xxl }} />
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
  statsRow: { flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.md },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
  },
  statValue: { color: theme.colors.textPrimary, fontSize: 22, fontWeight: '900', marginTop: 2 },
  statLabel: { color: theme.colors.textSecondary, fontSize: 10, letterSpacing: 0.5 },
  sectionTitle: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    letterSpacing: 1.8,
    fontWeight: '700',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  barLabel: { width: 92, color: theme.colors.textPrimary, fontSize: 12, fontWeight: '600' },
  barTrack: {
    flex: 1,
    height: 10,
    backgroundColor: theme.colors.background,
    borderRadius: 5,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  barFill: { height: '100%', backgroundColor: theme.colors.primary, borderRadius: 5 },
  barValue: { width: 40, color: theme.colors.textSecondary, fontSize: 11, textAlign: 'right' },
  warnCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.colors.primaryMuted,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  warnText: { color: theme.colors.textPrimary, fontSize: 13, flex: 1 },
  warnBold: { fontWeight: '900', color: theme.colors.primary },
  suggestionText: { color: theme.colors.textPrimary, fontSize: 13, flex: 1 },
});
