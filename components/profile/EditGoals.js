import React from 'react'
import { View, StyleSheet, Alert, ScrollView, SafeAreaView } from 'react-native'
import { Button } from 'react-native-elements'
import GLOBAL_CONSTANTS from '../GlobalConstants'
import * as Yup from 'yup';
import axios from 'axios';

import { UserDataContext, AppFunctionsContext } from "../../Context"

import {
  cmToInches,
} from "../utils/unitConverter"
import ENDPOINTS from "../endpoints"
import editGoalsSchema from "./EditGoalsSchema"
import Textbox from "../nativeLogin/Textbox"
import Spinner from 'react-native-loading-spinner-overlay';
import { useTheme } from '@react-navigation/native'

const { METRIC, ENGLISH } = GLOBAL_CONSTANTS

export default function EditProfile(props) {
  const context = React.useContext(UserDataContext);
  const { colors } = useTheme();
  const { updateLocalUserInfo, setAppState } = React.useContext(AppFunctionsContext);
  var { unitSystem } = context.settings
  const { goals } = context;
  const [isLoading, setIsLoading] = React.useState(false);
  const [state, setState] = React.useState({
    updateGoalSteps: goals.goalSteps,
    updateGoalLaps: goals.goalLaps,
    updateGoalVertical: goals.goalVertical,
    updateGoalCaloriesBurned: goals.goalCaloriesBurned,
    updateGoalWorkoutTime: goals.goalWorkoutTime,

    goalStepsChange: false,
    goalLapsChange: false,
    goalVerticalChange: false,
    goalCaloriesBurnedChange: false,
    goalWorkoutTimeChange: false,

    goalStepsMsg: '',
    goalLapsMsg: '',
    goalVerticalMsg: '',
    goalCaloriesBurnedMsg: '',
    goalWorkoutTimeMsg: '',
  });

  // cancel token for cancelling Axios requests on unmount
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();

  React.useEffect(() => {
    return () => source.cancel('component unmounted');
  }, []);

  const handleGoalStepsChange = (val) => {
    const validationString = val === '' ? undefined : val
    Yup.reach(editGoalsSchema, "goalSteps").validate(validationString)
      .then(function(isValid) {
        setState(prevState => ({
          ...prevState,
          updateGoalSteps: val,
          goalStepsChange: val.length !== 0,
          goalStepsMsg: ''
        }));
      })
      .catch(function(e) {
        console.log(e);
        setState(prevState => ({
          ...prevState,
          goalStepsMsg: e.errors[0],
        }));
      })
  }

  const handleGoalLapsChange = (val) => {
    const validationString = val === '' ? undefined : val
    Yup.reach(editGoalsSchema, "goalLaps").validate(validationString)
      .then(function(isValid) {
        setState(prevState => ({
          ...prevState,
          updateGoalLaps: val,
          goalLapsChange: val.length !== 0,
          goalLapsMsg: ''
        }));
      })
      .catch(function(e) {
        console.log(e);
        setState(prevState => ({
          ...prevState,
          goalLapsMsg: e.errors[0],
        }));
      })
  }

  const handleGoalVerticalChange = (val) => {
    const validationString = val === '' ? undefined : val
    Yup.reach(editGoalsSchema, "goalVertical").validate(validationString)
      .then(function(isValid) {
        setState(prevState => ({
          ...prevState,
          updateGoalVertical: val,
          goalVerticalChange: val.length !== 0,
          goalVerticalMsg: ''
        }));
      })
      .catch(function(e) {
        console.log(e);
        setState(prevState => ({
          ...prevState,
          goalVerticalMsg: e.errors[0],
        }));
      })
  }

  const handleGoalCaloriesBurnedChange = (val) => {
    const validationString = val === '' ? undefined : val
    Yup.reach(editGoalsSchema, "goalCaloriesBurned").validate(validationString)
      .then(function(isValid) {
        setState(prevState => ({
          ...prevState,
          updateGoalCaloriesBurned: val,
          goalCaloriesBurnedChange: val.length !== 0,
          goalCaloriesBurnedMsg: ''
        }));
      })
      .catch(function(e) {
        console.log(e);
        setState(prevState => ({
          ...prevState,
          goalCaloriesBurnedMsg: e.errors[0],
        }));
      })
  }

  const handleGoalWorkoutTimeChange = (val) => {
    const validationString = val === '' ? undefined : val
    Yup.reach(editGoalsSchema, "goalWorkoutTime").validate(validationString)
      .then(function(isValid) {
        setState(prevState => ({
          ...prevState,
          updateGoalWorkoutTime: val,
          goalWorkoutTimeChange: val.length !== 0,
          goalWorkoutTimeMsg: ''
        }));
      })
      .catch(function(e) {
        console.log(e);
        setState(prevState => ({
          ...prevState,
          goalWorkoutTimeMsg: e.errors[0],
        }));
      })
  }

  const updateGoals = () => {
    const asyncUpdateGoals = async () => {
      setIsLoading(true);
      console.log("updating goals...");
      const { updateGoalSteps, updateGoalLaps, updateGoalVertical, updateGoalCaloriesBurned, updateGoalWorkoutTime } = state;
      unitSystem = unitSystem.toLowerCase();

      // convert vertical to pure inches
      const vertical = unitSystem === METRIC ? cmToInches(updateGoalVertical) : updateGoalVertical;
      
      try {
        var updateRes = await axios.post(ENDPOINTS.updateWeeklyGoals, {
          userID: context._id,
          goalSteps: parseFloat(updateGoalSteps),
          goalLaps: parseFloat(updateGoalLaps),
          goalVertical: parseFloat(vertical),
          goalCaloriesBurned: parseFloat(updateGoalCaloriesBurned),
          goalWorkoutTime: parseFloat(updateGoalWorkoutTime)
        }, { cancelToken: source.token });
        var updateJson = updateRes.data;
        console.log("update json: ", updateJson);
        if (updateJson.success) {
          // make fetch to backend to update app context. Maybe consider just setting state
          // instead of making an entire other fetch
          await updateLocalUserInfo();
          Alert.alert(`All Done!`, "Successfully updated your profile!", [{ text: "Okay" }]);
          setIsLoading(false);
        } else {
          Alert.alert(`Oh No :(`, updateJson.message, [{ text: "Okay" }]);
          setIsLoading(false);
        }
      } catch(e) {
        console.log(e)
        Alert.alert(`Oh No :(`, "Something went wrong with the connection to the server. Please try again.", [{ text: "Okay" }]);
        setIsLoading(false);
        return;
      }
    }
    asyncUpdateGoals();
  }
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Spinner
          visible={isLoading}
          textContent={'Loading...'}
          textStyle={styles.spinnerTextStyle}
        />
        <View style={[styles.textContainer, {borderColor: colors.border}]}>
          <Textbox 
            headerText={'Steps'}
            keyboardType='numeric'
            defaultValue={state.updateGoalSteps.toString(10)}
            handleChange={handleGoalStepsChange}
            didChange={state.goalStepsChange}
            errMsg={state.goalStepsMsg}
          />
        </View>
        <View style={[styles.textContainer, {borderColor: colors.border}]}>
          <Textbox 
            headerText={'Laps'}
            keyboardType='numeric'
            defaultValue={state.updateGoalLaps.toString(10)}
            handleChange={handleGoalLapsChange}
            didChange={state.goalLapsChange}
            errMsg={state.goalLapsMsg}
          />
        </View>
        <View style={[styles.textContainer, {borderColor: colors.border}]}>
          <Textbox 
            headerText={`Vertical (${unitSystem === METRIC ? 'cm' : 'in'})`}
            keyboardType='numeric'
            defaultValue={state.updateGoalVertical.toString(10)}
            handleChange={handleGoalVerticalChange}
            didChange={state.goalVerticalChange}
            errMsg={state.goalVerticalChange}
          />
        </View>
        <View style={[styles.textContainer, {borderColor: colors.border}]}>
          <Textbox 
            headerText={"Calories Burned"}
            keyboardType='numeric'
            defaultValue={state.updateGoalCaloriesBurned.toString(10)}
            handleChange={handleGoalCaloriesBurnedChange}
            didChange={state.goalCaloriesBurnedChange}
            errMsg={state.goalCaloriesBurnedMsg}
          />
        </View>
        <Button
          buttonStyle={[styles.saveButton, {backgroundColor: colors.button}]}
          title="Save changes"
          onPress={updateGoals}
        />
      </ScrollView>
    </SafeAreaView>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    height: '100%',
  },
  textContainer: {
    borderWidth: 1,
    justifyContent: 'center',
    padding: 15,
    borderRadius: 5,
    marginTop: 15,
    marginBottom: 15,
  },
  scrollView: {
    marginHorizontal: 20,
  },
  image: {
    width: 50,
    height: 50,
  },
  spinnerTextStyle: {
    color: "black"
  },
  englishHeightContainer: {
    flexDirection: 'column',
    // alignItems: 'center',
  },
  uploadImageButton: {
    color: 'black',
  },
  saveButton: {
    marginTop: 30,
  }
})