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
            sets: 1,
            reps: '60 seconds',
            restSeconds: 60,
            type: 'time',
            durationSeconds: 60,
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
            sets: 1,
            reps: '1 min 45 sec',
            restSeconds: 60,
            type: 'time',
            durationSeconds: 105,
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
            sets: 1,
            reps: '3 minutes',
            restSeconds: 75,
            type: 'time',
            durationSeconds: 180,
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

// Step-by-step instructions keyed by exercise ID.
// Merged into every exercise at build time so the UI always has them.
const EXERCISE_HOW_TO = {
  incline_pushup: [
    'Find a raised surface: a bench, sturdy chair, or table edge — the higher it is the easier the movement.',
    'Place hands slightly wider than shoulder-width on the edge, fingers pointing forward.',
    'Step your feet back until your body is a straight line from head to heels — don\'t let your hips sag or pike up.',
    'Breathe in and slowly lower your chest to the surface, keeping elbows pointing diagonally back (not flared wide).',
    'Push through your palms to return to the start. That\'s one rep.',
  ],
  standard_pushup: [
    'Get into a high plank: hands directly under your shoulders, feet together, body in a straight line.',
    'Engage your core and glutes — think "moving plank", not just arm exercise.',
    'Breathe in and lower your chest toward the floor over about 2 seconds, elbows at 45° from your sides.',
    'When your chest nearly touches the floor, press firmly through your palms and breathe out as you rise.',
    'Lock out arms at the top and reset before the next rep.',
  ],
  archer_pushup: [
    'Set up in a wide push-up position — hands about 1.5× shoulder width apart, both arms fully extended.',
    'As you lower, shift your weight toward one side so that arm bends and the other stays nearly straight.',
    'Lower until the working arm\'s elbow is about 90° and the straight arm feels a stretch across the chest.',
    'Press back up through the bent arm to return to the top.',
    'Alternate which side does the work each rep, or complete all reps on one side then switch.',
  ],
  pike_pushup: [
    'Start in a downward-dog position: hands and feet on the floor, hips high, body forming an inverted V.',
    'Hands should be shoulder-width apart with fingers spread for a stable base.',
    'Breathe in and bend your elbows, lowering the crown of your head toward the floor between your hands.',
    'Keep your hips high throughout — this is a shoulder exercise, not a regular push-up.',
    'Press through your palms to return to the inverted V. That\'s one rep.',
  ],
  table_row: [
    'Lie under a sturdy table or desk. Grip the edge with both hands, palms facing you, arms fully extended.',
    'Your body should be straight from shoulders to heels — keep your core tight and hips up.',
    'Pull your chest up to the table edge by driving your elbows back and squeezing your shoulder blades together.',
    'Pause briefly at the top, then slowly lower yourself back down with control.',
    'If a table isn\'t available, anchor a resistance band at waist height, lean back, and row the same way.',
  ],
  table_row_advanced: [
    'Set up a regular table row but place your feet on a chair so your body is parallel to the floor.',
    'This shifts more weight into the pulling muscles — it\'s significantly harder than the basic version.',
    'Pull your chest to the table edge, driving elbows back and squeezing the shoulder blades hard.',
    'Hold the top position for a beat, then lower with a 2–3 second count.',
    'Keep your hips from sagging throughout — treat it like a horizontal pull-up.',
  ],
  plank_hold: [
    'Place forearms on the floor, elbows directly beneath your shoulders, hands flat or clasped.',
    'Step feet back so your body forms a straight line from shoulders to heels.',
    'Squeeze every muscle: abs, glutes, quads — this is the secret to a strong plank.',
    'Keep your lower back flat — if it arches or your hips drop, reset and reduce the hold time.',
    'Breathe steadily throughout. Don\'t hold your breath.',
  ],
  dead_bug: [
    'Lie flat on your back, arms pointing straight up toward the ceiling, knees bent at 90° and lifted so shins are parallel to the floor.',
    'Press your lower back firmly into the floor — maintain this throughout the entire movement.',
    'Slowly extend your right arm overhead and your left leg toward the floor at the same time, moving both together.',
    'Go as low as you can without your lower back lifting off the floor, then return to the start.',
    'Switch sides: left arm and right leg. That\'s one full rep. Move slowly — the exercise is meant to be controlled.',
  ],
  dead_bug_advanced: [
    'Same setup as the standard dead bug — back flat, arms up, knees at 90°.',
    'Hold a light weight (book, water bottle) in your hand to increase the challenge on the working arm.',
    'Extend the weighted arm overhead and the opposite leg at the same time.',
    'Add a 1–2 second pause at full extension before returning.',
    'The added weight makes it much harder to keep the lower back down — that\'s the point.',
  ],
  hollow_hold: [
    'Lie on your back and press your lower back firmly into the floor.',
    'Extend your arms overhead and legs straight out, lifting both slightly off the floor.',
    'Your body should form a slight "banana" curve — lower back stays rounded, not arched.',
    'Tuck your chin slightly and keep your ribs down (avoid flaring them toward the ceiling).',
    'If this is too hard, bend your knees or raise your feet higher to reduce the lever arm.',
  ],
  spanish_squat_iso: [
    'Tie a resistance band around a post, tree, or door frame at about waist height.',
    'Hold the band with both hands and walk back until there\'s tension, then lower into a squat.',
    'The band pulls you forward, allowing you to keep your shins vertical while sitting into the squat — this is the key difference from a regular squat.',
    'Your weight should be through your mid-foot/heels, torso upright, and thighs parallel or below.',
    'Hold the position. Focus on relaxed breathing — squeeze your quad muscles against the resistance.',
  ],
  spanish_squat_iso_light: [
    'Use the same setup as the standard Spanish squat — band around a fixed point.',
    'Only go to a shallow depth where you feel no pain or sharp discomfort. This might be just a slight bend.',
    'The goal is gentle loading, not a full squat. Find your pain-free range and work there.',
    'Hold the position, breathe, and come back up slowly. Stop immediately if pain increases.',
  ],
  glute_bridge: [
    'Lie on your back with knees bent, feet flat on the floor hip-width apart, arms relaxed by your sides.',
    'Tilt your pelvis slightly (flatten your lower back into the mat) before you lift.',
    'Drive your heels into the floor and squeeze your glutes hard to lift your hips until your body forms a straight line from shoulders to knees.',
    'Hold at the top for a beat — really squeeze the glutes.',
    'Lower back down with control, letting your hips just touch the floor before the next rep.',
  ],
  single_leg_glute_bridge: [
    'Set up the same as a glute bridge but extend one leg straight, keeping your thighs level.',
    'Drive through the heel of the working leg to lift your hips, keeping both sides of your pelvis level.',
    'The non-working leg is extended and lifted — don\'t let it drop or your hip rotate.',
    'Squeeze the glute at the top and hold for a beat before lowering.',
    'Complete all reps on one side before switching.',
  ],
  calf_raise: [
    'Stand on the edge of a step with your heels hanging off and just the balls of your feet on the surface.',
    'Hold a wall or railing lightly for balance — not to take weight.',
    'Lower your heels below the step level to get a full stretch at the bottom (this is important for rehab benefit).',
    'Push up onto your toes over about 3 seconds, pause at the top for 1 second.',
    'Lower back down slowly over 3 seconds. The slow descent is where the tendon adaptation happens.',
  ],
  calf_raise_single: [
    'Same as the double-leg calf raise but use only one foot on the edge of the step.',
    'Touch the free foot to your working ankle lightly for confidence, but don\'t push off it.',
    'Lower heel down for a full stretch, then slowly raise up over 3 seconds.',
    'This single-leg version is much more demanding on the Achilles and calf — use a wall for balance.',
    'If it\'s too difficult at first, use the other hand on a wall and gradually reduce reliance on it.',
  ],
  tibialis_raise: [
    'Stand with your back and heels against a wall, feet about 6 inches in front of you.',
    'Keeping your heels on the floor, lift your toes and forefoot as high as possible.',
    'Hold at the top for a moment, then lower back down with control.',
    'You should feel this along the shin (tibialis anterior muscle) — this is the target.',
    'This exercise directly addresses imbalances that contribute to shin splints and knee issues.',
  ],
  tibialis_raise_seated: [
    'Sit upright in a chair with feet flat on the floor.',
    'Keeping your heels on the floor, lift your toes and forefoot off the ground as high as you can.',
    'Lower back down under control. The seated version reduces overall load, making it suitable for flare-up days.',
    'You should still feel a burn along the front of the shin — if not, try lifting more forcefully.',
  ],
  split_squat_shallow: [
    'Stand with one foot about 2–3 feet in front of the other in a staggered stance.',
    'Keep your torso upright and your front shin as vertical as possible.',
    'Lower your back knee toward the floor — start with a small range (just 2–3 inches) and increase over sessions.',
    'Drive back up through the front heel to return to standing.',
    'Keep the movement controlled and avoid letting your front knee drift too far forward initially.',
  ],
  split_squat_deep: [
    'Same staggered stance as the shallow version, but increase the depth so your back knee approaches the floor.',
    'Focus on keeping the front shin vertical — most of the load should be through the front heel.',
    'Lower with control over 2 seconds, aiming to get within 1–2 inches of the floor with the back knee.',
    'Drive back up explosively through the front heel.',
    'If you have a wall nearby, lightly touch it for balance as you build confidence at depth.',
  ],
  bulgarian_split_squat: [
    'Stand about 2 feet in front of a bench or chair. Place your rear foot on top of it, laces down.',
    'Your front foot should be far enough forward that when you lower, your front shin stays near-vertical.',
    'Lower your back knee toward the floor, keeping your torso upright.',
    'The working leg is the front leg — most of your weight should be there, not on the elevated foot.',
    'Press through the front heel to return to the start. This is the hardest leg exercise in the program.',
  ],
  step_up: [
    'Stand in front of a sturdy box, step, or stair. The surface should be roughly knee height or below.',
    'Place your entire foot on the box — don\'t just use your toes.',
    'Push through the heel of the raised foot to step up. Avoid pushing off the trailing foot on the floor.',
    'Stand fully upright at the top, fully extending the hip and knee of the working leg.',
    'Step back down with control — lower the trailing leg slowly, don\'t just drop.',
  ],
  step_up_high: [
    'Same technique as the standard step-up but with a higher box — aim for a surface where your thigh is parallel to the floor when the foot is placed on it.',
    'The higher box demands much more quad and glute strength to initiate the push.',
    'Place the full foot on the box and drive through the heel to stand up.',
    'Stand fully at the top before stepping down.',
    'Control the descent completely — this eccentric phase builds the most strength.',
  ],
  bodyweight_squat: [
    'Stand with feet shoulder-width apart, toes pointed slightly outward.',
    'Push your hips back first (like sitting into a chair behind you), then bend your knees.',
    'Lower until your hip crease is at or below knee level — keep your chest up and your lower back neutral.',
    'Drive through the whole foot to stand back up, squeezing your glutes at the top.',
    'If your heels lift, stand wider or point toes out more.',
  ],
  squat_jump: [
    'Start in a shoulder-width squat stance.',
    'Lower into a squat, then explosively drive through your legs to jump off the floor.',
    'Land softly by bending your knees on contact — absorb the landing quietly.',
    'If jumping causes knee pain, substitute a deep slow squat with a 3-second pause at the bottom instead.',
    'Focus on landing mechanics (soft, controlled) as much as the jump itself.',
  ],
  mobility_hip_circle: [
    'Stand on one leg (hold a wall for balance) or lie on your back with one knee pulled toward your chest.',
    'Slowly draw large circles with your knee — forward, out, back, and in.',
    'Move through your comfortable range only. No forcing or bouncing.',
    'Reverse the direction after completing the prescribed reps.',
    'This is pure mobility work — the goal is gentle movement and blood flow, not loading.',
  ],
  seated_calf_raise: [
    'Sit upright in a chair with feet flat on the floor, knees bent at 90°.',
    'Place a weight on your thighs just above the knee if available (book, bag), or do it bodyweight.',
    'Raise your heels as high as you can, coming onto the balls of your feet.',
    'Lower back down with control — get a full stretch at the bottom.',
    'Much lower load than standing raises, making this suitable for flare-up days.',
  ],
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
    return (workout.flareUpExercises || phaseData.exercises).map(ex => ({
      ...ex,
      howTo: EXERCISE_HOW_TO[ex.id] || null,
    }));
  }

  return phaseData.exercises.map(ex => ({
    ...ex,
    howTo: EXERCISE_HOW_TO[ex.id] || null,
  }));
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
