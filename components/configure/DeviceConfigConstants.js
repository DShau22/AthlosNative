import COLOR_THEMES from '../ColorThemes';
const { RUN_THEME, SWIM_THEME, JUMP_THEME } = COLOR_THEMES;
const DEVICE_CONFIG_CONSTANTS = {
  POOL_LENGTH_CHOICES: {
    NCAA: '25 yd',
    BRITISH: '25 m',
    OLYMPIC: '50 m',
    THIRD_YD: '33.3 yd',
    THIRD_M: '33.3 m',
    HOME: '15 yd' 
  },
  // an array of objects representing the mode configs

  MODE_CONFIG: 'Mode Configurations',

  // async storage keys
  CONFIG_KEY: 'Config Key',

  // mode titles
  MUSIC_ONLY: 'Music Only',
  RUN: 'Run',
  SWIM: 'Swim',
  JUMP: 'Jump',
  SWIMMING_EVENT: 'Swimming Event',
  INTERVAL: 'Interval',
  TIMER: 'Timer',

  // SUBTITLES
  MUSIC_ONLY_SUBTITLE: 'Music AOIJFOIAJWEIF',
  RUN_SUBTITLE: 'RUN AOIJFOIAJWEIF',
  SWIM_SUBTITLE: 'SWIM AOIJFOIAJWEIF',
  JUMP_SUBTITLE: 'JUMP AOIJFOIAJWEIF',
  SWIMMING_EVENT_SUBTITLE: 'Swimming AOIJFOIAJWEIF',
  TIMED_RUN_SUBTITLE: 'Timed AOIJFOIAJWEIFn',
  INTERVAL_SUBTITLE: 'Interval training',
  
  // enums based on what mode the user is editing
  EDIT_RUN: 'Edit Run',
  EDIT_SWIM: 'Edit Swim',
  EDIT_JUMP: 'Edit Jump',
  EDIT_SWIMMING_EVENT: 'Edit Swimming Event',
  EDIT_TIMED_RUN: 'Edit Timed Run',

  // triggers
  TRIGGER_STEPS: 'Steps',
  TRIGGER_MIN: 'Min',
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
  IM: 'Individual Medley',

  YARDS: 'yd',
  METERS: 'm'
}
const {
  POOL_LENGTH_CHOICES,
  MUSIC_ONLY,
  RUN,
  SWIM,
  JUMP,
  SWIMMING_EVENT,
  TIMER,
  INTERVAL,
  INTERVAL_SUBTITLE,
  MUSIC_ONLY_SUBTITLE,
  RUN_SUBTITLE,
  SWIM_SUBTITLE,
  JUMP_SUBTITLE,
  SWIMMING_EVENT_SUBTITLE,
  TIMED_RUN_SUBTITLE,
  TRIGGER_STEPS,
  TRIGGER_MIN,
  TRIGGER_LAP,
  TRIGGER_ON_REST,
  STEP_COUNT,
  CALORIES,
  CADENCE,
  SWIMMING_SPEED,
  LAPTIME,
  TOTAL_LAPS_SWUM,
  LAP_COUNT,
  VERTICAL_HEIGHT,
  HANGTIME,
  BUTTERFLY,
  BACKSTROKE,
  BREASTROKE,
  FREESTYLE,
  IM,
  YARDS,
  METERS
} = DEVICE_CONFIG_CONSTANTS;

const getDefaultConfig = () => {
  return [
    getDefaultMusicOnlyMode(),
    getDefaultRunMode(),
    getDefaultJumpMode(),
    getDefaultSwimMode(),
    getDefaultRaceMode(),
    getDefaultTimerMode(),
    getDefaultIntervalMode(),
  ];
};

const getDefaultMusicOnlyMode = () => {
  return {
    mode: MUSIC_ONLY,
    subtitle: MUSIC_ONLY_SUBTITLE,
  };
};

const getDefaultRunMode = () => {
  return {
    // The device mode. Using make sure to make the keyExtractor take the mode
    mode: RUN,
    subtitle: RUN_SUBTITLE,
    // background color of the list item
    // what metrics are reported. 
    metrics: [ STEP_COUNT, CALORIES, CADENCE ],
    // whether it's reported based on time interval or number of steps
    trigger: TRIGGER_MIN,
    // how frequently these metrics are reported
    numUntilTrigger: 1
  };
};

const getDefaultSwimMode = () => {
  return {
    mode: SWIM,
    subtitle: SWIM_SUBTITLE,
    trigger: TRIGGER_LAP,
    poolLength: POOL_LENGTH_CHOICES.NCAA,
    // number of laps until the report is given. Number doesn't matter if 
    // trigger is set to TRIGGER_ON_FINISH
    numUntilTrigger: 1,
    metrics: [ LAP_COUNT, LAPTIME ],
  }
};

const getDefaultJumpMode = () => {
  return {
    mode: JUMP,
    subtitle: JUMP_SUBTITLE,
    // this should always only be a one element array
    metric: VERTICAL_HEIGHT 
  };
};

const getDefaultRaceMode = () => {
  return {
    mode: SWIMMING_EVENT,
    subtitle: SWIMMING_EVENT_SUBTITLE,
    stroke: FREESTYLE,
    distance: 200,
    poolLength: POOL_LENGTH_CHOICES.NCAA,
    // splits are for every 50. Can have up to 8.
    // any splits after 8 are just repeated (8 and after is what it'll show)
    splits: ['40', '45', '45', '45']
  };
};

const getDefaultTimerMode = () => {
  return {
    mode: TIMER,
    splits: [600, 600, 600, 600], // splits in tenths
    repeats: false,
  }
}

const getDefaultIntervalMode = () => {
  return {
    mode: INTERVAL,
    subtitle: INTERVAL_SUBTITLE,
    intervals: [
      {time: 30, rest: false},
      {time: 10, rest: true},
      {time: 30, rest: false},
      {time: 10, rest: true},
    ],
    numRounds: 1 // if 0, then repeat the last split over and over again
  };
};

/**
 * Takes in an enum for mode. Returns the default object for that mode when we are adding new modes.
 * @param {String} mode 
 */
const getDefaultModeObject = (mode) => {
  switch(mode) {
    case MUSIC_ONLY:
      return getDefaultMusicOnlyMode();
    case RUN:
      return getDefaultRunMode();
    case SWIM:
      return getDefaultSwimMode();
    case JUMP:
      return getDefaultJumpMode();
    case SWIMMING_EVENT:
      return getDefaultRaceMode();
    case INTERVAL:
      return getDefaultIntervalMode();
    case TIMER:
      return getDefaultTimerMode();
    default:
      console.log(`mode ${mode} is not valid`);
      return null;
  }
};

module.exports = {
  DEVICE_CONFIG_CONSTANTS,
  getDefaultConfig,
  getDefaultModeObject
}