import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
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
} from '../src/storage';
import { CATEGORIES } from '../src/seedData';
import { theme } from '../src/theme';

const { width: SCREEN_W } = Dimensions.get('window');
const GAP = theme.spacing.md;
const CARD_W = (SCREEN_W - theme.spacing.md * 2 - GAP) / 2;

export default function Home() {
  const router = useRouter();
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
            <Text style={styles.title}>Iron Log</Text>
          </View>
          <TouchableOpacity
            testID="settings-btn"
            style={styles.iconBtn}
            onPress={() => router.push('/settings')}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={22} color={theme.colors.textPrimary} />
          </TouchableOpacity>
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
              style={[styles.card, { width: CARD_W }]}
              activeOpacity={0.85}
              onPress={() => router.push(`/category/${cat.id}`)}
            >
              <ImageBackground
                source={{ uri: cat.image }}
                style={styles.cardImg}
                imageStyle={{ borderRadius: theme.radius.lg }}
              >
                <View style={styles.cardOverlay}>
                  <View style={styles.cardIconWrap}>
                    <Ionicons name={cat.icon as any} size={16} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.cardTitle}>{cat.name.toUpperCase()}</Text>
                </View>
              </ImageBackground>
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
    height: 140,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardImg: { flex: 1, justifyContent: 'flex-end' },
  cardOverlay: {
    backgroundColor: theme.colors.overlay,
    padding: theme.spacing.md,
    flex: 1,
    justifyContent: 'space-between',
  },
  cardIconWrap: {
    alignSelf: 'flex-start',
    width: 30,
    height: 30,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
