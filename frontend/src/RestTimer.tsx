import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from './theme';
import { success, tap } from './haptics';

type Props = {
  durationSec: number;
  autoStartKey?: number; // change this to (re)trigger auto-start
  onComplete?: () => void;
};

export default function RestTimer({ durationSec, autoStartKey, onComplete }: Props) {
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);
  };

  const start = (secs: number) => {
    stop();
    setRemaining(secs);
    setRunning(true);
    const endAt = Date.now() + secs * 1000;
    intervalRef.current = setInterval(() => {
      const left = Math.max(0, Math.round((endAt - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0) {
        stop();
        Vibration.vibrate([0, 250, 120, 250]);
        success();
        onComplete?.();
      }
    }, 250);
  };

  // Auto-start when autoStartKey changes
  useEffect(() => {
    if (autoStartKey !== undefined && durationSec > 0) {
      start(durationSec);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStartKey]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  if (!running && remaining === 0) {
    return (
      <TouchableOpacity
        testID="rest-timer-start-btn"
        style={styles.startBtn}
        onPress={() => {
          tap();
          start(durationSec);
        }}
        activeOpacity={0.8}
      >
        <Ionicons name="timer-outline" size={16} color={theme.colors.textPrimary} />
        <Text style={styles.startText}>Start rest timer ({formatTime(durationSec)})</Text>
      </TouchableOpacity>
    );
  }

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  return (
    <View style={styles.runCard} testID="rest-timer-running">
      <View style={styles.left}>
        <Text style={styles.restLabel}>RESTING</Text>
        <Text style={styles.restValue}>
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </Text>
      </View>
      <View style={styles.rightBtns}>
        <TouchableOpacity
          testID="rest-timer-add-btn"
          style={styles.smallBtn}
          onPress={() => {
            tap();
            stop();
            start(remaining + 15);
          }}
        >
          <Text style={styles.smallBtnText}>+15s</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="rest-timer-skip-btn"
          style={styles.smallBtn}
          onPress={() => {
            tap();
            stop();
          }}
        >
          <Ionicons name="close" size={16} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function formatTime(s: number): string {
  if (s >= 60) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return sec > 0 ? `${m}m ${sec}s` : `${m}m`;
  }
  return `${s}s`;
}

const styles = StyleSheet.create({
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.md,
  },
  startText: { color: theme.colors.textPrimary, fontSize: 13, fontWeight: '700' },
  runCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.primaryMuted,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.md,
  },
  left: {},
  restLabel: { color: theme.colors.primary, fontSize: 10, letterSpacing: 1.4, fontWeight: '800' },
  restValue: { color: theme.colors.textPrimary, fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  rightBtns: { flexDirection: 'row', gap: 8 },
  smallBtn: {
    width: 52,
    height: 36,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
  },
  smallBtnText: { color: theme.colors.textPrimary, fontWeight: '800', fontSize: 13 },
});
