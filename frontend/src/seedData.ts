export type Category = {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  icon: string;
};

export const CATEGORIES: Category[] = [
  { id: 'chest', name: 'Chest', color: '#FF3B30', bgColor: '#3A1515', icon: 'dumbbell' },
  { id: 'back', name: 'Back', color: '#007AFF', bgColor: '#102740', icon: 'human-handsdown' },
  { id: 'legs', name: 'Legs', color: '#34C759', bgColor: '#12301B', icon: 'run-fast' },
  { id: 'shoulders', name: 'Shoulders', color: '#FF9500', bgColor: '#3A2410', icon: 'weight-lifter' },
  { id: 'arms', name: 'Arms', color: '#AF52DE', bgColor: '#2B1838', icon: 'arm-flex' },
  { id: 'abs', name: 'Abs', color: '#FFCC00', bgColor: '#2E2810', icon: 'fire' },
];

export type ExerciseMeta = {
  name: string;
  primary: string[];   // muscle IDs (see muscles.ts)
  secondary: string[];
  description: string;
  tips: string;
};

// Exercise metadata per category. Keys = exercise names (same as before).
export const DEFAULT_EXERCISES: Record<string, ExerciseMeta[]> = {
  chest: [
    { name: 'Barbell Bench Press', primary: ['chest'], secondary: ['triceps', 'shoulders'], description: 'Classic compound lift for overall chest mass and pressing strength.', tips: 'Keep shoulder blades retracted; bar path slightly diagonal over lower chest.' },
    { name: 'Incline Dumbbell Press', primary: ['chest'], secondary: ['shoulders', 'triceps'], description: 'Targets the upper chest with a greater range of motion.', tips: 'Set bench 30–45°. Lower dumbbells until elbows are just below shoulders.' },
    { name: 'Decline Bench Press', primary: ['chest'], secondary: ['triceps'], description: 'Emphasizes the lower pecs.', tips: 'Tuck elbows slightly. Control the descent — no bouncing off the chest.' },
    { name: 'Dumbbell Flyes', primary: ['chest'], secondary: ['shoulders'], description: 'Isolation lift stretching and contracting the pecs.', tips: 'Soft bend in elbows; imagine hugging a tree.' },
    { name: 'Cable Crossover', primary: ['chest'], secondary: ['shoulders'], description: 'Constant-tension isolation for inner chest.', tips: 'Slight forward lean; squeeze hands together in front.' },
    { name: 'Push-Ups', primary: ['chest'], secondary: ['triceps', 'shoulders', 'abs'], description: 'Bodyweight staple — scales from beginner to advanced.', tips: 'Keep body rigid, hands under shoulders, elbows ~45°.' },
    { name: 'Chest Dips', primary: ['chest'], secondary: ['triceps', 'shoulders'], description: 'Compound lift emphasizing lower chest.', tips: 'Lean forward; go deep but stop before shoulder pain.' },
    { name: 'Machine Chest Press', primary: ['chest'], secondary: ['triceps', 'shoulders'], description: 'Machine-stabilized press — great for higher-volume work.', tips: 'Don\'t lock out elbows; keep chest proud.' },
    { name: 'Pec Deck Machine', primary: ['chest'], secondary: [], description: 'Pure chest isolation with controlled path.', tips: 'Squeeze pecs at peak for a beat; avoid shrugging.' },
    { name: 'Svend Press', primary: ['chest'], secondary: [], description: 'Plate press for inner chest burnout.', tips: 'Press plates together hard the entire set.' },
  ],
  back: [
    { name: 'Deadlift', primary: ['lower-back', 'upper-back'], secondary: ['hamstrings', 'glutes', 'traps', 'forearms'], description: 'The king of compound lifts.', tips: 'Bar over mid-foot, lats engaged, push floor away.' },
    { name: 'Pull-Ups', primary: ['lats', 'upper-back'], secondary: ['biceps', 'forearms'], description: 'Bodyweight vertical pull.', tips: 'Pull chest to bar; avoid kipping for strict strength.' },
    { name: 'Barbell Row', primary: ['upper-back', 'lats'], secondary: ['biceps', 'lower-back'], description: 'Horizontal pull for back thickness.', tips: 'Torso ~45°; row to lower sternum.' },
    { name: 'Lat Pulldown', primary: ['lats'], secondary: ['biceps', 'upper-back'], description: 'Great lat isolation for those who can\'t do pull-ups yet.', tips: 'Lean back slightly; drive elbows down, not back.' },
    { name: 'Seated Cable Row', primary: ['upper-back'], secondary: ['lats', 'biceps'], description: 'Mid-back thickness builder.', tips: 'Chest up, squeeze shoulder blades at peak.' },
    { name: 'T-Bar Row', primary: ['upper-back', 'lats'], secondary: ['biceps'], description: 'Heavy row variation with neutral grip.', tips: 'Hinge at hips; pull elbows behind body.' },
    { name: 'Single-Arm Dumbbell Row', primary: ['lats'], secondary: ['upper-back', 'biceps'], description: 'Unilateral row — fixes imbalances.', tips: 'Pull dumbbell toward hip, not shoulder.' },
    { name: 'Face Pull', primary: ['upper-back', 'shoulders'], secondary: [], description: 'Rear delt + external rotation health move.', tips: 'Pull rope to forehead; thumbs back.' },
    { name: 'Shrugs', primary: ['traps'], secondary: [], description: 'Trap isolation for upper-back density.', tips: 'Shrug straight up — don\'t roll shoulders.' },
    { name: 'Hyperextension', primary: ['lower-back'], secondary: ['glutes', 'hamstrings'], description: 'Lower-back / posterior chain work.', tips: 'Don\'t hyper-extend past neutral.' },
  ],
  legs: [
    { name: 'Back Squat', primary: ['quads', 'glutes'], secondary: ['hamstrings', 'abs', 'lower-back'], description: 'The king of leg lifts.', tips: 'Feet shoulder-width; knees track toes; chest up.' },
    { name: 'Front Squat', primary: ['quads'], secondary: ['glutes', 'abs'], description: 'Quad-dominant squat variant.', tips: 'Elbows high; torso stays upright.' },
    { name: 'Romanian Deadlift', primary: ['hamstrings', 'glutes'], secondary: ['lower-back'], description: 'Hip-hinge movement for posterior chain.', tips: 'Push hips back; soft knees; bar close to legs.' },
    { name: 'Leg Press', primary: ['quads', 'glutes'], secondary: ['hamstrings'], description: 'Heavy-loading quad work with less back stress.', tips: 'Don\'t round lower back; control descent.' },
    { name: 'Walking Lunges', primary: ['quads', 'glutes'], secondary: ['hamstrings', 'calves'], description: 'Unilateral quad + glute builder.', tips: 'Big step; back knee hovers above ground.' },
    { name: 'Bulgarian Split Squat', primary: ['quads', 'glutes'], secondary: ['hamstrings'], description: 'Single-leg squat with rear foot elevated.', tips: 'Shift weight to front heel; torso slightly forward.' },
    { name: 'Leg Extension', primary: ['quads'], secondary: [], description: 'Pure quad isolation.', tips: 'Pause at top; full but controlled range.' },
    { name: 'Leg Curl', primary: ['hamstrings'], secondary: [], description: 'Hamstring isolation (prone or seated).', tips: 'No hip-thrust cheating; control the eccentric.' },
    { name: 'Calf Raise', primary: ['calves'], secondary: [], description: 'Calf isolation — high-volume friendly.', tips: 'Full stretch at bottom; pause at the top.' },
    { name: 'Hip Thrust', primary: ['glutes'], secondary: ['hamstrings'], description: 'Top-tier glute builder.', tips: 'Chin tucked; squeeze glutes hard at top.' },
  ],
  shoulders: [
    { name: 'Overhead Press', primary: ['shoulders'], secondary: ['triceps', 'upper-back'], description: 'Standing barbell press — builds overall shoulders.', tips: 'Glutes + abs tight; bar path straight over mid-foot.' },
    { name: 'Dumbbell Shoulder Press', primary: ['shoulders'], secondary: ['triceps'], description: 'Seated or standing DB press — greater ROM.', tips: 'Wrists stacked over elbows; control both directions.' },
    { name: 'Lateral Raise', primary: ['shoulders'], secondary: [], description: 'Side-delt isolation for wider shoulders.', tips: 'Lead with elbows; pinky slightly higher than thumb.' },
    { name: 'Front Raise', primary: ['shoulders'], secondary: [], description: 'Front-delt isolation.', tips: 'Don\'t swing; stop at shoulder height.' },
    { name: 'Rear Delt Fly', primary: ['shoulders', 'upper-back'], secondary: [], description: 'Rear delt isolation for balanced shoulders.', tips: 'Slight elbow bend; lead with pinkies up.' },
    { name: 'Arnold Press', primary: ['shoulders'], secondary: ['triceps'], description: 'Rotational DB press hitting all three delt heads.', tips: 'Start palms-in; rotate out as you press.' },
    { name: 'Upright Row', primary: ['shoulders', 'traps'], secondary: [], description: 'Pull variation for delts + traps.', tips: 'Go to chest height max; wider grip is shoulder-friendlier.' },
    { name: 'Cable Lateral Raise', primary: ['shoulders'], secondary: [], description: 'Constant-tension side-delt work.', tips: 'Lean slightly away from cable for full arc.' },
    { name: 'Face Pull', primary: ['shoulders', 'upper-back'], secondary: [], description: 'Rear delt + external rotation.', tips: 'High elbows; pull to forehead.' },
    { name: 'Push Press', primary: ['shoulders'], secondary: ['triceps', 'quads'], description: 'Explosive press using leg drive.', tips: 'Short dip; drive hard with legs; finish with arms.' },
  ],
  arms: [
    { name: 'Barbell Curl', primary: ['biceps'], secondary: ['forearms'], description: 'Classic mass builder for biceps.', tips: 'Elbows pinned; no swinging.' },
    { name: 'Dumbbell Curl', primary: ['biceps'], secondary: ['forearms'], description: 'Bilateral or alternating — full supination.', tips: 'Twist wrists out at top for peak squeeze.' },
    { name: 'Hammer Curl', primary: ['biceps', 'forearms'], secondary: [], description: 'Neutral-grip curl targeting brachialis.', tips: 'Thumbs up throughout; keep elbows still.' },
    { name: 'Preacher Curl', primary: ['biceps'], secondary: [], description: 'Strict curl with arm support.', tips: 'Full stretch at bottom; don\'t drop the weight.' },
    { name: 'Concentration Curl', primary: ['biceps'], secondary: [], description: 'Seated single-arm isolation.', tips: 'Elbow braced on thigh; slow controlled reps.' },
    { name: 'Tricep Pushdown', primary: ['triceps'], secondary: [], description: 'Cable isolation for tricep lateral head.', tips: 'Elbows glued to sides; full lockout at bottom.' },
    { name: 'Skull Crushers', primary: ['triceps'], secondary: [], description: 'Lying tricep extension for mass.', tips: 'Move only at elbows; lower behind head slightly.' },
    { name: 'Overhead Tricep Extension', primary: ['triceps'], secondary: [], description: 'Overhead extension stretching long head.', tips: 'Elbows pointed forward; deep stretch.' },
    { name: 'Close-Grip Bench Press', primary: ['triceps'], secondary: ['chest', 'shoulders'], description: 'Compound tricep-focused press.', tips: 'Grip shoulder-width; elbows tucked.' },
    { name: 'Dips', primary: ['triceps'], secondary: ['chest', 'shoulders'], description: 'Bodyweight tricep compound.', tips: 'Body vertical for triceps; forward lean for chest.' },
  ],
  abs: [
    { name: 'Plank', primary: ['abs'], secondary: ['obliques', 'shoulders'], description: 'Isometric core stability.', tips: 'Glutes tight; no hip sag; breathe.' },
    { name: 'Crunches', primary: ['abs'], secondary: [], description: 'Classic upper-ab flexion.', tips: 'Don\'t pull on neck; exhale at top.' },
    { name: 'Hanging Leg Raise', primary: ['abs'], secondary: ['forearms'], description: 'Toughest ab movement — lower abs hit hard.', tips: 'No swinging; control on the way down.' },
    { name: 'Russian Twist', primary: ['obliques'], secondary: ['abs'], description: 'Rotational oblique work.', tips: 'Lean back ~45°; rotate torso, not just arms.' },
    { name: 'Bicycle Crunch', primary: ['abs', 'obliques'], secondary: [], description: 'Dynamic full-ab movement.', tips: 'Slow is harder — don\'t race.' },
    { name: 'Cable Crunch', primary: ['abs'], secondary: [], description: 'Weighted kneeling crunch.', tips: 'Crunch chest toward hips; round spine.' },
    { name: 'Mountain Climbers', primary: ['abs'], secondary: ['shoulders', 'quads'], description: 'Cardio + core combo.', tips: 'Hips stay low; fast feet.' },
    { name: 'V-Ups', primary: ['abs'], secondary: ['obliques'], description: 'Full-body crunch hitting upper + lower abs.', tips: 'Touch fingers to toes at the top.' },
    { name: 'Ab Wheel Rollout', primary: ['abs'], secondary: ['shoulders', 'lats'], description: 'Anti-extension stability + strength.', tips: 'Brace hard; don\'t sag at bottom.' },
    { name: 'Side Plank', primary: ['obliques'], secondary: ['abs', 'shoulders'], description: 'Anti-lateral-flexion core hold.', tips: 'Stack feet; hips up high.' },
  ],
};
