import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import {
  dayKey,
  deleteSet,
  getAllSets,
  getSettings,
  LoggedSet,
  sameDay,
  Settings,
  toDisplay,
} from '../../src/storage';
import { theme } from '../../src/theme';
import { tap, warn } from '../../src/haptics';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function HistoryScreen() {
  const [sets, setSets] = useState<LoggedSet[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [cursor, setCursor] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());

  const load = useCallback(async () => {
    const [s, st] = await Promise.all([getAllSets(), getSettings()]);
    setSets(s);
    setSettings(st);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const workoutDays = useMemo(() => {
    const set = new Set<string>();
    sets.forEach((s) => set.add(dayKey(new Date(s.date))));
    return set;
  }, [sets]);

  const daysInMonth = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startWeekday = (first.getDay() + 6) % 7; // Monday = 0
    const arr: (Date | null)[] = [];
    for (let i = 0; i < startWeekday; i++) arr.push(null);
    for (let d = 1; d <= last.getDate(); d++) arr.push(new Date(year, month, d));
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [cursor]);

  const selectedSets = useMemo(() => {
    if (!selectedDay) return [];
    return sets
      .filter((s) => sameDay(new Date(s.date), selectedDay))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sets, selectedDay]);

  const monthLabel = cursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  const shiftMonth = (delta: number) => {
    tap();
    const next = new Date(cursor);
    next.setMonth(next.getMonth() + delta);
    setCursor(next);
    setSelectedDay(null);
  };

  const handleDelete = (setId: string) => {
    Alert.alert('Delete set', 'Remove this logged set?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          warn();
          await deleteSet(setId);
          load();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>History</Text>

        {/* Calendar */}
        <View style={styles.card}>
          <View style={styles.monthRow}>
            <TouchableOpacity
              testID="history-prev-month"
              style={styles.arrowBtn}
              onPress={() => shiftMonth(-1)}
            >
              <Ionicons name="chevron-back" size={20} color={theme.colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.monthTitle}>{monthLabel}</Text>
            <TouchableOpacity
              testID="history-next-month"
              style={styles.arrowBtn}
              onPress={() => shiftMonth(1)}
            >
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <View style={styles.weekRow}>
            {WEEKDAYS.map((d, i) => (
              <Text key={i} style={styles.weekLabel}>
                {d}
              </Text>
            ))}
          </View>
          <View style={styles.grid}>
            {daysInMonth.map((d, i) => {
              if (!d) return <View key={i} style={styles.dayCell} />;
              const isWorkout = workoutDays.has(dayKey(d));
              const isSelected = selectedDay && sameDay(d, selectedDay);
              const isToday = sameDay(d, new Date());
              return (
                <TouchableOpacity
                  key={i}
                  testID={`day-${dayKey(d)}`}
                  style={[
                    styles.dayCell,
                    isSelected && styles.dayCellSelected,
                    isToday && !isSelected && styles.dayCellToday,
                  ]}
                  onPress={() => {
                    tap();
                    setSelectedDay(d);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dayText,
                      isSelected && { color: '#fff' },
                    ]}
                  >
                    {d.getDate()}
                  </Text>
                  {isWorkout && (
                    <View
                      style={[
                        styles.dot,
                        isSelected && { backgroundColor: '#fff' },
                      ]}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Selected day sets */}
        {selectedDay && (
          <>
            <Text style={styles.sectionTitle}>
              {selectedDay.toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              }).toUpperCase()}
            </Text>
            {selectedSets.length === 0 ? (
              <Text style={styles.emptyText}>No workouts logged.</Text>
            ) : (
              selectedSets.map((s) => (
                <View key={s.id} style={styles.setCard} testID={`history-set-${s.id}`}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.setName}>
                      {s.exerciseName || s.exerciseId.split(':').slice(-1)[0]}
                    </Text>
                    <Text style={styles.setDetail}>
                      {s.reps} × {settings ? toDisplay(s.weight, settings.unit).toFixed(1) : s.weight} {settings?.unit || 'kg'}
                    </Text>
                    {s.notes ? <Text style={styles.setNotes}>“{s.notes}”</Text> : null}
                  </View>
                  <TouchableOpacity
                    testID={`history-delete-${s.id}`}
                    onPress={() => handleDelete(s.id)}
                    style={styles.delBtn}
                  >
                    <Ionicons name="trash-outline" size={18} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </>
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
  card: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  monthTitle: { color: theme.colors.textPrimary, fontSize: 16, fontWeight: '800' },
  arrowBtn: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekRow: { flexDirection: 'row', marginBottom: 6 },
  weekLabel: {
    flex: 1,
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.sm,
  },
  dayCellSelected: { backgroundColor: theme.colors.primary },
  dayCellToday: { borderWidth: 1, borderColor: theme.colors.primary },
  dayText: { color: theme.colors.textPrimary, fontSize: 14, fontWeight: '600' },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
    marginTop: 2,
  },
  sectionTitle: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    letterSpacing: 1.8,
    fontWeight: '700',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  emptyText: { color: theme.colors.textSecondary, fontSize: 13, fontStyle: 'italic' },
  setCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.sm,
  },
  setName: { color: theme.colors.textPrimary, fontWeight: '800', fontSize: 14 },
  setDetail: { color: theme.colors.textSecondary, fontSize: 13, marginTop: 2 },
  setNotes: { color: theme.colors.textSecondary, fontSize: 12, fontStyle: 'italic', marginTop: 4 },
  delBtn: { padding: 6 },
});
