const DEVICE_CONFIG_CONSTANTS = {
  // an array of objects representing the mode configs
  MUSIC_ONLY: 'Music Only',
  RUN: 'Run',
  SWIM: 'Swim',
  JUMP: 'Jump',
  SWIMMING_EVENT: 'Swimming Event',
  TIMED_RUN: 'Timed Run',

  // triggers
  TRIGGER_STEPS: 'Steps',
  TRIGGER_MIN: 'Min',
  TRIGGER_LAP: 'Lap',
  TRIGGER_ON_REST: 'When resting',

  // metrics
  STEP_COUNT: 'Step Count',
  CALORIES: 'Calories',
  CADENCE: 'Cadence',

  SWIMMING_SPEED: 'Swimming Speed',
  LAPTIME: 'Lap time',
  TOTAL_LAPS_SWUM: 'Total Laps Swum',
  LAP_COUNT: 'Lap Count',

  VERTICAL_HEIGHT: 'Vertical Height',
  HANGTIME: 'Hangtime',

  BUTTERFLY: 'Butterfly',
  BACKSTROKE: 'Backstroke',
  BREASTROKE: 'Breastroke',
  FREESTYLE: 'Freestyle',
  IM: 'Individual Medley',
}
const {
  MUSIC_ONLY,
  RUN,
  SWIM,
  JUMP,
  SWIMMING_EVENT,
  TIMED_RUN,
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
} = DEVICE_CONFIG_CONSTANTS

const DEFAULT_CONFIG = [
  {
    mode: MUSIC_ONLY,
    subtitle: 'aiowjdoiajwd',
    backgroundColor: `rgb(${Math.floor(Math.random() * 255)}, ${5}, ${132})`
  },
  {
    // The device mode. Using make sure to make the keyExtractor take the mode
    mode: RUN,
    subtitle: 'aiowjdoiajwd',
    // background color of the list item
    backgroundColor: `rgb(${Math.floor(Math.random() * 255)}, ${5}, ${132})`,
    // what metrics are reported. 
    metrics: [ STEP_COUNT, CALORIES, CADENCE ],
    // whether it's reported based on time interval or number of steps
    trigger: TRIGGER_MIN,
    // how frequently these metrics are reported
    frequency: 1
  },
  {
    mode: JUMP,
    subtitle: 'aiowjdoiajwd',
    backgroundColor: `rgb(${Math.floor(Math.random() * 255)}, ${5}, ${132})`,
    // this should always only be a one element array
    metrics: [ VERTICAL_HEIGHT ] 
  },
  {
    mode: SWIM,
    subtitle: 'aiowjdoiajwd',
    backgroundColor: `rgb(${Math.floor(Math.random() * 255)}, ${5}, ${132})`,
    metrics: [ LAP_COUNT, LAPTIME ],
  },
  {
    mode: SWIMMING_EVENT,
    subtitle: 'aiowjdoiajwd',
    backgroundColor: `rgb(${Math.floor(Math.random() * 255)}, ${5}, ${132})`,
    stroke: FREESTYLE,
    distance: 200,
    // splits are for every 50. Can have up to 8.
    // any splits after 8 are just repeated (8 and after is what it'll show)
    splits: [30.0, 30.0, 30.0, 30.0]
  },
  {
    mode: TIMED_RUN, // lol this should have a better name
    subtitle: 'aiowjdoiajwd',
    backgroundColor: `rgb(${Math.floor(Math.random() * 255)}, ${5}, ${132})`,
  }
]

// default mode objects
const MODES = {}
MODES[MUSIC_ONLY] = DEFAULT_CONFIG[0]
MODES[RUN] = DEFAULT_CONFIG[1]
MODES[JUMP] = DEFAULT_CONFIG[2]
MODES[SWIM] = DEFAULT_CONFIG[3]
MODES[SWIMMING_EVENT] = DEFAULT_CONFIG[4]
MODES[TIMED_RUN] = DEFAULT_CONFIG[5]

module.exports = { DEVICE_CONFIG_CONSTANTS, DEFAULT_CONFIG, MODES }