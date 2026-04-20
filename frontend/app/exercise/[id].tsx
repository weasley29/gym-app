import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, Stack } from 'expo-router';
import {
  addSet,
  deleteSet,
  fromDisplay,
  getAllSets,
  getSettings,
  LoggedSet,
  sameDay,
  Settings,
  toDisplay,
} from '../../src/storage';
import { theme } from '../../src/theme';
import LineChart from '../../src/LineChart';

export default function ExerciseDetail() {
  const { id, name, cat } = useLocalSearchParams<{
    id: string;
    name?: string;
    cat?: string;
  }>();
  const [sets, setSets] = useState<LoggedSet[]>([]);
  const [settings, setSettings] = useState<Settings>({ unit: 'kg' });
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [chartMode, setChartMode] = useState<'max' | 'volume'>('max');

  const load = useCallback(async () => {
    const [all, s] = await Promise.all([getAllSets(), getSettings()]);
    setSets(all);
    setSettings(s);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const mySets = useMemo(
    () =>
      sets
        .filter((s) => s.exerciseId === id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [sets, id]
  );
  const todaySets = mySets.filter((s) => sameDay(new Date(s.date), new Date()));
  const olderSets = mySets.filter((s) => !sameDay(new Date(s.date), new Date()));

  const pr = mySets.length ? Math.max(...mySets.map((s) => s.weight)) : 0;

  const handleAdd = async () => {
    const r = parseInt(reps, 10);
    const w = parseFloat(weight);
    if (!r || r <= 0) {
      Alert.alert('Invalid reps', 'Enter a positive number.');
      return;
    }
    if (isNaN(w) || w < 0) {
      Alert.alert('Invalid weight', 'Enter a valid weight (0 or greater).');
      return;
    }
    const weightKg = fromDisplay(w, settings.unit);
    const newSet: LoggedSet = {
      id: `set:${Date.now()}`,
      exerciseId: id!,
      categoryId: cat || id!.split(':')[0] || '',
      reps: r,
      weight: weightKg,
      date: new Date().toISOString(),
    };
    await addSet(newSet);
    setReps('');
    setWeight('');
    load();
  };

  const handleDelete = (setId: string) => {
    Alert.alert('Delete set', 'Remove this logged set?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteSet(setId);
          load();
        },
      },
    ]);
  };

  // Group by day for history & charts
  const dayMap = useMemo(() => {
    const map = new Map<
      string,
      { dayKey: string; date: Date; sets: LoggedSet[] }
    >();
    mySets.forEach((s) => {
      const d = new Date(s.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        '0'
      )}-${String(d.getDate()).padStart(2, '0')}`;
      if (!map.has(key)) map.set(key, { dayKey: key, date: d, sets: [] });
      map.get(key)!.sets.push(s);
    });
    return map;
  }, [mySets]);

  const sortedDays = useMemo(
    () =>
      Array.from(dayMap.values()).sort(
        (a, b) => a.date.getTime() - b.date.getTime()
      ),
    [dayMap]
  );

  const chartPoints = useMemo(() => {
    return sortedDays.map((d) => {
      const val =
        chartMode === 'max'
          ? Math.max(...d.sets.map((s) => s.weight))
          : d.sets.reduce((a, b) => a + b.reps * b.weight, 0);
      const yDisplay = toDisplay(val, settings.unit);
      const label = `${d.date.getMonth() + 1}/${d.date.getDate()}`;
      return { x: d.date.getTime(), y: yDisplay, label };
    });
  }, [sortedDays, chartMode, settings.unit]);

  const chartWidth = Dimensions.get('window').width - theme.spacing.md * 2;

  const exerciseName = (name as string) || 'Exercise';

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={styles.safe} edges={[]}>
        <Stack.Screen options={{ title: exerciseName }} />
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.eyebrow}>LOG SET</Text>
          <Text style={styles.title}>{exerciseName}</Text>

          {pr > 0 && (
            <View style={styles.prBadge} testID="pr-badge">
              <Ionicons name="trophy" size={14} color={theme.colors.primary} />
              <Text style={styles.prText}>
                PR: {toDisplay(pr, settings.unit).toFixed(1)} {settings.unit}
              </Text>
            </View>
          )}

          {/* Log form */}
          <View style={styles.formCard}>
            <View style={styles.inputRow}>
              <View style={styles.inputWrap}>
                <Text style={styles.inputLabel}>REPS</Text>
                <TextInput
                  testID="reps-input"
                  style={styles.input}
                  value={reps}
                  onChangeText={setReps}
                  placeholder="0"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="number-pad"
                />
              </View>
              <View style={styles.inputWrap}>
                <Text style={styles.inputLabel}>WEIGHT ({settings.unit})</Text>
                <TextInput
                  testID="weight-input"
                  style={styles.input}
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="0"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
            <TouchableOpacity
              testID="log-set-btn"
              style={styles.primaryBtn}
              onPress={handleAdd}
              activeOpacity={0.85}
            >
              <Ionicons name="add-circle" size={18} color="#fff" />
              <Text style={styles.primaryBtnText}>LOG SET</Text>
            </TouchableOpacity>
          </View>

          {/* Today's sets */}
          <Text style={styles.sectionTitle}>TODAY</Text>
          {todaySets.length === 0 ? (
            <Text style={styles.emptyText}>No sets logged today yet.</Text>
          ) : (
            todaySets.map((s, i) => (
              <View
                key={s.id}
                style={styles.setRow}
                testID={`today-set-${i}`}
              >
                <Text style={styles.setIndex}>SET {todaySets.length - i}</Text>
                <Text style={styles.setValue}>
                  {s.reps} × {toDisplay(s.weight, settings.unit).toFixed(1)}{' '}
                  {settings.unit}
                </Text>
                <TouchableOpacity
                  testID={`delete-set-${s.id}`}
                  onPress={() => handleDelete(s.id)}
                  style={styles.delBtn}
                >
                  <Ionicons name="trash-outline" size={16} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
            ))
          )}

          {/* Chart */}
          <Text style={styles.sectionTitle}>PROGRESS</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              testID="chart-mode-max"
              style={[styles.toggle, chartMode === 'max' && styles.toggleActive]}
              onPress={() => setChartMode('max')}
            >
              <Text
                style={[
                  styles.toggleText,
                  chartMode === 'max' && styles.toggleTextActive,
                ]}
              >
                MAX WEIGHT
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              testID="chart-mode-volume"
              style={[styles.toggle, chartMode === 'volume' && styles.toggleActive]}
              onPress={() => setChartMode('volume')}
            >
              <Text
                style={[
                  styles.toggleText,
                  chartMode === 'volume' && styles.toggleTextActive,
                ]}
              >
                VOLUME
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.chartCard} testID="progress-chart-card">
            <LineChart
              points={chartPoints}
              width={chartWidth - theme.spacing.md * 2}
              height={200}
              unit={settings.unit}
            />
          </View>

          {/* History */}
          <Text style={styles.sectionTitle}>HISTORY</Text>
          {olderSets.length === 0 ? (
            <Text style={styles.emptyText}>No past workouts yet.</Text>
          ) : (
            Array.from(dayMap.values())
              .filter((d) => !sameDay(d.date, new Date()))
              .sort((a, b) => b.date.getTime() - a.date.getTime())
              .map((d) => (
                <View
                  key={d.dayKey}
                  style={styles.historyCard}
                  testID={`history-day-${d.dayKey}`}
                >
                  <View style={styles.historyHeader}>
                    <Text style={styles.historyDate}>
                      {d.date.toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                    <Text style={styles.historyCount}>
                      {d.sets.length} set{d.sets.length > 1 ? 's' : ''}
                    </Text>
                  </View>
                  {d.sets.map((s, i) => (
                    <Text key={s.id} style={styles.historySet}>
                      · {s.reps} × {toDisplay(s.weight, settings.unit).toFixed(1)}{' '}
                      {settings.unit}
                    </Text>
                  ))}
                </View>
              ))
          )}
          <View style={{ height: theme.spacing.xl }} />
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { padding: theme.spacing.md },
  eyebrow: {
    color: theme.colors.primary,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '800',
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginTop: 2,
    marginBottom: theme.spacing.sm,
  },
  prBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.sm,
    marginBottom: theme.spacing.md,
  },
  prText: { color: theme.colors.primary, fontWeight: '800', fontSize: 12 },
  formCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  inputRow: { flexDirection: 'row', gap: theme.spacing.md, marginBottom: theme.spacing.md },
  inputWrap: { flex: 1 },
  inputLabel: {
    color: theme.colors.textSecondary,
    fontSize: 10,
    letterSpacing: 1.4,
    fontWeight: '700',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    color: theme.colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    backgroundColor: theme.colors.background,
  },
  primaryBtn: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  primaryBtnText: { color: '#fff', fontWeight: '900', letterSpacing: 1 },
  sectionTitle: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    letterSpacing: 1.8,
    fontWeight: '700',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontStyle: 'italic',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.sm,
    justifyContent: 'space-between',
  },
  setIndex: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: '700',
    width: 70,
  },
  setValue: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  delBtn: { padding: 6 },
  toggleRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  toggle: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  toggleActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  toggleText: {
    color: theme.colors.textSecondary,
    fontWeight: '800',
    letterSpacing: 1,
    fontSize: 11,
  },
  toggleTextActive: { color: '#fff' },
  chartCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
  },
  historyCard: {
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.sm,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  historyDate: { color: theme.colors.textPrimary, fontWeight: '800', fontSize: 14 },
  historyCount: { color: theme.colors.textSecondary, fontSize: 12 },
  historySet: { color: theme.colors.textSecondary, fontSize: 13, marginTop: 2 },
});
