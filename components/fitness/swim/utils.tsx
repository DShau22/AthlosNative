import { COLOR_THEMES } from "../../ColorThemes";
import { Lap, SwimSetSchema, SwimWorkoutSchema } from "../data/UserActivities";
import FITNESS_CONSTANTS from "../FitnessConstants";
import { PoolLengthsEnum, SwimStrokesEnum } from "../FitnessTypes";

export type StrokeTimeType = {
  stroke: SwimStrokesEnum,
  lapTime: number,
  finished: boolean,
}

export type SwimSet = {
  swims?: Array<SwimType>,
  numIntendedSwims?: number,
  numSwims: number, // should be equal to swims.length
  distance: number | string,
  class: Array<string>,
  averageTime: number, // in seconds
}

export type SwimType = {
  distance: number,
  strokes: Array<SwimStrokesEnum>,
  class: Array<string>,
  time: number
}

const IM_ORDER = ["Fly", "Back", "Breast", "Free"];
type strokeCount = {
  count: number,
  stroke: string,
  firstOccurenceIdx: number,
}

export const displayClass = (swimClass: Array<string>): string => {
  return swimClass.join(", ");
}

export const round33PoolLength = (distance: number) => {
  // if it's a multiple of 99, round up to the nearest hundred
  if (distance % 33 == 0) {
    let num33s = distance / 33;
    let num100s = Math.floor(num33s / 3);
    return 100 * num100s + 33 * (num33s % 3);
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
    class: ["Unknown"],
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
        class: ["Unknown"],
        distance: 0,
        time: 0,
      };
    }
  }
  return swims;
}

// given the data from a lap swimming mode output, re render it in a format so that it can be displayed
export const calcLapSwimWorkout = (swims: Array<SwimType>): Array<SwimSet> => {
  if (swims.length === 0) {
    return [];
  }
  let swimWorkout: Array<SwimSet> = [];
  let prevGrouping: SwimSet = {
    swims: [swims[0]],
    averageTime: swims[0].time,
    numSwims: 1,
    class: swims[0].class,
    distance: swims[0].distance,
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
      prevGrouping.distance = swim.distance;
      prevGrouping.class = swim.class;
    }
    prevGrouping.swims?.push(swim);
  }
  swimWorkout.push({...prevGrouping});
  return swimWorkout;
}

// given the data from a swimming workout mode output, re render it in a format so that it can be displayed
export type SwimmingWorkout = {
  numRoundsIntended: number,
  numRoundsDone: number,
  numSwimsIntended: number,
  numSwimsDone: number,
  sets: Array<SwimSet>,
}

export const calcSwimWorkouts = (workouts: Array<SwimWorkoutSchema> | undefined): Array<SwimmingWorkout> => {
  if (!workouts) {
    return [];
  }
  let swimWorkouts: Array<SwimmingWorkout> = [];
  for (let i = 0; i < workouts.length; i++) {
    let workout: SwimWorkoutSchema = workouts[i];
    if (workout.sets.length === 0) {
      continue;
    }
    let swimsPerRound = workout.totalNumSwimsIntended / workout.totalNumRoundsIntended;
    let currSwimWorkout: SwimmingWorkout = {
      numRoundsIntended: workout.totalNumRoundsIntended,
      numRoundsDone: Math.floor(workout.sets.length / swimsPerRound),
      numSwimsIntended: workout.totalNumSwimsIntended,
      numSwimsDone: workout.sets.length,
      sets: []
    };
    let prevSetGrouping: SwimSet = {
      numSwims: 1,
      numIntendedSwims: workout.sets[0].reps,
      distance: workout.sets[0].distance ? workout.sets[0].distance : "unknown distance",
      class: [workout.sets[0].event],
      averageTime: workout.sets[0].timeIntervalInSeconds,
    };
    for (let j = 1; j < Math.min(workout.sets.length, swimsPerRound); j++) {
      // each set is something like 4 x 100s freestyle. There will be many duplicates of the same set,
      // and each duplicate represents a compeleted swim within that set. So, if there are 3 duplicates of
      // 4 x 100s freestyle, it means the user completed 3 out of the 4 100s of freestyle. What a slacker.
      const currSwimSet = workout.sets[j];
      if (!swimSetsEqual(currSwimSet, prevSetGrouping)) {
        // reset the grouping
        currSwimWorkout.sets.push({...prevSetGrouping});
        prevSetGrouping.numSwims = 1;
        prevSetGrouping.numIntendedSwims = currSwimSet.reps;
        prevSetGrouping.distance = currSwimSet.distance;
        prevSetGrouping.class = [currSwimSet.event];
        prevSetGrouping.averageTime = currSwimSet.timeIntervalInSeconds;
      } else {
        prevSetGrouping.numSwims += 1;
      }
    }
    currSwimWorkout.sets.push({...prevSetGrouping});
    swimWorkouts.push(currSwimWorkout);
  }
  return swimWorkouts;
}

const swimSetsEqual = (currSwimSet: SwimSetSchema, prevGrouping: SwimSet) => {
  const {distance, event, timeIntervalInSeconds, reps} = currSwimSet;
  let equalDistances = prevGrouping.distance === distance;
  let equalClasses =  arrayEquals([event], prevGrouping.class);
  let equalTimes = timeIntervalInSeconds === prevGrouping.averageTime;
  let equalReps = reps === prevGrouping.numIntendedSwims;
  return equalDistances && equalClasses && equalTimes && equalReps;
}

export const STROKE_TO_COLOR = {
  Fly: COLOR_THEMES.SWIM_DONUT_GRADIENTS[0].startColor,
  Back: COLOR_THEMES.SWIM_DONUT_GRADIENTS[1].startColor,
  Breast: COLOR_THEMES.SWIM_DONUT_GRADIENTS[2].startColor,
  Free: COLOR_THEMES.SWIM_DONUT_GRADIENTS[3].startColor,
}
