import { DEVICE_CONFIG_CONSTANTS, STROKES_LIST } from "../../configure/DeviceConfigConstants";
import { Lap, SwimWorkoutSchema } from "../data/UserActivities";
import { PoolLengthsEnum, SwimStrokesEnum } from "../FitnessTypes";
import { calcSwimWorkouts, calcLapSwimWorkout, calcSwimGroups, SwimSet, SwimType, round33PoolLength, SwimmingWorkout } from "./utils";

const sumLapTimes = (a: Array<Lap>) => {
  return a.reduce((acc, next) => acc + next.lapTime, 0);
}

const createRepeat = (strokes: Array<SwimStrokesEnum>, times: Array<Lap>, repeats: number, poolLength: number, swimClass: Array<string>): SwimSet => {
  const time = sumLapTimes(times);
  const result: SwimSet = {
    swims: [],
    averageTime: time,
    numSwims: repeats,
    class: swimClass,
    distance: round33PoolLength(strokes.length * poolLength),
  };
  for (let i = 0; i < repeats; i++) {
    result.swims?.push({
      distance: round33PoolLength(strokes.length * poolLength),
      strokes: strokes,
      class: swimClass,
      time: time,
    })
  }
  return result;
}

const IM_200_STROKES = [
  SwimStrokesEnum.FLY,
  SwimStrokesEnum.FLY,
  SwimStrokesEnum.BACK,
  SwimStrokesEnum.BACK,
  SwimStrokesEnum.BREAST,
  SwimStrokesEnum.BREAST,
  SwimStrokesEnum.FREE,
  SwimStrokesEnum.FREE,
];

const IM_200_TIMES = [
  { lapTime: 15, finished: false},
  { lapTime: 16, finished: false},
  { lapTime: 20, finished: false},
  { lapTime: 21, finished: false},
  { lapTime: 25, finished: false},
  { lapTime: 26, finished: false},
  { lapTime: 18, finished: false},
  { lapTime: 19, finished: true},
];

// test IM creation
const MOCK_LAPTIMES_IMS = [
  ...IM_200_TIMES,
  ...IM_200_TIMES,
  ...IM_200_TIMES,
];

const MOCK_STROKES_IMS = [
  ...IM_200_STROKES,
  ...IM_200_STROKES,
  ...IM_200_STROKES,
];

const EXPECTED_IMS: Array<SwimSet> = [
  createRepeat(IM_200_STROKES, IM_200_TIMES, 3, 25, ["IM"])
];

const EXPECTED_OLYMPIC_IM: Array<SwimSet> = [
  createRepeat(IM_200_STROKES, IM_200_TIMES, 3, 50, ["IM"])
];

// test empty case
const EXPECTED_EMPTY: Array<SwimSet> = [];

// test a mix of swims
const IM_100_STROKES = [
  SwimStrokesEnum.FLY,
  SwimStrokesEnum.BACK,
  SwimStrokesEnum.BREAST,
  SwimStrokesEnum.FREE,
];
const IM_100_TIMES = [
  { lapTime: 15, finished: false},
  { lapTime: 20, finished: false},
  { lapTime: 25, finished: false},
  { lapTime: 18, finished: true},
];
const FLY_50_STROKES = [
  SwimStrokesEnum.FLY,
  SwimStrokesEnum.FLY,
];
const FLY_50_TIMES = [
  { lapTime: 15, finished: false},
  { lapTime: 18, finished: true},
];
const FREE_200_STROKES = [
  SwimStrokesEnum.FREE,
  SwimStrokesEnum.FREE,
  SwimStrokesEnum.FREE,
  SwimStrokesEnum.FREE,
  SwimStrokesEnum.FREE,
  SwimStrokesEnum.FREE,
  SwimStrokesEnum.FREE,
  SwimStrokesEnum.FREE,
];
const FREE_200_TIMES = [
  { lapTime: 20, finished: false},
  { lapTime: 20, finished: false},
  { lapTime: 20, finished: false},
  { lapTime: 20, finished: false},
  { lapTime: 20, finished: false},
  { lapTime: 20, finished: false},
  { lapTime: 20, finished: false},
  { lapTime: 20, finished: true},
];
const BACK_25_STROKES = [SwimStrokesEnum.BACK];
const BACK_25_TIMES = [{ lapTime: 18, finished: true},];
const BACK_50_STROKES = [SwimStrokesEnum.BACK, SwimStrokesEnum.BACK];
const BACK_50_TIMES = [{ lapTime: 18, finished: false},{ lapTime: 19, finished: true}];
const MIXED_100_STROKES_1 = [
  SwimStrokesEnum.BACK,
  SwimStrokesEnum.BREAST,
  SwimStrokesEnum.FLY,
  SwimStrokesEnum.FREE,
];
const MIXED_100_TIMES_1 = [
  { lapTime: 20, finished: false},
  { lapTime: 25, finished: false},
  { lapTime: 15, finished: false},
  { lapTime: 18, finished: true},
];
const MIXED_100_STROKES_2 = [
  SwimStrokesEnum.BACK,
  SwimStrokesEnum.BACK,
  SwimStrokesEnum.FREE,
  SwimStrokesEnum.FLY,
];
const MIXED_100_TIMES_2 = [
  { lapTime: 25, finished: false},
  { lapTime: 20, finished: false},
  { lapTime: 18, finished: false},
  { lapTime: 15, finished: true},
];
const BREAST_25_STROKES = [SwimStrokesEnum.BREAST,];
const BREAST_25_TIMES = [{ lapTime: 25, finished: true},];
// 2 x 100 im, 1 50 fly, 4 x 200 free, 1 x 25 back, 1 x 50 back, 1 x 100 mixed, 1 x 100 mixed (different), 4 x 25 breast, 
const MOCK_LAPTIMES_MIXED = [
  ...IM_100_TIMES,...IM_100_TIMES,
  ...FLY_50_TIMES,
  ...FREE_200_TIMES,...FREE_200_TIMES,...FREE_200_TIMES,...FREE_200_TIMES,
  ...BACK_25_TIMES,
  ...BACK_50_TIMES,
  ...MIXED_100_TIMES_1,
  ...MIXED_100_TIMES_2,
  ...BREAST_25_TIMES,...BREAST_25_TIMES,...BREAST_25_TIMES,...BREAST_25_TIMES,
];
const MOCK_STROKES_MIXED = [
  ...IM_100_STROKES, ...IM_100_STROKES,
  ...FLY_50_STROKES,
  ...FREE_200_STROKES,...FREE_200_STROKES,...FREE_200_STROKES,...FREE_200_STROKES,
  ...BACK_25_STROKES,
  ...BACK_50_STROKES,
  ...MIXED_100_STROKES_1,
  ...MIXED_100_STROKES_2,
  ...BREAST_25_STROKES,...BREAST_25_STROKES,...BREAST_25_STROKES,...BREAST_25_STROKES,
];
// 2 x 100 im, 1 50 fly, 4 x 200 free, 1 x 25 back, 1 x 50 back, 1 x 100 mixed, 1 x 100 mixed (different), 4 x 25 breast, 
const EXPECTED_MIXED = [
  createRepeat(IM_100_STROKES, IM_100_TIMES, 2, 25, ["IM"]),
  createRepeat(FLY_50_STROKES, FLY_50_TIMES, 1, 25, ['Fly']),
  createRepeat(FREE_200_STROKES, FREE_200_TIMES, 4, 25, ["Free"]),
  createRepeat(BACK_25_STROKES, BACK_25_TIMES, 1, 25, ["Back"]),
  createRepeat(BACK_50_STROKES, BACK_50_TIMES, 1, 25, ["Back"]),
  createRepeat(MIXED_100_STROKES_1, MIXED_100_TIMES_1, 1, 25, ["Back", "Breast", "Fly", "Free"]),
  createRepeat(MIXED_100_STROKES_2, MIXED_100_TIMES_2, 1, 25, ["Back", "Free", "Fly"]),
  createRepeat(BREAST_25_STROKES, BREAST_25_TIMES, 4, 25, ["Breast"]),
];

// test alternative mixed classes
const MOCK_MIXED_ALT_STROKES = [
  SwimStrokesEnum.BACK,
  SwimStrokesEnum.BREAST,
  SwimStrokesEnum.BACK,
  SwimStrokesEnum.FREE,
  SwimStrokesEnum.BACK,
  SwimStrokesEnum.FLY,
]
const MOCK_MIXED_ALT_LAPTIME = [
  { lapTime: 15, finished: false},
  { lapTime: 15, finished: false},
  { lapTime: 15, finished: false},
  { lapTime: 15, finished: false},
  { lapTime: 15, finished: false},
  { lapTime: 15, finished: true},
];
const EXPECTED_MIXED_ALT = [
  createRepeat(MOCK_MIXED_ALT_STROKES, MOCK_MIXED_ALT_LAPTIME, 1, 25, ['Back', 'Breast', 'Free', 'Fly'])
];

// test adding unknowns here and there
const UNKNOWN_STROKES_1 = [
  SwimStrokesEnum.HEAD_UP,
  SwimStrokesEnum.HEAD_UP,
  SwimStrokesEnum.FREE,
  SwimStrokesEnum.FREE,
  SwimStrokesEnum.FREE,
]
const UNKNOWN_STROKES_2 = [
  SwimStrokesEnum.FREE,
  SwimStrokesEnum.HEAD_UP,
  SwimStrokesEnum.FREE,
  SwimStrokesEnum.HEAD_UP,
  SwimStrokesEnum.FREE,
];
const UNKNOWN_TIMES_1 = [
  { lapTime: 25, finished: false},
  { lapTime: 26, finished: false},
  { lapTime: 20, finished: false},
  { lapTime: 19, finished: false},
  { lapTime: 20, finished: true},
];
const UNKNOWN_TIMES_2 = [
  { lapTime: 18, finished: false},
  { lapTime: 25, finished: false},
  { lapTime: 24, finished: false},
  { lapTime: 21, finished: false},
  { lapTime: 15, finished: true},
];
const MOCK_UNKNOWNS_STROKES = [...UNKNOWN_STROKES_1, ...UNKNOWN_STROKES_2];
const MOCK_UNKNOWNS_TIMES = [...UNKNOWN_TIMES_1,...UNKNOWN_TIMES_2];

const EXPECTED_UNKNOWN = [
  createRepeat(UNKNOWN_STROKES_1, UNKNOWN_TIMES_1, 1, 33, ['Unknown', 'Free']),
  createRepeat(UNKNOWN_STROKES_2, UNKNOWN_TIMES_2, 1, 33, ['Free', 'Unknown']),
];

describe('Lap swimming workouts are constructed correctly', () => {
  it('calculates repeated IMs correctly', () => {
    let swims = calcSwimGroups(MOCK_LAPTIMES_IMS, MOCK_STROKES_IMS, PoolLengthsEnum.NCAA);
    let actual = calcLapSwimWorkout(swims);
    expect(actual).toStrictEqual(EXPECTED_IMS);
  });
  it('correctly handles 50 m pools too', () => {
    let swims = calcSwimGroups(MOCK_LAPTIMES_IMS, MOCK_STROKES_IMS, PoolLengthsEnum.OLYMPIC);
    let actual = calcLapSwimWorkout(swims);
    expect(actual).toStrictEqual(EXPECTED_OLYMPIC_IM);
  });
  it("doesn't break when empty arrays are passed in", () => {
    let swims = calcSwimGroups([], [], PoolLengthsEnum.NCAA);
    let actual = calcLapSwimWorkout(swims);
    expect(actual).toStrictEqual(EXPECTED_EMPTY);
  });
  it("handles back to back strokes, mixed groups, all strokes", () => {
    let swims = calcSwimGroups(MOCK_LAPTIMES_MIXED, MOCK_STROKES_MIXED, PoolLengthsEnum.NCAA);
    let actual = calcLapSwimWorkout(swims);
    expect(actual).toStrictEqual(EXPECTED_MIXED);
  });
  it("handles alternating mixed classes", () => {
    let swims = calcSwimGroups(MOCK_MIXED_ALT_LAPTIME, MOCK_MIXED_ALT_STROKES, PoolLengthsEnum.NCAA);
    let actual = calcLapSwimWorkout(swims);
    expect(actual).toStrictEqual(EXPECTED_MIXED_ALT);
  });
  it("handles unknowns correctly", () => {
    let swims = calcSwimGroups(MOCK_UNKNOWNS_TIMES, MOCK_UNKNOWNS_STROKES, PoolLengthsEnum.THIRD_M);
    let actual = calcLapSwimWorkout(swims);
    expect(actual).toStrictEqual(EXPECTED_UNKNOWN);
  });
});

const createRepeatSwimSet = (reps: number, distance: number, event: string, timeIntervalInSeconds: number, numSets: number) => {
  let res = [];
  let setObj = { reps, distance, event, timeIntervalInSeconds, }
  for (let i = 0; i < numSets; i++) {
    res.push(setObj);
  }
  return res;
}

// 2 rounds of 4 x 200s IM, 4 x 100s IM, 2 50s fly, 2 25s back, 1 25 breast
// next workout: 1 round of 1 50 of each stroke
const WORKOUT_2_IM_TIME = 180;
const WORKOUT_1_IM_TIME = 90;
const WORKOUT_50_FLY_TIME = 45;
const WORKOUT_25_BACK_TIME = 35;
const WORKOUT_50_BACK_TIME = 45;
const WORKOUT_25_BREAST_TIME = 40;
const WORKOUT_50_BREAST_TIME = 55;
const WORKOUT_50_FREE_TIME = 35;
const MOCK_SWIM_WORKOUTS: Array<SwimWorkoutSchema> = [
  {
    sets: [
      ...createRepeatSwimSet(4, 200, DEVICE_CONFIG_CONSTANTS.IM, WORKOUT_2_IM_TIME, 4),
      ...createRepeatSwimSet(4, 100, DEVICE_CONFIG_CONSTANTS.IM, WORKOUT_1_IM_TIME, 4),
      ...createRepeatSwimSet(2, 50, DEVICE_CONFIG_CONSTANTS.BUTTERFLY, WORKOUT_50_FLY_TIME, 2),
      ...createRepeatSwimSet(2, 25, DEVICE_CONFIG_CONSTANTS.BACKSTROKE, WORKOUT_25_BACK_TIME, 2),
      ...createRepeatSwimSet(1, 25, DEVICE_CONFIG_CONSTANTS.BREASTROKE, WORKOUT_25_BREAST_TIME, 1),

      ...createRepeatSwimSet(4, 200, DEVICE_CONFIG_CONSTANTS.IM, WORKOUT_2_IM_TIME, 4),
      ...createRepeatSwimSet(4, 100, DEVICE_CONFIG_CONSTANTS.IM, WORKOUT_1_IM_TIME, 4),
      ...createRepeatSwimSet(2, 50, DEVICE_CONFIG_CONSTANTS.BUTTERFLY, WORKOUT_50_FLY_TIME, 2),
      ...createRepeatSwimSet(2, 25, DEVICE_CONFIG_CONSTANTS.BACKSTROKE, WORKOUT_25_BACK_TIME, 2),
      ...createRepeatSwimSet(1, 25, DEVICE_CONFIG_CONSTANTS.BREASTROKE, WORKOUT_25_BREAST_TIME, 1),
    ],
    totalNumRoundsIntended: 2,
    totalNumSwimsIntended: 2 * (4 + 4 + 2 + 1 + 2)
  },
  {
    sets: [
      ...createRepeatSwimSet(1, 50, DEVICE_CONFIG_CONSTANTS.BUTTERFLY, WORKOUT_50_FLY_TIME, 1),
      ...createRepeatSwimSet(1, 50, DEVICE_CONFIG_CONSTANTS.BACKSTROKE, WORKOUT_50_BACK_TIME, 1),
      ...createRepeatSwimSet(1, 50, DEVICE_CONFIG_CONSTANTS.BREASTROKE, WORKOUT_50_BREAST_TIME, 1),
      ...createRepeatSwimSet(1, 50, DEVICE_CONFIG_CONSTANTS.FREESTYLE, WORKOUT_50_FREE_TIME, 1),
    ],
    totalNumRoundsIntended: 1,
    totalNumSwimsIntended: 4
  }
];

// 2 rounds of 4 x 200s IM, 4 x 100s IM, 2 50s fly, 2 25s back, 1 25 breast
// next workout: 1 round of 1 50 of each stroke
const EXPECTED_SWIM_WORKOUTS: Array<SwimmingWorkout> = [
  {
    numRoundsIntended: 2,
    numRoundsDone: 2,
    numSwimsIntended: 2 * (4 + 4 + 2 + 1 + 2),
    numSwimsDone: 2 * (4 + 4 + 2 + 1 + 2),
    sets: [
      {
        numSwims: 4,
        numIntendedSwims: 4,
        distance: 200,
        class: [DEVICE_CONFIG_CONSTANTS.IM],
        averageTime: WORKOUT_2_IM_TIME,
      },
      {
        numSwims: 4,
        numIntendedSwims: 4,
        distance: 100,
        class: [DEVICE_CONFIG_CONSTANTS.IM],
        averageTime: WORKOUT_1_IM_TIME,
      },
      {
        numSwims: 2,
        numIntendedSwims: 2,
        distance: 50,
        class: [DEVICE_CONFIG_CONSTANTS.BUTTERFLY],
        averageTime: WORKOUT_50_FLY_TIME,
      },
      {
        numSwims: 2,
        numIntendedSwims: 2,
        distance: 25,
        class: [DEVICE_CONFIG_CONSTANTS.BACKSTROKE],
        averageTime: WORKOUT_25_BACK_TIME,
      },
      {
        numSwims: 1,
        numIntendedSwims: 1,
        distance: 25,
        class: [DEVICE_CONFIG_CONSTANTS.BREASTROKE],
        averageTime: WORKOUT_25_BREAST_TIME,
      },
    ]
  },
  {
    numRoundsIntended: 1,
    numRoundsDone: 1,
    numSwimsIntended: 4,
    numSwimsDone: 4,
    sets: [
      {
        numSwims: 1,
        numIntendedSwims: 1,
        distance: 50,
        class: [DEVICE_CONFIG_CONSTANTS.BUTTERFLY],
        averageTime: WORKOUT_50_FLY_TIME,
      },
      {
        numSwims: 1,
        numIntendedSwims: 1,
        distance: 50,
        class: [DEVICE_CONFIG_CONSTANTS.BACKSTROKE],
        averageTime: WORKOUT_50_BACK_TIME,
      },
      {
        numSwims: 1,
        numIntendedSwims: 1,
        distance: 50,
        class: [DEVICE_CONFIG_CONSTANTS.BREASTROKE],
        averageTime: WORKOUT_50_BREAST_TIME,
      },
      {
        numSwims: 1,
        numIntendedSwims: 1,
        distance: 50,
        class: [DEVICE_CONFIG_CONSTANTS.FREESTYLE],
        averageTime: WORKOUT_50_FREE_TIME,
      },
    ]
  },
];

// 2 rounds of 4 x 200s IM, 4 x 100s IM, 2 50s fly, 2 25s back, 1 25 breast
// they only completed 1 round and up to the first 50 fly of round 2
const MOCK_INCOMPLETE_SWIM_WORKOUT: Array<SwimWorkoutSchema> = [
  {
    sets: [
      ...createRepeatSwimSet(4, 200, DEVICE_CONFIG_CONSTANTS.IM, WORKOUT_2_IM_TIME, 4),
      ...createRepeatSwimSet(4, 100, DEVICE_CONFIG_CONSTANTS.IM, WORKOUT_1_IM_TIME, 4),
      ...createRepeatSwimSet(2, 50, DEVICE_CONFIG_CONSTANTS.BUTTERFLY, WORKOUT_50_FLY_TIME, 2),
      ...createRepeatSwimSet(2, 25, DEVICE_CONFIG_CONSTANTS.BACKSTROKE, WORKOUT_25_BACK_TIME, 2),
      ...createRepeatSwimSet(1, 25, DEVICE_CONFIG_CONSTANTS.BREASTROKE, WORKOUT_25_BREAST_TIME, 1),

      ...createRepeatSwimSet(4, 200, DEVICE_CONFIG_CONSTANTS.IM, WORKOUT_2_IM_TIME, 4),
      ...createRepeatSwimSet(4, 100, DEVICE_CONFIG_CONSTANTS.IM, WORKOUT_1_IM_TIME, 4),
      ...createRepeatSwimSet(2, 50, DEVICE_CONFIG_CONSTANTS.BUTTERFLY, WORKOUT_50_FLY_TIME, 1),
    ],
    totalNumRoundsIntended: 2,
    totalNumSwimsIntended: 2 * (4 + 4 + 2 + 1 + 2)
  }
];

// 2 rounds of 4 x 200s IM, 4 x 100s IM, 2 50s fly, 2 25s back, 1 25 breast
// they only completed 1 round and up to the first 50 fly of round 2
const EXPECTED_INCOMPLETE_WORKOUT: Array<SwimmingWorkout> = [
  {
    numRoundsIntended: 2,
    numRoundsDone: 1,
    numSwimsIntended: 2 * (4 + 4 + 2 + 1 + 2),
    numSwimsDone: 1 * (4 + 4 + 2 + 1 + 2) + 4 + 4 + 1,
    sets: [
      {
        numSwims: 4,
        numIntendedSwims: 4,
        distance: 200,
        class: [DEVICE_CONFIG_CONSTANTS.IM],
        averageTime: WORKOUT_2_IM_TIME,
      },
      {
        numSwims: 4,
        numIntendedSwims: 4,
        distance: 100,
        class: [DEVICE_CONFIG_CONSTANTS.IM],
        averageTime: WORKOUT_1_IM_TIME,
      },
      {
        numSwims: 2,
        numIntendedSwims: 2,
        distance: 50,
        class: [DEVICE_CONFIG_CONSTANTS.BUTTERFLY],
        averageTime: WORKOUT_50_FLY_TIME,
      },
      {
        numSwims: 2,
        numIntendedSwims: 2,
        distance: 25,
        class: [DEVICE_CONFIG_CONSTANTS.BACKSTROKE],
        averageTime: WORKOUT_25_BACK_TIME,
      },
      {
        numSwims: 1,
        numIntendedSwims: 1,
        distance: 25,
        class: [DEVICE_CONFIG_CONSTANTS.BREASTROKE],
        averageTime: WORKOUT_25_BREAST_TIME,
      },
    ]
  },
];


// 2 rounds of 4 x 200s IM, 4 x 100s IM, 2 50s fly, 2 25s back, 1 25 breast
// they only completed up to the first 50 fly of round 1
const MOCK_IMCOMPLETE_ROUND: Array<SwimWorkoutSchema> = [
  {
    sets: [
      ...createRepeatSwimSet(4, 200, DEVICE_CONFIG_CONSTANTS.IM, WORKOUT_2_IM_TIME, 4),
      ...createRepeatSwimSet(4, 100, DEVICE_CONFIG_CONSTANTS.IM, WORKOUT_1_IM_TIME, 4),
      ...createRepeatSwimSet(2, 50, DEVICE_CONFIG_CONSTANTS.BUTTERFLY, WORKOUT_50_FLY_TIME, 1),
    ],
    totalNumRoundsIntended: 2,
    totalNumSwimsIntended: 2 * (4 + 4 + 2 + 1 + 2)
  }
];

const EXPECTED_INCOMPLETE_ROUND: Array<SwimmingWorkout> = [
  {
    numRoundsIntended: 2,
    numRoundsDone: 0,
    numSwimsIntended: 2 * (4 + 4 + 2 + 1 + 2),
    numSwimsDone: 4 + 4 + 1,
    sets: [
      {
        numSwims: 4,
        numIntendedSwims: 4,
        distance: 200,
        class: [DEVICE_CONFIG_CONSTANTS.IM],
        averageTime: WORKOUT_2_IM_TIME,
      },
      {
        numSwims: 4,
        numIntendedSwims: 4,
        distance: 100,
        class: [DEVICE_CONFIG_CONSTANTS.IM],
        averageTime: WORKOUT_1_IM_TIME,
      },
      {
        numSwims: 1,
        numIntendedSwims: 2,
        distance: 50,
        class: [DEVICE_CONFIG_CONSTANTS.BUTTERFLY],
        averageTime: WORKOUT_50_FLY_TIME,
      },
    ]
  },
];

describe('Swimming workout mode workouts are constructed correctly', () => {
  it('Handles empty cases correctly', () => {
    let actual = calcSwimWorkouts([]);
    expect(actual).toStrictEqual([]);
  });
  it('Handles back to back, all strokes, many distances, more than 1 workout', () => {
    let actual = calcSwimWorkouts(MOCK_SWIM_WORKOUTS);
    expect(actual).toStrictEqual(EXPECTED_SWIM_WORKOUTS);
  });
  it('Handles incomplete workouts correctly', () => {
    let actual = calcSwimWorkouts(MOCK_INCOMPLETE_SWIM_WORKOUT);
    expect(actual).toStrictEqual(EXPECTED_INCOMPLETE_WORKOUT);
    actual = calcSwimWorkouts(MOCK_IMCOMPLETE_ROUND);
    expect(actual).toStrictEqual(EXPECTED_INCOMPLETE_ROUND);
  });
});