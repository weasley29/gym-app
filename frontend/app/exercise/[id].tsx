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
  findExerciseById,
  fromDisplay,
  getAllSets,
  getSettings,
  LoggedSet,
  sameDay,
  Settings,
  toDisplay,
  ExerciseRow,
  DEFAULT_SETTINGS,
} from '../../src/storage';
import { MuscleId } from '../../src/muscles';
import { theme } from '../../src/theme';
import LineChart from '../../src/LineChart';
import MuscleDiagram from '../../src/MuscleDiagram';
import RestTimer from '../../src/RestTimer';
import { success, tap } from '../../src/haptics';

export default function ExerciseDetail() {
  const { id, name, cat } = useLocalSearchParams<{
    id: string;
    name?: string;
    cat?: string;
  }>();
  const [sets, setSets] = useState<LoggedSet[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [exInfo, setExInfo] = useState<ExerciseRow | null>(null);
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [chartMode, setChartMode] = useState<'max' | 'volume'>('max');
  const [showMuscles, setShowMuscles] = useState(false);
  const [muscleView, setMuscleView] = useState<'front' | 'back'>('front');
  const [restKey, setRestKey] = useState<number>(0);

  const load = useCallback(async () => {
    if (!id) return;
    const [all, s, info] = await Promise.all([
      getAllSets(),
      getSettings(),
      findExerciseById(id),
    ]);
    setSets(all);
    setSettings(s);
    setExInfo(info);
  }, [id]);

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
    tap();
    const weightKg = fromDisplay(w, settings.unit);
    const resolvedCat =
      cat ||
      (id && !id.startsWith('custom:') ? id.split(':')[0] : '') ||
      '';
    const newSet: LoggedSet = {
      id: `set:${Date.now()}`,
      exerciseId: id!,
      exerciseName: exInfo?.name || (name as string) || id,
      categoryId: resolvedCat,
      reps: r,
      weight: weightKg,
      notes: notes.trim() || undefined,
      date: new Date().toISOString(),
    };
    await addSet(newSet);
    success();
    setReps('');
    setWeight('');
    setNotes('');
    setShowNotes(false);
    // Auto-start rest timer if enabled
    if (settings.restTimerEnabled && settings.restTimerSeconds > 0) {
      setRestKey(Date.now());
    }
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

  const dayMap = useMemo(() => {
    const map = new Map<string, { dayKey: string; date: Date; sets: LoggedSet[] }>();
    mySets.forEach((s) => {
      const d = new Date(s.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!map.has(key)) map.set(key, { dayKey: key, date: d, sets: [] });
      map.get(key)!.sets.push(s);
    });
    return map;
  }, [mySets]);

  const sortedDays = useMemo(
    () => Array.from(dayMap.values()).sort((a, b) => a.date.getTime() - b.date.getTime()),
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
  const exerciseName = exInfo?.name || (name as string) || 'Exercise';
  const primary: MuscleId[] = (exInfo?.primary || []) as MuscleId[];
  const secondary: MuscleId[] = (exInfo?.secondary || []) as MuscleId[];

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

            {showNotes ? (
              <View style={{ marginBottom: theme.spacing.md }}>
                <Text style={styles.inputLabel}>NOTES</Text>
                <TextInput
                  testID="notes-input"
                  style={[styles.input, { fontSize: 14, minHeight: 60 }]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="How did it feel? Form cues, RPE, etc."
                  placeholderTextColor={theme.colors.textSecondary}
                  multiline
                />
              </View>
            ) : (
              <TouchableOpacity
                testID="add-notes-btn"
                onPress={() => {
                  tap();
                  setShowNotes(true);
                }}
                style={styles.addNotesBtn}
              >
                <Ionicons name="add" size={14} color={theme.colors.textSecondary} />
                <Text style={styles.addNotesText}>Add note (optional)</Text>
              </TouchableOpacity>
            )}

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

          {/* Rest timer */}
          {settings.restTimerEnabled && (
            <RestTimer
              durationSec={settings.restTimerSeconds}
              autoStartKey={restKey || undefined}
            />
          )}

          {/* Today's sets */}
          <Text style={styles.sectionTitle}>TODAY</Text>
          {todaySets.length === 0 ? (
            <Text style={styles.emptyText}>No sets logged today yet.</Text>
          ) : (
            todaySets.map((s, i) => (
              <View key={s.id} style={styles.setRow} testID={`today-set-${i}`}>
                <Text style={styles.setIndex}>SET {todaySets.length - i}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.setValue}>
                    {s.reps} × {toDisplay(s.weight, settings.unit).toFixed(1)} {settings.unit}
                  </Text>
                  {s.notes ? <Text style={styles.setNotes}>“{s.notes}”</Text> : null}
                </View>
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

          {/* Muscle & tips toggle */}
          <TouchableOpacity
            testID="muscle-toggle-btn"
            onPress={() => {
              tap();
              setShowMuscles((v) => !v);
            }}
            style={styles.expandBtn}
          >
            <Ionicons
              name={showMuscles ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={theme.colors.textPrimary}
            />
            <Text style={styles.expandText}>
              {showMuscles ? 'Hide muscles & tips' : 'Show muscles & tips'}
            </Text>
          </TouchableOpacity>

          {showMuscles && (
            <View style={styles.diagramCard}>
              <View style={styles.viewToggle}>
                <TouchableOpacity
                  testID="muscle-view-front"
                  style={[styles.viewPill, muscleView === 'front' && styles.viewPillActive]}
                  onPress={() => {
                    tap();
                    setMuscleView('front');
                  }}
                >
                  <Text
                    style={[
                      styles.viewPillText,
                      muscleView === 'front' && styles.viewPillTextActive,
                    ]}
                  >
                    FRONT
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  testID="muscle-view-back"
                  style={[styles.viewPill, muscleView === 'back' && styles.viewPillActive]}
                  onPress={() => {
                    tap();
                    setMuscleView('back');
                  }}
                >
                  <Text
                    style={[
                      styles.viewPillText,
                      muscleView === 'back' && styles.viewPillTextActive,
                    ]}
                  >
                    BACK
                  </Text>
                </TouchableOpacity>
              </View>
              <MuscleDiagram
                view={muscleView}
                bodyType={settings.bodyType}
                primary={primary}
                secondary={secondary}
                width={240}
                height={440}
              />
              {exInfo?.description ? (
                <>
                  <Text style={styles.infoLabel}>DESCRIPTION</Text>
                  <Text style={styles.infoText}>{exInfo.description}</Text>
                </>
              ) : null}
              {exInfo?.tips ? (
                <>
                  <Text style={styles.infoLabel}>FORM TIPS</Text>
                  <Text style={styles.infoText}>{exInfo.tips}</Text>
                </>
              ) : null}
            </View>
          )}

          {/* Chart */}
          <Text style={styles.sectionTitle}>PROGRESS</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              testID="chart-mode-max"
              style={[styles.toggle, chartMode === 'max' && styles.toggleActive]}
              onPress={() => {
                tap();
                setChartMode('max');
              }}
            >
              <Text
                style={[styles.toggleText, chartMode === 'max' && styles.toggleTextActive]}
              >
                MAX WEIGHT
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              testID="chart-mode-volume"
              style={[styles.toggle, chartMode === 'volume' && styles.toggleActive]}
              onPress={() => {
                tap();
                setChartMode('volume');
              }}
            >
              <Text
                style={[styles.toggleText, chartMode === 'volume' && styles.toggleTextActive]}
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
                <View key={d.dayKey} style={styles.historyCard} testID={`history-day-${d.dayKey}`}>
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
                  {d.sets.map((s) => (
                    <Text key={s.id} style={styles.historySet}>
                      · {s.reps} × {toDisplay(s.weight, settings.unit).toFixed(1)} {settings.unit}
                      {s.notes ? ` — ${s.notes}` : ''}
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
    marginBottom: theme.spacing.md,
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
  addNotesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    marginBottom: theme.spacing.md,
  },
  addNotesText: { color: theme.colors.textSecondary, fontSize: 13 },
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
  emptyText: { color: theme.colors.textSecondary, fontSize: 13, fontStyle: 'italic' },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.sm,
  },
  setIndex: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: '700',
    width: 60,
  },
  setValue: { color: theme.colors.textPrimary, fontSize: 15, fontWeight: '700' },
  setNotes: { color: theme.colors.textSecondary, fontSize: 12, fontStyle: 'italic', marginTop: 2 },
  delBtn: { padding: 6 },
  expandBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
  },
  expandText: { color: theme.colors.textPrimary, fontWeight: '700', fontSize: 13 },
  diagramCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginTop: theme.spacing.sm,
    alignItems: 'center',
  },
  viewToggle: { flexDirection: 'row', gap: 8, marginBottom: theme.spacing.md },
  viewPill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  viewPillActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  viewPillText: { color: theme.colors.textPrimary, fontWeight: '800', fontSize: 11, letterSpacing: 1 },
  viewPillTextActive: { color: '#fff' },
  infoLabel: {
    alignSelf: 'flex-start',
    color: theme.colors.textSecondary,
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: '700',
    marginTop: theme.spacing.md,
  },
  infoText: {
    alignSelf: 'stretch',
    color: theme.colors.textPrimary,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
  },
  toggleRow: { flexDirection: 'row', gap: theme.spacing.sm, marginBottom: theme.spacing.md },
  toggle: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  toggleActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  toggleText: { color: theme.colors.textSecondary, fontWeight: '800', letterSpacing: 1, fontSize: 11 },
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
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  historyDate: { color: theme.colors.textPrimary, fontWeight: '800', fontSize: 14 },
  historyCount: { color: theme.colors.textSecondary, fontSize: 12 },
  historySet: { color: theme.colors.textSecondary, fontSize: 13, marginTop: 2 },
});
