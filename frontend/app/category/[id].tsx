import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter, Stack } from 'expo-router';
import {
  addCustomExercise,
  deleteCustomExercise,
  getAllSets,
  getExercisesForCategory,
  LoggedSet,
} from '../../src/storage';
import { CATEGORIES } from '../../src/seedData';
import { theme } from '../../src/theme';
import { tap, warn } from '../../src/haptics';

export default function CategoryDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const cat = CATEGORIES.find((c) => c.id === id);
  const [exercises, setExercises] = useState<
    { id: string; name: string; custom: boolean }[]
  >([]);
  const [sets, setSets] = useState<LoggedSet[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [newName, setNewName] = useState('');

  const load = useCallback(async () => {
    if (!id) return;
    const [ex, all] = await Promise.all([getExercisesForCategory(id), getAllSets()]);
    setExercises(ex);
    setSets(all);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const lastLoggedText = (exId: string): string => {
    const own = sets.filter((s) => s.exerciseId === exId);
    if (!own.length) return 'No logs yet';
    const latest = own.reduce((a, b) =>
      new Date(a.date) > new Date(b.date) ? a : b
    );
    const diffMs = Date.now() - new Date(latest.date).getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (days <= 0) return 'Logged today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) {
      Alert.alert('Name required', 'Please enter an exercise name.');
      return;
    }
    if (!id) return;
    const newEx = {
      id: `custom:${id}:${Date.now()}`,
      name,
      categoryId: id,
    };
    await addCustomExercise(newEx);
    setNewName('');
    setModalOpen(false);
    load();
  };

  if (!cat) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.title}>Category not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.safe}>
      <Stack.Screen options={{ title: cat.name }} />
      <View style={[styles.hero, { backgroundColor: cat.bgColor, borderBottomColor: cat.color + '44' }]}>
        <View style={[styles.heroIconWrap, { backgroundColor: cat.color + '22' }]}>
          <MaterialCommunityIcons name={cat.icon as any} size={48} color={cat.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.heroEyebrow, { color: cat.color }]}>MUSCLE GROUP</Text>
          <Text style={styles.heroTitle}>{cat.name.toUpperCase()}</Text>
          <Text style={styles.heroFoot}>{exercises.length} exercises</Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {exercises.map((ex) => (
          <TouchableOpacity
            key={ex.id}
            testID={`exercise-row-${ex.id}`}
            style={styles.row}
            activeOpacity={0.8}
            onLongPress={() => {
              if (!ex.custom) return;
              warn();
              Alert.alert(
                'Delete custom exercise?',
                `Remove "${ex.name}" and all its logged sets? This cannot be undone.`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                      await deleteCustomExercise(ex.id);
                      load();
                    },
                  },
                ]
              );
            }}
            onPress={() => {
              tap();
              router.push({
                pathname: '/exercise/[id]',
                params: { id: ex.id, name: ex.name, cat: cat.id },
              });
            }}
          >
            <View style={styles.rowLeft}>
              <View style={styles.rowIconWrap}>
                <Ionicons name="barbell-outline" size={18} color={theme.colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowName}>{ex.name}</Text>
                <Text style={styles.rowSub}>
                  {lastLoggedText(ex.id)}
                  {ex.custom ? ' · Custom (long-press to delete)' : ''}
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>

      <TouchableOpacity
        testID="add-custom-exercise-fab"
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => setModalOpen(true)}
      >
        <Ionicons name="add" size={26} color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={modalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setModalOpen(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalWrap}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setModalOpen(false)}
          />
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>New Custom Exercise</Text>
            <Text style={styles.modalSub}>
              Category: {cat.name}
            </Text>
            <TextInput
              testID="custom-exercise-name-input"
              style={styles.input}
              placeholder="e.g. Incline Cable Fly"
              placeholderTextColor={theme.colors.textSecondary}
              value={newName}
              onChangeText={setNewName}
            />
            <TouchableOpacity
              testID="custom-exercise-save-btn"
              style={styles.primaryBtn}
              onPress={handleCreate}
            >
              <Text style={styles.primaryBtnText}>ADD EXERCISE</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  title: { color: theme.colors.textPrimary },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    gap: theme.spacing.md,
  },
  heroIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEyebrow: {
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '800',
  },
  heroTitle: {
    color: theme.colors.textPrimary,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginTop: 2,
  },
  heroFoot: { color: theme.colors.textSecondary, fontSize: 13, marginTop: 4 },
  list: { padding: theme.spacing.md },
  row: {
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
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: theme.spacing.md },
  rowIconWrap: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowName: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  rowSub: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  fab: {
    position: 'absolute',
    right: theme.spacing.lg,
    bottom: theme.spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalWrap: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  modalSheet: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalTitle: {
    color: theme.colors.textPrimary,
    fontSize: 22,
    fontWeight: '900',
  },
  modalSub: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
    marginBottom: theme.spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    color: theme.colors.textPrimary,
    fontSize: 16,
    backgroundColor: theme.colors.background,
    marginBottom: theme.spacing.md,
  },
  primaryBtn: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontWeight: '900', letterSpacing: 1 },
});
