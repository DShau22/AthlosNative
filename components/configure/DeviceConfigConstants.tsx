const DEVICE_CONFIG_CONSTANTS = {
  POOL_LENGTH_CHOICES: {
    NCAA: '25 yd',
    BRITISH: '25 m',
    OLYMPIC: '50 m',
    THIRD_YD: '33 yd',
    THIRD_M: '33 m',
    HOME: '15 yd',
    TWENTY_YARD: '20 yd',
    SHORT: 'Short Length',
  },
  // an array of objects representing the mode configs

  MODE_CONFIG: 'Mode Configurations',

  // mode titles
  MUSIC_ONLY: 'Music Only',
  RUN: 'Run',
  SWIM: 'Swim',
  JUMP: 'Vertical',
  SWIMMING_RACE: 'Swim Race',
  INTERVAL: 'Interval',
  TIMER: 'Timer',
  SWIM_WORKOUT: 'Swim Workout',

  // type of repetition for timers
  REPEAT_LAST: 'Repeat last period',
  CYCLES: 'Cycles',
  ENDS: 'Ends after last period',
  
  // enums based on what mode the user is editing
  EDIT_RUN: 'Edit Run',
  EDIT_SWIM: 'Edit Swim',
  EDIT_JUMP: 'Edit Jump',
  EDIT_SWIMMING_RACE: 'Edit Swimming Race',
  EDIT_TIMED_RUN: 'Edit Timed Run',

  // triggers
  TRIGGER_STEPS: 'steps',
  TRIGGER_MIN: 'minutes',
  TRIGGER_LAP: 'Lap',
  TRIGGER_ON_FINISH: 'On Finish',

  // metrics
  STEP_COUNT: 'Step Count',
  CALORIES: 'Calories',
  CADENCE: 'Cadence',

  SWIMMING_SPEED: 'Swimming Speed',
  LAPTIME: 'Lap time',
  TOTAL_LAP_COUNT: 'Total Lap Count',
  LAP_COUNT: 'Lap Count',
  STROKE: 'Stroke',

  VERTICAL_HEIGHT: 'Vertical Height',
  HANGTIME: 'Hangtime',
  BASKETBALL: 'basketball',

  BUTTERFLY: 'Butterfly',
  BACKSTROKE: 'Backstroke',
  BREASTROKE: 'Breastroke',
  FREESTYLE: 'Freestyle',
  IM: 'IM',
  FLUTTER_KICK: 'Flutter kick',
  DOLPHIN_KICK: 'Dolphin kick',
  ROCKET_KICK: 'Rocket kick',
  BREASTSTROKE_KICK: 'Beaststroke kick',
  PULLING: 'Pulling',
  SPRINT: 'Sprint',
  NO_BREATH: 'No breath',
  SCULLING: 'Sculling',
  WARMUP: 'Warm up',
  WARMDOWN: 'Warm down',
  ALL_OUT: "All out",

  YARDS: 'yd',
  METERS: 'm',

  WORK: 'Work',
  REST: 'Rest',

  RANDOM_MUSIC_SEQUENCE: 'Random',
  ORDER_BY_DATE: 'Order by date',
}
const {
  RANDOM_MUSIC_SEQUENCE,
  ORDER_BY_DATE,
  FLUTTER_KICK,
  DOLPHIN_KICK,
  ROCKET_KICK,
  BREASTSTROKE_KICK,
  PULLING,
  SPRINT,
  ALL_OUT,
  NO_BREATH,
  SCULLING,
  WARMUP,
  WARMDOWN,
  POOL_LENGTH_CHOICES,
  MUSIC_ONLY,
  RUN,
  SWIM,
  JUMP,
  SWIMMING_RACE,
  TIMER,
  INTERVAL,
  SWIM_WORKOUT,
  TRIGGER_STEPS,
  TRIGGER_MIN,
  TRIGGER_LAP,
  STEP_COUNT,
  CALORIES,
  CADENCE,
  SWIMMING_SPEED,
  LAPTIME,
  LAP_COUNT,
  VERTICAL_HEIGHT,
  HANGTIME,
  BUTTERFLY,
  BACKSTROKE,
  BREASTROKE,
  FREESTYLE,
  IM,
  YARDS,
  METERS,
  ENDS,
  REPEAT_LAST,
  CYCLES,
  WORK,
  REST,
} = DEVICE_CONFIG_CONSTANTS;

const MUSCLE_GROUP_LIST = [
  "Abductors",
  "Abs",
  "Adductors",
  "Arms",
  "Back",
  "Balance",
  "Biceps",
  "Calves",
  "Cardio",
  "Chest",
  "Cool Down",
  "Core",
  "Deltoids",
  "Forearms",
  "Glutes",
  "Groin",
  "Hamstrings",
  "Hiking",
  "Hip Flexors",
  "Hips",
  "Jog",
  "Lats",
  "Legs",
  "Lower Back",
  "Neck",
  "Obliques",
  "Quads",
  "Recovery",
  REST,
  "Rotator Cuff",
  "Run",
  "Scapulas",
  "Shoulders",
  "Spring",
  "Stretch",
  "Strolling",
  "Traps",
  "Triceps",
  "Upper Back",
  "Warm Up",
  "Weights",
  WORK,
];

const DISTANCES_LIST = [
  25,
  50,
  75,
  100,
  // 150,
  200,
  300,
  400,
  500,
];

const STROKES_LIST = [
  BUTTERFLY,
  BACKSTROKE,
  BREASTROKE,
  FREESTYLE,
  IM,
  FLUTTER_KICK,
  DOLPHIN_KICK,
  BREASTSTROKE_KICK,
  ROCKET_KICK,
  PULLING,
  SCULLING,
  WARMUP,
  WARMDOWN,
  REST,
  NO_BREATH,
  SPRINT,
];

const getDefaultConfig = (): Array<Mode> => {
  return [
    getDefaultMusicOnlyMode(),
    getDefaultJumpMode(),
    getDefaultRunMode(),
    getDefaultSwimMode(),
    getDefaultIntervalMode(),
    getDefaultSwimWorkoutMode(),
    // getDefaultRaceMode(),
    // getDefaultTimerMode(),
  ];
};

const getDefaultMusicOnlyMode = (): MusicInterface => {
  return {
    mode: MUSIC_ONLY,
    disableEncouragements: false,
    musicPlaySequence: RANDOM_MUSIC_SEQUENCE,
  };
};

const getDefaultRunMode = (): RunInterface => {
  return {
    // The device mode. Using make sure to make the keyExtractor take the mode
    mode: RUN,
    walking: false,
    disableEncouragements: false,
    // background color of the list item
    // what metrics are reported. 
    metrics: [ STEP_COUNT, CALORIES, CADENCE ],
    // whether it's reported based on time interval or number of steps
    trigger: TRIGGER_MIN,
    // how frequently these metrics are reported
    numUntilTrigger: 1,
    reportCalories: true,
  };
};

const getDefaultSwimMode = (): SwimInterface => {
  return {
    mode: SWIM,
    trigger: TRIGGER_LAP,
    poolLength: POOL_LENGTH_CHOICES.NCAA,
    disableEncouragements: false,
    // number of laps until the report is given. Number doesn't matter if 
    // trigger is set to TRIGGER_ON_FINISH
    numUntilTrigger: 1,
    metrics: [ LAP_COUNT, LAPTIME, CALORIES ],
    resetLapCountAfterFinish: true,
  }
};

const getDefaultJumpMode = (): VerticalInterface => {
  return {
    mode: JUMP,
    // this should always only be a one element array
    metric: VERTICAL_HEIGHT,
    disableEncouragements: false,
  };
};

const getDefaultRaceMode = (): RaceInterface => {
  return {
    mode: SWIMMING_RACE,
    stroke: FREESTYLE,
    distance: 200,
    poolLength: POOL_LENGTH_CHOICES.NCAA,
    disableEncouragements: false,
    // splits are for every 50. Can have up to 8.
    // any splits after 8 are just repeated (8 and after is what it'll show)
    splits: [40, 45, 45, 45]
  };
};

const getDefaultTimerMode = (): TimerInterface => {
  return {
    mode: TIMER,
    splits: [600, 600, 600, 600], // splits in tenths
    repetition: ENDS,
    numRepetitions: 4,
    disableEncouragements: false,
  }
}

const getDefaultIntervalMode = (): IntervalInterface => {
  return {
    mode: INTERVAL,
    intervals: [
      {muscleGroup: 'Arms', time: 30},
      {muscleGroup: 'Rest', time: 10},
      {muscleGroup: 'Legs', time: 50},
      {muscleGroup: 'Rest', time: 15},
      {muscleGroup: 'Abs', time: 60},
      {muscleGroup: 'Rest', time: 20},
    ],
    disableEncouragements: false,
    numRounds: 2 // if 0, then repeat the last split over and over again
  };
};

export interface Mode {
  mode: string,
  disableEncouragements: boolean,
}

export interface MusicInterface extends Mode {
  musicPlaySequence: string,
}

export interface SwimWorkoutInterface extends Mode {
  sets: Array<SwimSet>,
  numRounds: number,
};

export interface SwimSet {
  reps: number,
  distance: number,
  stroke: string,
  timeInSeconds: number,
}

export interface SwimInterface extends Mode {
  trigger: string,
  poolLength: string,
  // number of laps until the report is given. Number doesn't matter if 
  // trigger is set to TRIGGER_ON_FINISH
  numUntilTrigger: number,
  metrics: Array<string>,
  resetLapCountAfterFinish: boolean,
};

export interface RunInterface extends Mode {
    // The device mode. Using make sure to make the keyExtractor take the mode
    walking: boolean,
    // background color of the list item
    // what metrics are reported. 
    metrics: Array<string>,
    // whether it's reported based on time interval or number of steps
    trigger: string,
    // how frequently these metrics are reported
    numUntilTrigger: number,
    reportCalories: boolean,
};

export interface VerticalInterface extends Mode {
  // this should always only be a one element array
  metric: string,
};

export interface RaceInterface extends Mode {
  stroke: string,
  distance: number,
  poolLength: string,
  // splits are for every 50. Can have up to 8.
  splits: Array<number>
};
// any splits after 8 are just repeated (8 and after is what it'll show)

export interface IntervalInterface extends Mode {
  intervals: Array<Interval>,
  numRounds: number // if 0, then repeat the last split over and over again
};

export interface Interval {
  muscleGroup: string,
  time: number,
}

export interface TimerInterface {
  mode: string,
  splits: Array<number>, // splits in tenths
  repetition: string,
  numRepetitions: number,
  disableEncouragements: boolean,
};

const getDefaultSwimWorkoutMode = (): SwimWorkoutInterface => {
  return {
    mode: SWIM_WORKOUT,
    sets: [
      {
        reps: 4,
        distance: 100,
        stroke: IM,
        timeInSeconds: 90,
      },
      {
        reps: 8,
        distance: 50,
        stroke: FREESTYLE,
        timeInSeconds: 45,
      },
    ],
    disableEncouragements: false,
    numRounds: 2 // if 0, then repeat the last split over and over again
  };
}

/**
 * Takes in an enum for mode. Returns the default object for that mode when we are adding new modes.
 * @param {String} mode 
 */
const getDefaultModeObject = (mode: string) => {
  switch(mode) {
    case MUSIC_ONLY:
      return getDefaultMusicOnlyMode();
    case RUN:
      return getDefaultRunMode();
    case SWIM:
      return getDefaultSwimMode();
    case JUMP:
      return getDefaultJumpMode();
    case SWIMMING_RACE:
      return getDefaultRaceMode();
    case INTERVAL:
      return getDefaultIntervalMode();
    case TIMER:
      return getDefaultTimerMode();
    case SWIM_WORKOUT:
      return getDefaultSwimWorkoutMode();
    default:
      console.log(`mode ${mode} is not valid`);
      return null;
  }
};

export {
  DEVICE_CONFIG_CONSTANTS,
  MUSCLE_GROUP_LIST,
  STROKES_LIST,
  DISTANCES_LIST,
  getDefaultConfig,
  getDefaultModeObject
}