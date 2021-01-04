import GLOBAL_CONSTANTS from '../GlobalConstants'
const {
  EVERYONE,
  FOLLOWERS,
  ONLY_ME
} = GLOBAL_CONSTANTS
const SETTINGS_CONSTANTS = {
  SETTINGS_MENU: 'Settings Menu',
  COMMUNITY_SETTINGS: 'Community Settings',
  FITNESS_SETTINGS: 'Fitness Settings',
  TOTALS_SETTINGS: 'Totals Settings',
  BESTS_SETTINGS: 'Bests Settings',
  BASIC_INFO_SETTINGS: 'Basic Info Settings',
  UNIT_SYSTEM_SETTINGS: 'Unit System Settings',
  SWIM_SETTINGS: 'Swimming Settings',
  COMMUNITY_SETTINGS_LIST: [
    {
      title: EVERYONE,
      subtitle: 'FRIENDS_SETTINGS_LIST',  
    },
    {
      title: FOLLOWERS,
      subtitle: 'FRIENDS_SETTINGS_LIST',
    },
    {
      title: ONLY_ME,
      subtitle: 'FRIENDS_SETTINGS_LIST', 
    },
  ],
  FITNESS_SETTINGS_LIST: [
    {
      title: EVERYONE,
      subtitle: 'FITNESS_SETTINGS_LIST',  
    },
    {
      title: FOLLOWERS,
      subtitle: 'FITNESS_SETTINGS_LIST',
    },
    {
      title: ONLY_ME,
      subtitle: 'FITNESS_SETTINGS_LIST', 
    },
  ],
  BESTS_SETTINGS_LIST: [
    {
      title: EVERYONE,
      subtitle: 'BESTS_SETTINGS_LIST',  
    },
    {
      title: FOLLOWERS,
      subtitle: 'BESTS_SETTINGS_LIST',
    },
    {
      title: ONLY_ME,
      subtitle: 'BESTS_SETTINGS_LIST', 
    },
  ],
  TOTALS_SETTINGS_LIST: [
    {
      title: EVERYONE,
      subtitle: 'AVERAGES_SETTINGS_LIST',  
    },
    {
      title: FOLLOWERS,
      subtitle: 'AVERAGES_SETTINGS_LIST',
    },
    {
      title: ONLY_ME,
      subtitle: 'AVERAGES_SETTINGS_LIST', 
    },
  ],
  BASIC_INFO_SETTINGS_LIST: [
    {
      title: EVERYONE,
      subtitle: 'BASIC_INFO_SETTINGS_LIST',  
    },
    {
      title: FOLLOWERS,
      subtitle: 'BASIC_INFO_SETTINGS_LIST',
    },
    {
      title: ONLY_ME,
      subtitle: 'BASIC_INFO_SETTINGS_LIST', 
    },
  ],
  UNIT_SYSTEM_SETTINGS_LIST: [
    {
      title: 'English',
      subtitle: 'yards, feet, inches, etc...',  
    },
    {
      title: 'Metric',
      subtitle: 'meters, centimeters, kilometers, etc...',
    },
  ],
  SWIM_SETTINGS_LIST: [
    {
      title: EVERYONE,
      subtitle: 'SWIM_SETTINGS_LIST',  
    },
    {
      title: FOLLOWERS,
      subtitle: 'SWIM_SETTINGS_LIST',
    },
    {
      title: ONLY_ME,
      subtitle: 'SWIM_SETTINGS_LIST', 
    },
  ],
}
export default SETTINGS_CONSTANTS