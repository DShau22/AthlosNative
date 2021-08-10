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