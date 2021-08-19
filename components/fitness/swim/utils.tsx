import { Lap } from "../data/UserActivities";
import FITNESS_CONSTANTS from "../FitnessConstants";
import { PoolLengthsEnum, SwimStrokesEnum } from "../FitnessTypes";

export type StrokeTimeType = {
  stroke: SwimStrokesEnum,
  lapTime: number,
  finished: boolean,
}

export type SwimRepeatGroup = {
  swims: Array<SwimType>,
  averageTime: number, // in seconds
  numSwims: number,
}

export type SwimType = {
  distance: number,
  strokes: Array<SwimStrokesEnum>,
  class: Array<SwimStrokesEnum | string> | string | SwimStrokesEnum,
  time: number
}

const IM_ORDER = ["Fly", "Back", "Breast", "Free"];
type strokeCount = {
  count: number,
  stroke: string,
  firstOccurenceIdx: number,
}

export const round33PoolLength = (distance: number) => {
  // if it's a multiple of 99, round up to the nearest hundred
  if (distance % 99 == 0) {
    return Math.ceil(distance / 100) * 100;
  } else {
    return distance;
  }
}

const compareFirstOccurences = (strokeCount1: strokeCount, strokeCount2: strokeCount) => {
  if (strokeCount1.firstOccurenceIdx < strokeCount2.firstOccurenceIdx) {
    return -1
  } else if (strokeCount1.firstOccurenceIdx > strokeCount2.firstOccurenceIdx) {
    return 1;
  } else {
    return 0;
  }
}

function arrayEquals(a: Array<any>, b: Array<any>) {
  return Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => val === b[index]);
}

export const classifyRepeatGroup = (group: SwimType): Array<string> => {
  const { strokes } = group;
  let flyCount = { count: 0, stroke: "Fly", firstOccurenceIdx: group.strokes.length };
  let backCount = { count: 0, stroke: "Back", firstOccurenceIdx: group.strokes.length };
  let breastCount = { count: 0, stroke: "Breast", firstOccurenceIdx: group.strokes.length };
  let freeCount = { count: 0, stroke: "Free", firstOccurenceIdx: group.strokes.length };
  let unknownCount = { count: 0, stroke: "Unknown", firstOccurenceIdx: group.strokes.length };
  strokes.forEach((stroke, idx) => {
    if (stroke === SwimStrokesEnum.FLY) {
      flyCount.count += 1;
      flyCount.firstOccurenceIdx = Math.min(flyCount.firstOccurenceIdx, idx);
    } else if (stroke === SwimStrokesEnum.BACK) {
      backCount.count += 1;
      backCount.firstOccurenceIdx = Math.min(backCount.firstOccurenceIdx, idx);
    } else if (stroke === SwimStrokesEnum.BREAST) {
      breastCount.count += 1;
      breastCount.firstOccurenceIdx = Math.min(breastCount.firstOccurenceIdx, idx);
    } else if (stroke === SwimStrokesEnum.FREE) {
      freeCount.count += 1;
      freeCount.firstOccurenceIdx = Math.min(freeCount.firstOccurenceIdx, idx);
    } else {
      unknownCount.count += 1;
      unknownCount.firstOccurenceIdx = Math.min(unknownCount.firstOccurenceIdx, idx);
    }
  });
  let strokeCountObjects = [flyCount, backCount, breastCount, freeCount, unknownCount];
  // sort to know the order of strokes this person swam
  strokeCountObjects.sort(compareFirstOccurences);
  let filteredSortedStrokeCountObjects = strokeCountObjects.filter(strokeCountObj => strokeCountObj.count > 0);
  let sortedStrokesOnly = filteredSortedStrokeCountObjects.map((strokeCountObj) => strokeCountObj.stroke);
  // check if they did IM
  let uniqueStrokeCounts = new Set(filteredSortedStrokeCountObjects.map((strokeCountObj) => strokeCountObj.count));
  if (arrayEquals(sortedStrokesOnly, IM_ORDER) && 
      uniqueStrokeCounts.size === 1) {
        return ["IM"];
  }
  return filteredSortedStrokeCountObjects.map((strokeCountObject, _) => strokeCountObject.stroke);
}

export const calcSwimGroups = (lapTimes: Array<Lap>, strokes: Array<SwimStrokesEnum>, poolLength: PoolLengthsEnum): Array<SwimType> => {
  let currentSwim: SwimType = {
    distance: 0,
    strokes: [],
    class: "",
    time: 0,
  };
  let numericalPoolLength = poolLength ? parseInt((poolLength as unknown as string).split(" ")[0]) : 25;
  let swims: Array<SwimType> = [];
  for (let i = 0; i < lapTimes.length; i++) {
    let stroke = strokes[i];
    let { lapTime, finished } = lapTimes[i];
    // add the current stroke and laptime to the current group
    currentSwim.strokes.push(stroke);
    currentSwim.time += lapTime;
    // currentGrouping.averageTime = currentGrouping.averageTime + (lapTime - currentGrouping.averageTime) / currentGrouping.numRepeats;
    if (finished) {
      // determine what stroke this primarily was
      currentSwim.class = classifyRepeatGroup(currentSwim);
      currentSwim.distance = round33PoolLength(currentSwim.strokes.length * numericalPoolLength);
      swims.push({...currentSwim});
      // reset current grouping
      currentSwim = {
        strokes: [],
        class: "",
        distance: 0,
        time: 0,
      };
    }
  }
  return swims;
}

export const calcSwimWorkout = (swims: Array<SwimType>): Array<SwimRepeatGroup> => {
  if (swims.length === 0) {
    return [];
  }
  let swimWorkout: Array<SwimRepeatGroup> = [];
  let prevGrouping: SwimRepeatGroup = {
    swims: [swims[0]],
    averageTime: swims[0].time,
    numSwims: 1,
  };
  // iterate through all the swims. Group things of same class and reset once you hit a different class
  for (let i = 1; i < swims.length; i++) {
    let swim = swims[i];
    let prevSwimType = prevGrouping.swims[prevGrouping.swims.length - 1];
    if (arrayEquals(swim.strokes, prevSwimType.strokes) && swim.distance === prevSwimType.distance) {
      prevGrouping.averageTime = prevGrouping.averageTime + (swim.time - prevGrouping.averageTime) / prevGrouping.numSwims;
      prevGrouping.numSwims += 1;
    } else {
      // push the group to the swim workout and reset prevGrouping.
      // Also make sure to add the current swim info to the prev grouping 
      swimWorkout.push({...prevGrouping});
      prevGrouping.swims = [];
      prevGrouping.averageTime = swim.time;
      prevGrouping.numSwims = 1;
    }
    prevGrouping.swims.push(swim);
  }
  swimWorkout.push({...prevGrouping});
  return swimWorkout;
}
