import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  computeStreak,
  getAllSets,
  getSettings,
  LoggedSet,
  Settings,
  toDisplay,
  todaysVolumeKg,
  totalWorkoutDays,
} from '../../src/storage';
import { CATEGORIES } from '../../src/seedData';
import { theme } from '../../src/theme';

const GAP = theme.spacing.md;

export default function Home() {
  const router = useRouter();
  const { width: screenW } = useWindowDimensions();
  const cardW = Math.floor((screenW - theme.spacing.md * 2 - GAP) / 2);
  const [sets, setSets] = useState<LoggedSet[]>([]);
  const [settings, setSettings] = useState<Settings>({ unit: 'kg' });

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const [s, st] = await Promise.all([getAllSets(), getSettings()]);
        setSets(s);
        setSettings(st);
      })();
    }, [])
  );

  const streak = computeStreak(sets);
  const totalDays = totalWorkoutDays(sets);
  const volKg = todaysVolumeKg(sets);
  const volDisplay = toDisplay(volKg, settings.unit);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.eyebrow}>READY TO TRAIN</Text>
            <Text style={styles.title}>Gym Log</Text>
          </View>
        </View>

        {/* Bento Stats */}
        <View style={styles.bento}>
          <View style={[styles.statCardBig]} testID="stat-total-workouts">
            <Text style={styles.statLabel}>TOTAL WORKOUTS</Text>
            <Text style={styles.statValueBig}>{totalDays}</Text>
            <Text style={styles.statFoot}>days logged</Text>
          </View>
          <View style={styles.bentoRight}>
            <View style={[styles.statCardSmall, styles.streakCard]} testID="stat-streak">
              <Ionicons name="flame" size={18} color={theme.colors.primary} />
              <Text style={styles.statValueSmall}>{streak}</Text>
              <Text style={styles.statFootSmall}>day streak</Text>
            </View>
            <View style={styles.statCardSmall} testID="stat-today-volume">
              <Ionicons name="stats-chart" size={18} color={theme.colors.textPrimary} />
              <Text style={styles.statValueSmall}>
                {volDisplay.toFixed(0)}
              </Text>
              <Text style={styles.statFootSmall}>{settings.unit} today</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>MUSCLE GROUPS</Text>

        <View style={styles.grid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              testID={`category-card-${cat.id}`}
              style={[
                styles.card,
                { width: cardW, backgroundColor: cat.bgColor, borderColor: cat.color + '55' },
              ]}
              activeOpacity={0.85}
              onPress={() => router.push(`/category/${cat.id}`)}
            >
              <View style={styles.cardIconOuter}>
                <View style={[styles.cardIconInner, { backgroundColor: cat.color + '22' }]}>
                  <MaterialCommunityIcons
                    name={cat.icon as any}
                    size={52}
                    color={cat.color}
                  />
                </View>
              </View>
              <Text style={styles.cardTitle}>{cat.name.toUpperCase()}</Text>
              <View style={[styles.cardAccent, { backgroundColor: cat.color }]} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: theme.spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { padding: theme.spacing.md, paddingBottom: theme.spacing.xxl },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  eyebrow: {
    color: theme.colors.primary,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '800',
    marginBottom: 4,
  },
  title: { color: theme.colors.textPrimary, fontSize: 34, fontWeight: '900', letterSpacing: -0.5 },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
  },
  bento: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  statCardBig: {
    flex: 1.2,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    justifyContent: 'space-between',
    minHeight: 140,
  },
  bentoRight: { flex: 1, gap: theme.spacing.md },
  statCardSmall: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    justifyContent: 'space-between',
    minHeight: 64,
  },
  streakCard: { borderColor: theme.colors.primaryMuted },
  statLabel: {
    color: theme.colors.textSecondary,
    fontSize: 10,
    letterSpacing: 1.4,
    fontWeight: '700',
  },
  statValueBig: {
    color: theme.colors.textPrimary,
    fontSize: 56,
    fontWeight: '900',
    letterSpacing: -2,
  },
  statFoot: { color: theme.colors.textSecondary, fontSize: 12 },
  statValueSmall: {
    color: theme.colors.textPrimary,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 4,
  },
  statFootSmall: { color: theme.colors.textSecondary, fontSize: 11 },
  sectionTitle: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    letterSpacing: 1.8,
    fontWeight: '700',
    marginBottom: theme.spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
  card: {
    height: 160,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    padding: theme.spacing.md,
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  cardIconOuter: {
    width: '100%',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  cardIconInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  cardAccent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
});
