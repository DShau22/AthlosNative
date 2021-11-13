import React from 'react'
import { UserDataInterface } from './components/generic/UserTypes';
export type AppFunctionsContextType = {
  setAppState: Function,
  updateLocalUserInfo: Function,
  updateLocalUserFitness: Function,
  syncProgress: number,
  shouldRefreshFitness: boolean,
  setShouldRefreshFitness: Function,
  syncData: Function,
  showAutoSyncWarningModal: boolean,
  setShowAutoSyncWarningModal: Function,
  showSpinner: boolean,
  setSpinner: Function,
}
export interface ProfileContextType extends UserDataInterface {
  settings: Object,
  relationshipStatus: string,
}

const AppContext = React.createContext({});
const UserDataContext = React.createContext({});
const SettingsContext = React.createContext({});
const AppFunctionsContext = React.createContext({});
const ProfileContext = React.createContext({});
export {
  AppContext,
  UserDataContext,
  SettingsContext,
  AppFunctionsContext,
  ProfileContext,
}