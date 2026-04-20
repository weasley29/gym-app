import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Line, Defs, LinearGradient, Stop } from 'react-native-svg';
import { theme } from './theme';

type Point = { x: number; y: number; label: string };

type Props = {
  points: Point[];
  width: number;
  height: number;
  unit: string;
};

export default function LineChart({ points, width, height, unit }: Props) {
  if (points.length === 0) {
    return (
      <View
        style={[styles.empty, { width, height }]}
        testID="chart-empty"
      >
        <Text style={styles.emptyText}>No data yet. Log a set to see progress.</Text>
      </View>
    );
  }

  const padL = 36;
  const padR = 12;
  const padT = 14;
  const padB = 26;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;

  const maxY = Math.max(...points.map((p) => p.y), 1);
  const minY = 0;
  const n = points.length;
  const stepX = n > 1 ? innerW / (n - 1) : 0;

  const coords = points.map((p, i) => {
    const x = padL + i * stepX + (n === 1 ? innerW / 2 : 0);
    const y = padT + innerH - ((p.y - minY) / (maxY - minY || 1)) * innerH;
    return { x, y, ...p };
  });

  const linePath = coords
    .map((c, i) => (i === 0 ? `M ${c.x} ${c.y}` : `L ${c.x} ${c.y}`))
    .join(' ');

  const areaPath =
    coords.length > 1
      ? `${linePath} L ${coords[coords.length - 1].x} ${padT + innerH} L ${coords[0].x} ${padT + innerH} Z`
      : '';

  const yTicks = 4;
  const ticks = Array.from({ length: yTicks + 1 }, (_, i) => {
    const v = (maxY / yTicks) * i;
    const y = padT + innerH - (v / (maxY || 1)) * innerH;
    return { v, y };
  });

  return (
    <View style={{ width, height }} testID="chart-container">
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={theme.colors.primary} stopOpacity="0.5" />
            <Stop offset="1" stopColor={theme.colors.primary} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        {ticks.map((t, i) => (
          <Line
            key={i}
            x1={padL}
            y1={t.y}
            x2={width - padR}
            y2={t.y}
            stroke={theme.colors.border}
            strokeWidth={1}
          />
        ))}
        {areaPath ? <Path d={areaPath} fill="url(#grad)" /> : null}
        <Path d={linePath} stroke={theme.colors.primary} strokeWidth={2.5} fill="none" />
        {coords.map((c, i) => (
          <Circle key={i} cx={c.x} cy={c.y} r={3.5} fill={theme.colors.primary} />
        ))}
      </Svg>
      <View style={[styles.yLabels, { height, left: 0 }]}>
        {ticks.map((t, i) => (
          <Text
            key={i}
            style={[
              styles.yLabel,
              { top: t.y - 8 },
            ]}
          >
            {Math.round(t.v)}
          </Text>
        ))}
      </View>
      <View style={styles.xLabels}>
        {coords.map((c, i) => {
          if (n > 6 && i % Math.ceil(n / 5) !== 0 && i !== n - 1) return null;
          return (
            <Text
              key={i}
              style={[styles.xLabel, { left: c.x - 20, width: 40 }]}
              numberOfLines={1}
            >
              {c.label}
            </Text>
          );
        })}
      </View>
      <Text style={styles.unit}>{unit}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
  yLabels: {
    position: 'absolute',
    width: 36,
    top: 0,
  },
  yLabel: {
    position: 'absolute',
    left: 0,
    width: 32,
    textAlign: 'right',
    color: theme.colors.textSecondary,
    fontSize: 10,
  },
  xLabels: {
    position: 'absolute',
    bottom: 2,
    left: 0,
    right: 0,
    height: 20,
  },
  xLabel: {
    position: 'absolute',
    color: theme.colors.textSecondary,
    fontSize: 10,
    textAlign: 'center',
  },
  unit: {
    position: 'absolute',
    top: 4,
    right: 8,
    color: theme.colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
  },
});
