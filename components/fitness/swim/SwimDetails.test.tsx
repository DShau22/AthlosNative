import { Lap } from "../data/UserActivities";
import { PoolLengthsEnum, SwimStrokesEnum } from "../FitnessTypes";
import { calcSwimWorkout, calcSwimGroups, SwimRepeatGroup, SwimType } from "./utils";

const sumLapTimes = (a: Array<Lap>) => {
  return a.reduce((acc, next) => acc + next.lapTime, 0);
}

const createRepeat = (strokes: Array<SwimStrokesEnum>, times: Array<Lap>, repeats: number, poolLength: number, swimClass: Array<string>): SwimRepeatGroup => {
  const time = sumLapTimes(times);
  const result: SwimRepeatGroup = {
    swims: [],
    averageTime: time,
    numSwims: repeats,
  };
  for (let i = 0; i < repeats; i++) {
    result.swims.push({
      distance: strokes.length * poolLength,
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

const IM_200_REPEAT_3: SwimRepeatGroup = {
  swims: [
    {
      distance: 200,
      strokes: IM_200_STROKES,
      class: ["IM"],
      time: IM_200_TIMES.reduce((acc, next) => acc + next.lapTime, 0)
    },
    {
      distance: 200,
      strokes: IM_200_STROKES,
      class: ["IM"],
      time: IM_200_TIMES.reduce((acc, next) => acc + next.lapTime, 0)
    },
    {
      distance: 200,
      strokes: IM_200_STROKES,
      class: ["IM"],
      time: IM_200_TIMES.reduce((acc, next) => acc + next.lapTime, 0)
    }  
  ],
  averageTime: IM_200_TIMES.reduce((acc, next) => acc + next.lapTime, 0),
  numSwims: 3,
}

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

const EXPECTED_IMS: Array<SwimRepeatGroup> = [
  IM_200_REPEAT_3
];

const EXPECTED_OLYMPIC_IM: Array<SwimRepeatGroup> = [
  {
    ...IM_200_REPEAT_3,
    swims: IM_200_REPEAT_3.swims.map((swim) => ({...swim, distance: swim.distance * 2}))
  }
];

// test empty case
const EXPECTED_EMPTY: Array<SwimRepeatGroup> = [];

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

describe('Swim Workouts are constructed correctly', () => {
  it('calculates repeated IMs correctly', () => {
    let swims = calcSwimGroups(MOCK_LAPTIMES_IMS, MOCK_STROKES_IMS, PoolLengthsEnum.NCAA);
    let actual = calcSwimWorkout(swims);
    expect(actual).toStrictEqual(EXPECTED_IMS);
  });
  it('correctly handles 50 m pools too', () => {
    let swims = calcSwimGroups(MOCK_LAPTIMES_IMS, MOCK_STROKES_IMS, PoolLengthsEnum.OLYMPIC);
    let actual = calcSwimWorkout(swims);
    expect(actual).toStrictEqual(EXPECTED_OLYMPIC_IM);
  });
  it("doesn't break when empty arrays are passed in", () => {
    let swims = calcSwimGroups([], [], PoolLengthsEnum.NCAA);
    let actual = calcSwimWorkout(swims);
    expect(actual).toStrictEqual(EXPECTED_EMPTY);
  });
  it("handles back to back strokes, mixed groups, all strokes", () => {
    let swims = calcSwimGroups(MOCK_LAPTIMES_MIXED, MOCK_STROKES_MIXED, PoolLengthsEnum.NCAA);
    let actual = calcSwimWorkout(swims);
    expect(actual).toStrictEqual(EXPECTED_MIXED);
  });
  it("handles alternating mixed classes", () => {
    let swims = calcSwimGroups(MOCK_MIXED_ALT_LAPTIME, MOCK_MIXED_ALT_STROKES, PoolLengthsEnum.NCAA);
    let actual = calcSwimWorkout(swims);
    expect(actual).toStrictEqual(EXPECTED_MIXED_ALT);
  });
  it("handles unknowns correctly", () => {
    let swims = calcSwimGroups(MOCK_UNKNOWNS_TIMES, MOCK_UNKNOWNS_STROKES, PoolLengthsEnum.THIRD_M);
    let actual = calcSwimWorkout(swims);
    expect(actual).toStrictEqual(EXPECTED_UNKNOWN);
  });
});