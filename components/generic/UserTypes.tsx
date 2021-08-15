import { IntervalSchema, JumpSchema, RunSchema, SwimSchema } from '../fitness/data/UserActivities';
import GLOBAL_CONSTANTS from '../GlobalConstants';
const {
  ONLY_ME,
  FOLLOWERS,
  EVERYONE,

  ENGLISH,
  METRIC,
} = GLOBAL_CONSTANTS;

export type RefTimesType = {
  fly: Array<number>,
  back: Array<number>, 
  breast: Array<number>, 
  free: Array<number>,
}

export type SettingsType = {
  seeCommunity: CommunityPrivacyEnum,
  seeFitness: CommunityPrivacyEnum,
  seeBasicInfo: CommunityPrivacyEnum,
  seeBests: CommunityPrivacyEnum,
  seeTotals: CommunityPrivacyEnum
  unitSystem: UNIT_SYSTEM_ENUM,
}

export enum UNIT_SYSTEM_ENUM {
  ENGLISH,
  METRIC,
}

export enum CommunityPrivacyEnum {
  ONLY_ME,
  FOLLOWERS,
  EVERYONE
}

export interface UserDataInterface {
  _id: string,
  friends: Array<any>,
  friendRequests: Array<any>,
  friendsPending: Array<any>,

  rivals: Array<any>,
  rivalsPending: Array<any>,
  rivalRequests: Array<any>,

  followers: Array<any>,
  followerRequests: Array<any>,

  following: Array<any>,
  followingPending: Array<any>,

  firstName: string,
  lastName: string,
  username: string,
  gender: string,
  bio: string,
  height: string,
  weight: string,
  age: string,
  profilePicture: string,
  settings: Object,
  numFriendsDisplay: number,
  goals: GoalsSchema,
  bests: bestsSchema,
  runEfforts: Array<number>,
  walkEfforts: Array<number>,
  swimEfforts: Array<number>,
  referenceTimes: ReferenceTimesSchema,
  jumpJson: {
    activityData: Array<JumpSchema>,
    action: string,
  },
  runJson: {
    activityData: Array<RunSchema>,
    action: string,
  },
  swimJson: {
    activityData: Array<SwimSchema>,
    action: string,
  },
  intervalJson: {
    activityData: Array<IntervalSchema>,
    action: string,
  },
}

export type GoalsSchema = {
  goalSteps: number,
  goalLaps: number,
  goalVertical: number,
  goalCaloriesBurned: number,
  goalWorkoutTime: number,
}

export type bestsSchema = {
  mostCalories: number,
  mostSteps: number,
  mostLaps: number,
  highestJump: number,
  bestEvent: any,
}

export type ReferenceTimesSchema = {
  fly: Array<number>,
  back: Array<number>,
  breast: Array<number>,
  free: Array<number>,
}