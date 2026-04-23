import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Ellipse, G, Rect } from 'react-native-svg';
import { theme } from './theme';
import { MuscleId } from './muscles';

type Props = {
  view: 'front' | 'back';
  bodyType: 'female' | 'male';
  primary: MuscleId[];
  secondary: MuscleId[];
  width?: number;
  height?: number;
};

const SILHOUETTE = theme.colors.surfaceLight; // body fill
const OUTLINE = theme.colors.border;
const INACTIVE = 'rgba(255,255,255,0.06)';
const PRIMARY = theme.colors.primary;
const SECONDARY = '#FF9500';

/**
 * Simple stylised body silhouette. Female default has narrower waist +
 * slightly wider hips. Male has broader shoulders. Muscle "regions" are drawn
 * on top as filled shapes which recolor when primary / secondary.
 * viewBox: 200 x 480
 */
export default function MuscleDiagram({
  view,
  bodyType,
  primary,
  secondary,
  width = 220,
  height = 420,
}: Props) {
  const fill = (m: MuscleId) =>
    primary.includes(m) ? PRIMARY : secondary.includes(m) ? SECONDARY : INACTIVE;

  const female = bodyType === 'female';
  // Shoulder width & waist differ slightly between sexes.
  const shoulderW = female ? 80 : 92;
  const waistW = female ? 44 : 58;
  const hipW = female ? 74 : 72;

  // Reusable silhouette path
  const silhouette = (
    <>
      {/* Head */}
      <Circle cx={100} cy={44} r={26} fill={SILHOUETTE} stroke={OUTLINE} strokeWidth={1} />
      {/* Neck */}
      <Rect x={92} y={66} width={16} height={14} fill={SILHOUETTE} stroke={OUTLINE} strokeWidth={1} />
      {/* Torso */}
      <Path
        d={`
          M ${100 - shoulderW / 2} 84
          Q ${100 - shoulderW / 2 - 6} 120 ${100 - waistW / 2 - 4} 200
          Q ${100 - waistW / 2} 230 ${100 - hipW / 2} 260
          L ${100 + hipW / 2} 260
          Q ${100 + waistW / 2} 230 ${100 + waistW / 2 + 4} 200
          Q ${100 + shoulderW / 2 + 6} 120 ${100 + shoulderW / 2} 84
          Z
        `}
        fill={SILHOUETTE}
        stroke={OUTLINE}
        strokeWidth={1}
      />
      {/* Left arm */}
      <Path
        d={`M ${100 - shoulderW / 2 - 2} 90 Q ${100 - shoulderW / 2 - 18} 150 ${100 - shoulderW / 2 - 16} 220 L ${100 - shoulderW / 2 - 4} 220 Q ${100 - shoulderW / 2} 150 ${100 - shoulderW / 2 + 4} 92 Z`}
        fill={SILHOUETTE}
        stroke={OUTLINE}
        strokeWidth={1}
      />
      {/* Right arm */}
      <Path
        d={`M ${100 + shoulderW / 2 + 2} 90 Q ${100 + shoulderW / 2 + 18} 150 ${100 + shoulderW / 2 + 16} 220 L ${100 + shoulderW / 2 + 4} 220 Q ${100 + shoulderW / 2} 150 ${100 + shoulderW / 2 - 4} 92 Z`}
        fill={SILHOUETTE}
        stroke={OUTLINE}
        strokeWidth={1}
      />
      {/* Left leg */}
      <Path
        d={`M ${100 - hipW / 2 + 4} 260 Q ${100 - hipW / 2 - 4} 340 ${100 - hipW / 2 + 2} 440 L ${100 - 4} 440 Q ${96} 340 ${100 - hipW / 2 + 16} 260 Z`}
        fill={SILHOUETTE}
        stroke={OUTLINE}
        strokeWidth={1}
      />
      {/* Right leg */}
      <Path
        d={`M ${100 + hipW / 2 - 4} 260 Q ${100 + hipW / 2 + 4} 340 ${100 + hipW / 2 - 2} 440 L ${100 + 4} 440 Q ${104} 340 ${100 + hipW / 2 - 16} 260 Z`}
        fill={SILHOUETTE}
        stroke={OUTLINE}
        strokeWidth={1}
      />
    </>
  );

  // FRONT muscles
  const front = (
    <>
      {/* Shoulders (front delts) */}
      <Ellipse cx={100 - shoulderW / 2 + 2} cy={96} rx={14} ry={10} fill={fill('shoulders')} />
      <Ellipse cx={100 + shoulderW / 2 - 2} cy={96} rx={14} ry={10} fill={fill('shoulders')} />
      {/* Chest — two pec ellipses */}
      <Ellipse cx={100 - 18} cy={120} rx={22} ry={18} fill={fill('chest')} />
      <Ellipse cx={100 + 18} cy={120} rx={22} ry={18} fill={fill('chest')} />
      {/* Biceps */}
      <Ellipse cx={100 - shoulderW / 2 - 6} cy={130} rx={10} ry={18} fill={fill('biceps')} />
      <Ellipse cx={100 + shoulderW / 2 + 6} cy={130} rx={10} ry={18} fill={fill('biceps')} />
      {/* Forearms */}
      <Ellipse cx={100 - shoulderW / 2 - 10} cy={180} rx={9} ry={22} fill={fill('forearms')} />
      <Ellipse cx={100 + shoulderW / 2 + 10} cy={180} rx={9} ry={22} fill={fill('forearms')} />
      {/* Abs — stacked rects */}
      {[0, 1, 2, 3].map((i) => (
        <Rect
          key={i}
          x={100 - 16}
          y={152 + i * 18}
          width={32}
          height={14}
          rx={3}
          fill={fill('abs')}
        />
      ))}
      {/* Obliques */}
      <Path
        d={`M ${100 - waistW / 2} 170 Q ${100 - waistW / 2 - 6} 195 ${100 - waistW / 2 + 2} 220 L ${100 - 18} 220 L ${100 - 18} 170 Z`}
        fill={fill('obliques')}
      />
      <Path
        d={`M ${100 + waistW / 2} 170 Q ${100 + waistW / 2 + 6} 195 ${100 + waistW / 2 - 2} 220 L ${100 + 18} 220 L ${100 + 18} 170 Z`}
        fill={fill('obliques')}
      />
      {/* Quads */}
      <Ellipse cx={100 - 20} cy={310} rx={15} ry={40} fill={fill('quads')} />
      <Ellipse cx={100 + 20} cy={310} rx={15} ry={40} fill={fill('quads')} />
    </>
  );

  // BACK muscles
  const back = (
    <>
      {/* Traps */}
      <Path
        d={`M ${100 - 22} 82 L ${100 + 22} 82 L ${100 + 14} 112 L ${100 - 14} 112 Z`}
        fill={fill('traps')}
      />
      {/* Rear shoulders */}
      <Ellipse cx={100 - shoulderW / 2 + 2} cy={96} rx={14} ry={10} fill={fill('shoulders')} />
      <Ellipse cx={100 + shoulderW / 2 - 2} cy={96} rx={14} ry={10} fill={fill('shoulders')} />
      {/* Upper back */}
      <Rect x={100 - 28} y={108} width={56} height={30} rx={6} fill={fill('upper-back')} />
      {/* Lats */}
      <Path
        d={`M ${100 - 30} 138 Q ${100 - 40} 180 ${100 - 22} 210 L ${100 - 4} 210 L ${100 - 4} 138 Z`}
        fill={fill('lats')}
      />
      <Path
        d={`M ${100 + 30} 138 Q ${100 + 40} 180 ${100 + 22} 210 L ${100 + 4} 210 L ${100 + 4} 138 Z`}
        fill={fill('lats')}
      />
      {/* Triceps */}
      <Ellipse cx={100 - shoulderW / 2 - 6} cy={130} rx={10} ry={18} fill={fill('triceps')} />
      <Ellipse cx={100 + shoulderW / 2 + 6} cy={130} rx={10} ry={18} fill={fill('triceps')} />
      {/* Forearms */}
      <Ellipse cx={100 - shoulderW / 2 - 10} cy={180} rx={9} ry={22} fill={fill('forearms')} />
      <Ellipse cx={100 + shoulderW / 2 + 10} cy={180} rx={9} ry={22} fill={fill('forearms')} />
      {/* Lower back */}
      <Rect x={100 - 20} y={212} width={40} height={30} rx={6} fill={fill('lower-back')} />
      {/* Glutes */}
      <Ellipse cx={100 - 16} cy={262} rx={18} ry={16} fill={fill('glutes')} />
      <Ellipse cx={100 + 16} cy={262} rx={18} ry={16} fill={fill('glutes')} />
      {/* Hamstrings */}
      <Ellipse cx={100 - 20} cy={320} rx={14} ry={38} fill={fill('hamstrings')} />
      <Ellipse cx={100 + 20} cy={320} rx={14} ry={38} fill={fill('hamstrings')} />
      {/* Calves */}
      <Ellipse cx={100 - 20} cy={400} rx={11} ry={28} fill={fill('calves')} />
      <Ellipse cx={100 + 20} cy={400} rx={11} ry={28} fill={fill('calves')} />
    </>
  );

  return (
    <View style={styles.wrap}>
      <Svg width={width} height={height} viewBox="0 0 200 460">
        <G>{silhouette}</G>
        <G>{view === 'front' ? front : back}</G>
      </Svg>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: PRIMARY }]} />
          <Text style={styles.legendText}>Primary</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: SECONDARY }]} />
          <Text style={styles.legendText}>Secondary</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  legend: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { color: theme.colors.textSecondary, fontSize: 11 },
});
