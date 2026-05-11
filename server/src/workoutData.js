/**
 * Full 12-week calisthenics + rehab workout program
 * Organized into 3 phases of 4 weeks each
 */

// Workout rotation pattern (0-indexed day of week, repeats)
// 0=A, 1=B, 2=A, 3=B, 4=C, 5=A, 6=B
const WORKOUT_ROTATION = ['A', 'B', 'A', 'B', 'C', 'A', 'B'];

// Phase detection
function getPhase(weekNumber) {
  if (weekNumber <= 4) return 'foundation';
  if (weekNumber <= 8) return 'strength';
  return 'advanced';
}

// Determine workout type for a given program day (0-indexed)
function getWorkoutTypeForDay(dayIndex) {
  return WORKOUT_ROTATION[dayIndex % 7];
}

// Determine week number for a given program day (0-indexed)
function getWeekNumber(dayIndex) {
  return Math.floor(dayIndex / 7) + 1;
}

const workoutProgram = {
  A: {
    name: 'Upper Body + Core',
    description: 'Focuses on push/pull strength and core stability',
    phases: {
      foundation: {
        label: 'Weeks 1-4: Foundation',
        exercises: [
          {
            id: 'incline_pushup',
            name: 'Incline Push-ups',
            description: 'Hands on elevated surface (bench/chair height). Keep body straight.',
            sets: 3,
            reps: '8-10',
            restSeconds: 60,
            type: 'reps',
            cues: ['Elbows at 45°', 'Full range of motion', 'Controlled descent'],
          },
          {
            id: 'table_row',
            name: 'Table/Band Rows',
            description: 'Lie under a table and pull chest to edge, or use resistance band.',
            sets: 3,
            reps: '8-10',
            restSeconds: 60,
            type: 'reps',
            cues: ['Squeeze shoulder blades', 'Keep body straight', 'Full arm extension'],
          },
          {
            id: 'plank_hold',
            name: 'Plank Hold',
            description: 'Forearm plank. Maintain neutral spine throughout.',
            sets: 3,
            reps: '20 seconds',
            restSeconds: 60,
            type: 'time',
            durationSeconds: 20,
            cues: ['Hips level', 'Brace core', 'Breathe steadily'],
          },
          {
            id: 'dead_bug',
            name: 'Dead Bugs',
            description: 'Lie on back, arms up. Extend opposite arm/leg while keeping lower back flat.',
            sets: 3,
            reps: '6 each side',
            restSeconds: 60,
            type: 'reps',
            cues: ['Lower back pressed to floor', 'Move slowly', 'Exhale as you extend'],
          },
        ],
      },
      strength: {
        label: 'Weeks 5-8: Strength Building',
        exercises: [
          {
            id: 'standard_pushup',
            name: 'Standard Push-ups',
            description: 'Full push-up on floor. Focus on controlled tempo.',
            sets: 4,
            reps: '10-12',
            restSeconds: 75,
            type: 'reps',
            cues: ['Chest to floor', 'Elbows at 45°', '2-second descent'],
          },
          {
            id: 'table_row',
            name: 'Table/Band Rows',
            description: 'Increase difficulty - elevate feet or use heavier band.',
            sets: 4,
            reps: '10-12',
            restSeconds: 75,
            type: 'reps',
            cues: ['Squeeze at top', 'Pause briefly', 'Control the negative'],
          },
          {
            id: 'plank_hold',
            name: 'Plank Hold',
            description: 'Forearm or extended arm plank.',
            sets: 3,
            reps: '35 seconds',
            restSeconds: 60,
            type: 'time',
            durationSeconds: 35,
            cues: ['Hips level', 'No sagging', 'Full tension throughout'],
          },
          {
            id: 'dead_bug',
            name: 'Dead Bugs',
            description: 'Add 1-2 second pause at full extension.',
            sets: 3,
            reps: '8 each side',
            restSeconds: 60,
            type: 'reps',
            cues: ['Pause at extension', 'Lower back flat', 'Controlled return'],
          },
          {
            id: 'hollow_hold',
            name: 'Hollow Hold',
            description: 'On back, arms overhead and legs extended, create a "banana" shape.',
            sets: 3,
            reps: '20 seconds',
            restSeconds: 60,
            type: 'time',
            durationSeconds: 20,
            cues: ['Lower back rounded slightly', 'Arms by ears', 'Legs low but no touching floor'],
          },
        ],
      },
      advanced: {
        label: 'Weeks 9-12: Advanced Progression',
        exercises: [
          {
            id: 'archer_pushup',
            name: 'Archer / Wide Push-ups',
            description: 'Wide hand placement, shift weight side to side or perform wider-stance push-ups.',
            sets: 4,
            reps: '8-10 each side',
            restSeconds: 90,
            type: 'reps',
            cues: ['Full range of motion', 'Keep hips level', 'Controlled tempo'],
          },
          {
            id: 'table_row_advanced',
            name: 'Feet-Elevated Rows',
            description: 'Table rows with feet on a chair for increased intensity.',
            sets: 4,
            reps: '10-12',
            restSeconds: 75,
            type: 'reps',
            cues: ['Body straight as a board', 'Pull to lower chest', 'Squeeze and hold'],
          },
          {
            id: 'plank_hold',
            name: 'Plank Hold',
            description: 'Straight arm plank with shoulder taps or leg raises.',
            sets: 4,
            reps: '45 seconds',
            restSeconds: 75,
            type: 'time',
            durationSeconds: 45,
            cues: ['Stable base', 'Minimize rotation on taps', 'Full tension'],
          },
          {
            id: 'dead_bug_advanced',
            name: 'Dead Bugs - Extended',
            description: 'Add weight (book/water bottle) to arm for extra challenge.',
            sets: 3,
            reps: '10 each side',
            restSeconds: 60,
            type: 'reps',
            cues: ['Core braced throughout', 'Slow and controlled', 'Full extension each rep'],
          },
          {
            id: 'hollow_hold',
            name: 'Hollow Hold',
            description: 'Full hollow body - try to hold for 30+ seconds.',
            sets: 3,
            reps: '30 seconds',
            restSeconds: 75,
            type: 'time',
            durationSeconds: 30,
            cues: ['Chin tucked', 'Arms fully extended', 'Ribs down'],
          },
          {
            id: 'pike_pushup',
            name: 'Pike Push-ups',
            description: 'Inverted V position, lower head toward floor. Builds overhead strength.',
            sets: 3,
            reps: '6-8',
            restSeconds: 90,
            type: 'reps',
            cues: ['Hips high', 'Head to floor', 'Press back to start'],
          },
        ],
      },
    },
  },

  B: {
    name: 'Lower Body + Rehab',
    description: 'Knee/ankle rehab focused lower body work with progressive loading',
    phases: {
      foundation: {
        label: 'Weeks 1-4: Foundation',
        exercises: [
          {
            id: 'spanish_squat_iso',
            name: 'Spanish Squat Isometric',
            description: 'Use band around post/tree. Hold squat position with shins vertical.',
            sets: 3,
            reps: '30 second hold',
            restSeconds: 90,
            type: 'time',
            durationSeconds: 30,
            cues: ['Shins vertical', 'Band pulls knees out', 'Upright torso'],
          },
          {
            id: 'glute_bridge',
            name: 'Glute Bridges',
            description: 'On back, feet flat. Drive hips up and squeeze glutes at top.',
            sets: 3,
            reps: '12',
            restSeconds: 60,
            type: 'reps',
            cues: ['Squeeze glutes hard', 'Neutral spine at top', 'Controlled descent'],
          },
          {
            id: 'calf_raise',
            name: 'Calf Raises (Double Leg)',
            description: 'Stand on edge of step. Slow 3-second raise, pause at top.',
            sets: 3,
            reps: '15',
            restSeconds: 60,
            type: 'reps',
            cues: ['Full range of motion', '3 seconds up, 3 down', 'Control the descent'],
          },
          {
            id: 'tibialis_raise',
            name: 'Tibialis Raises',
            description: 'Stand with back against wall, lift toes/forefoot up repeatedly.',
            sets: 3,
            reps: '15-20',
            restSeconds: 60,
            type: 'reps',
            cues: ['Heels on floor', 'Full dorsiflexion', 'Feel the shin burn'],
          },
          {
            id: 'split_squat_shallow',
            name: 'Split Squat (Shallow)',
            description: 'Staggered stance squat. Front foot forward, back foot back. Stay upright.',
            sets: 3,
            reps: '8 each side',
            restSeconds: 90,
            type: 'reps',
            cues: ['Front shin vertical', 'Small ROM initially', 'Upright torso'],
          },
        ],
      },
      strength: {
        label: 'Weeks 5-8: Strength Building',
        exercises: [
          {
            id: 'spanish_squat_iso',
            name: 'Spanish Squat Isometric',
            description: 'Increase hold time. Try adding light weight for extra challenge.',
            sets: 3,
            reps: '45 second hold',
            restSeconds: 90,
            type: 'time',
            durationSeconds: 45,
            cues: ['Stay low', 'Breathe steadily', 'Don\'t let form break down'],
          },
          {
            id: 'single_leg_glute_bridge',
            name: 'Single-Leg Glute Bridges',
            description: 'Same as bridge but one foot on floor, other extended. Progress gradually.',
            sets: 3,
            reps: '10 each side',
            restSeconds: 75,
            type: 'reps',
            cues: ['Hips level', 'Full hip extension', 'Strong glute squeeze'],
          },
          {
            id: 'calf_raise_single',
            name: 'Calf Raises (Single Leg)',
            description: 'Progress to single-leg when double-leg feels easy.',
            sets: 3,
            reps: '10-12 each',
            restSeconds: 75,
            type: 'reps',
            cues: ['Use wall for balance only', 'Full range of motion', 'Control descent'],
          },
          {
            id: 'tibialis_raise',
            name: 'Tibialis Raises',
            description: 'Add weight on toes or use resistance band for progression.',
            sets: 3,
            reps: '20-25',
            restSeconds: 60,
            type: 'reps',
            cues: ['Heels stay down', 'High repetition is okay', 'Consistent tempo'],
          },
          {
            id: 'split_squat_deep',
            name: 'Split Squat (Full Depth)',
            description: 'Increase depth - back knee approaches floor.',
            sets: 3,
            reps: '10 each side',
            restSeconds: 90,
            type: 'reps',
            cues: ['Back knee to 1-2 inches from floor', 'Upright torso', 'Drive through front heel'],
          },
          {
            id: 'step_up',
            name: 'Step-ups',
            description: 'Step onto a sturdy box/step. Full extension at top.',
            sets: 3,
            reps: '10 each side',
            restSeconds: 75,
            type: 'reps',
            cues: ['Heel on box', 'Don\'t push off back foot', 'Controlled step down'],
          },
        ],
      },
      advanced: {
        label: 'Weeks 9-12: Advanced Progression',
        exercises: [
          {
            id: 'spanish_squat_iso',
            name: 'Spanish Squat Isometric',
            description: 'Weighted hold or increased duration. Push through discomfort (not pain).',
            sets: 4,
            reps: '60 second hold',
            restSeconds: 120,
            type: 'time',
            durationSeconds: 60,
            cues: ['Add weight if possible', 'Full minute hold', 'Mental toughness'],
          },
          {
            id: 'single_leg_glute_bridge',
            name: 'Single-Leg Glute Bridges',
            description: 'Add 2-second pause at top, or elevate foot on surface.',
            sets: 4,
            reps: '12 each side',
            restSeconds: 75,
            type: 'reps',
            cues: ['Pause at top', 'No hip drop', 'Drive through heel'],
          },
          {
            id: 'calf_raise_single',
            name: 'Calf Raises (Single Leg - Weighted)',
            description: 'Add weight in one hand for progression.',
            sets: 3,
            reps: '12-15 each',
            restSeconds: 75,
            type: 'reps',
            cues: ['Full ROM', 'Hold at top', 'Slow eccentric'],
          },
          {
            id: 'tibialis_raise',
            name: 'Tibialis Raises (Weighted)',
            description: 'Place weight on feet or use Tib Bar if available.',
            sets: 3,
            reps: '15-20',
            restSeconds: 60,
            type: 'reps',
            cues: ['Weighted version', 'Full dorsiflexion', 'Progressive overload'],
          },
          {
            id: 'bulgarian_split_squat',
            name: 'Bulgarian Split Squat',
            description: 'Rear foot elevated on bench/chair. Full range of motion.',
            sets: 3,
            reps: '8-10 each side',
            restSeconds: 120,
            type: 'reps',
            cues: ['Rear foot elevated', 'Front shin vertical', 'Deep range of motion'],
          },
          {
            id: 'step_up_high',
            name: 'Step-ups (Higher Box)',
            description: 'Increase box height. Aim for thigh parallel or above.',
            sets: 3,
            reps: '10 each side',
            restSeconds: 90,
            type: 'reps',
            cues: ['Higher box = more challenge', 'Control at all times', 'Step down slowly'],
          },
        ],
      },
    },
    // Flare-up mode exercises replace standard B workout
    flareUpExercises: [
      {
        id: 'spanish_squat_iso_light',
        name: 'Spanish Squat Isometric (Light)',
        description: 'Shallow hold only. Stop immediately if pain increases.',
        sets: 3,
        reps: '20 second hold',
        restSeconds: 90,
        type: 'time',
        durationSeconds: 20,
        cues: ['Pain-free range only', 'Very shallow squat', 'Stop if pain'],
      },
      {
        id: 'incline_pushup',
        name: 'Incline Push-ups',
        description: 'Upper body work to maintain volume without lower body loading.',
        sets: 3,
        reps: '10-12',
        restSeconds: 60,
        type: 'reps',
        cues: ['No lower body load', 'Focus on form', 'Breathe steadily'],
      },
      {
        id: 'seated_calf_raise',
        name: 'Seated Calf Raises',
        description: 'Sit on chair, raise heels. Minimal loading version.',
        sets: 3,
        reps: '20',
        restSeconds: 60,
        type: 'reps',
        cues: ['Seated to reduce load', 'Full range', 'Pain-free only'],
      },
      {
        id: 'tibialis_raise_seated',
        name: 'Seated Tibialis Raises',
        description: 'Seated version - less stressful on joints.',
        sets: 3,
        reps: '20',
        restSeconds: 60,
        type: 'reps',
        cues: ['Seated position', 'Lift toes only', 'No knee stress'],
      },
      {
        id: 'dead_bug',
        name: 'Dead Bugs',
        description: 'Core stability work - no leg loading.',
        sets: 3,
        reps: '8 each side',
        restSeconds: 60,
        type: 'reps',
        cues: ['Lower back flat', 'Slow and controlled', 'Core braced'],
      },
      {
        id: 'mobility_hip_circle',
        name: 'Hip Circles / Mobility',
        description: 'Gentle hip mobility circles. No pain, just movement.',
        sets: 2,
        reps: '10 each direction',
        restSeconds: 45,
        type: 'reps',
        cues: ['Pain-free movement', 'Gentle circles', 'Listen to your body'],
      },
    ],
  },

  C: {
    name: 'Full Body Conditioning',
    description: 'Circuit training combining all movement patterns',
    phases: {
      foundation: {
        label: 'Weeks 1-4: Foundation Circuit',
        circuit: true,
        rounds: 2,
        restBetweenRounds: 120,
        exercises: [
          {
            id: 'incline_pushup',
            name: 'Incline Push-ups',
            description: 'Hands elevated. Maintain push-up form throughout.',
            sets: 1,
            reps: '8',
            restSeconds: 30,
            type: 'reps',
            cues: ['Quality over quantity', 'Full range of motion'],
          },
          {
            id: 'bodyweight_squat',
            name: 'Bodyweight Squats',
            description: 'Comfortable depth squat. Feet shoulder-width apart.',
            sets: 1,
            reps: '10',
            restSeconds: 30,
            type: 'reps',
            cues: ['Hip crease below parallel', 'Knees track over toes', 'Chest up'],
          },
          {
            id: 'table_row',
            name: 'Rows',
            description: 'Table or band rows.',
            sets: 1,
            reps: '8',
            restSeconds: 30,
            type: 'reps',
            cues: ['Controlled movement', 'Shoulder blades together'],
          },
          {
            id: 'step_up',
            name: 'Step-ups',
            description: 'Alternating step-ups on sturdy surface.',
            sets: 1,
            reps: '8 each side',
            restSeconds: 30,
            type: 'reps',
            cues: ['Controlled pace', 'Full extension at top'],
          },
          {
            id: 'plank_hold',
            name: 'Plank Hold',
            description: 'Forearm plank to finish the circuit.',
            sets: 1,
            reps: '20 seconds',
            restSeconds: 30,
            type: 'time',
            durationSeconds: 20,
            cues: ['Hold strong', 'Breathe through it'],
          },
        ],
      },
      strength: {
        label: 'Weeks 5-8: Strength Circuit',
        circuit: true,
        rounds: 3,
        restBetweenRounds: 90,
        exercises: [
          {
            id: 'standard_pushup',
            name: 'Standard Push-ups',
            description: 'Full push-ups on floor.',
            sets: 1,
            reps: '10',
            restSeconds: 30,
            type: 'reps',
            cues: ['Chest to floor', 'Strong core'],
          },
          {
            id: 'bodyweight_squat',
            name: 'Squats',
            description: 'Add a pause at the bottom.',
            sets: 1,
            reps: '12',
            restSeconds: 30,
            type: 'reps',
            cues: ['2-second pause at bottom', 'Drive through heels'],
          },
          {
            id: 'table_row',
            name: 'Rows',
            description: 'Increased difficulty version.',
            sets: 1,
            reps: '10',
            restSeconds: 30,
            type: 'reps',
            cues: ['Harder variation', 'Slow negative'],
          },
          {
            id: 'step_up',
            name: 'Step-ups',
            description: 'Increase pace slightly while maintaining form.',
            sets: 1,
            reps: '10 each side',
            restSeconds: 30,
            type: 'reps',
            cues: ['Controlled but confident', 'Full hip extension'],
          },
          {
            id: 'plank_hold',
            name: 'Plank Hold',
            description: 'Increase hold time.',
            sets: 1,
            reps: '35 seconds',
            restSeconds: 30,
            type: 'time',
            durationSeconds: 35,
            cues: ['Push the hold', 'Don\'t break form'],
          },
        ],
      },
      advanced: {
        label: 'Weeks 9-12: Advanced Circuit',
        circuit: true,
        rounds: 4,
        restBetweenRounds: 60,
        exercises: [
          {
            id: 'standard_pushup',
            name: 'Push-ups',
            description: 'Maximum quality reps.',
            sets: 1,
            reps: '12-15',
            restSeconds: 20,
            type: 'reps',
            cues: ['Push to near-failure', 'Quality maintained'],
          },
          {
            id: 'squat_jump',
            name: 'Squat to Stand / Jump Squats',
            description: 'Add explosive element if joints allow. Otherwise deep squat holds.',
            sets: 1,
            reps: '12',
            restSeconds: 20,
            type: 'reps',
            cues: ['Land soft if jumping', 'Full depth', 'Power through'],
          },
          {
            id: 'table_row_advanced',
            name: 'Advanced Rows',
            description: 'Feet elevated rows.',
            sets: 1,
            reps: '10-12',
            restSeconds: 20,
            type: 'reps',
            cues: ['Hardest variation you can do', 'Control the negative'],
          },
          {
            id: 'step_up_high',
            name: 'Step-ups (High Box)',
            description: 'Use a higher surface if available.',
            sets: 1,
            reps: '10 each side',
            restSeconds: 20,
            type: 'reps',
            cues: ['Higher box', 'No pushing off back foot'],
          },
          {
            id: 'plank_hold',
            name: 'Plank Hold',
            description: 'Push for 45+ seconds.',
            sets: 1,
            reps: '45 seconds',
            restSeconds: 20,
            type: 'time',
            durationSeconds: 45,
            cues: ['Max effort hold', 'Body tight'],
          },
        ],
      },
    },
  },
};

/**
 * Get the appropriate exercises for a workout based on week and injury mode
 */
function getWorkoutExercises(workoutType, weekNumber, injuryMode = false) {
  const workout = workoutProgram[workoutType];
  if (!workout) return [];

  const phase = getPhase(weekNumber);
  const phaseData = workout.phases[phase];

  if (!phaseData) return [];

  // If flare-up mode and this is workout B, return reduced exercises
  if (injuryMode && workoutType === 'B') {
    return workout.flareUpExercises || phaseData.exercises;
  }

  return phaseData.exercises;
}

/**
 * Get workout metadata for a given week and type
 */
function getWorkoutMeta(workoutType, weekNumber, injuryMode = false) {
  const workout = workoutProgram[workoutType];
  if (!workout) return null;

  const phase = getPhase(weekNumber);
  const phaseData = workout.phases[phase];
  const exercises = getWorkoutExercises(workoutType, weekNumber, injuryMode);

  return {
    type: workoutType,
    name: injuryMode && workoutType === 'B' ? 'Lower Body Rehab (Flare-up Mode)' : workout.name,
    description: injuryMode && workoutType === 'B'
      ? 'Modified workout for flare-up / injury recovery. Reduced loading, focus on recovery.'
      : workout.description,
    phase,
    phaseLabel: phaseData.label,
    weekNumber,
    circuit: phaseData.circuit || false,
    rounds: phaseData.rounds || null,
    restBetweenRounds: phaseData.restBetweenRounds || null,
    injuryMode,
    exercises,
  };
}

module.exports = {
  WORKOUT_ROTATION,
  getPhase,
  getWorkoutTypeForDay,
  getWeekNumber,
  getWorkoutExercises,
  getWorkoutMeta,
  workoutProgram,
};
