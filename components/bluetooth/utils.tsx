import { getSaInitConfig, getUserData } from "../utils/storage";
import SAinit from "./SAinitManager";

export const updateSaInit = async (GlobalBleHandler: any) => {
  // store the device config in local storage first
  const saInitConfig = await getSaInitConfig();
  if (!saInitConfig) {
    console.log("no sainit stored yet");
    return;
  }
  const userData = await getUserData(); // CANT USE CONTEXT CUZ SETSTATE IS ASYNC
  const { settings, cadenceThresholds, referenceTimes, runEfforts, swimEfforts, bests } = userData;
  console.log(
    bests.highestJump,
  );
  const sainitManager = new SAinit(
    saInitConfig,
    settings,
    runEfforts,
    swimEfforts,
    referenceTimes,
    cadenceThresholds,
    bests.highestJump,
  );
  const saInitBytes = sainitManager.createSaInit(); // should return byte array
  await GlobalBleHandler.sendByteArray(saInitBytes);
  return 1;
}