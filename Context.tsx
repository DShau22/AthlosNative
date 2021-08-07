import React from 'react'
export type AppFunctionsContextType = {
  setAppState: Function,
  updateLocalUserInfo: Function,
  updateLocalUserFitness: Function,
  syncProgress: number,
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