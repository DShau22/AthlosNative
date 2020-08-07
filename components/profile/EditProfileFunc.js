import React from 'react'
import { UserDataContext, AppFunctionsContext } from "../../Context"
import { View, StyleSheet, Alert, ScrollView, SafeAreaView } from 'react-native'
import { Button } from 'react-native-elements'
import { Text } from 'react-native-elements'
import GLOBAL_CONSTANTS from '../GlobalConstants'
import * as Yup from 'yup';
import ImagePicker from 'react-native-image-picker';
import axios from 'axios';

import {
  getData,
} from '../utils/storage';
const imagePickerOptions = {
  title: 'Select a photo',
  storageOptions: {
    skipBackup: true,
    path: 'images',
  },
};

import {
  toEnglishWeight,
  toEnglishHeight,
  toInches,
  inchesToCm
} from "../utils/unitConverter"
import ENDPOINTS from "../endpoints"
import editProfileSchema from "./EditProfileSchema"
import Textbox from "../nativeLogin/Textbox"
import Spinner from 'react-native-loading-spinner-overlay';
import { useTheme } from '@react-navigation/native'

const updateProfileURL = ENDPOINTS.updateProfile
const checkDuplicateURL = ENDPOINTS.checkDuplicatePic
const uploadPicURL = ENDPOINTS.uploadProfilePic
const imgAlt = "./default_profile.png"
const { METRIC, ENGLISH } = GLOBAL_CONSTANTS

export default function EditProfileFunc(props) {
  const context = React.useContext(UserDataContext);
  const { colors } = useTheme();
  const { updateLocalUserInfo, setAppState } = React.useContext(AppFunctionsContext);
  const { unitSystem } = context.settings
  const [isLoading, setIsLoading] = React.useState(false);
  const [uploadImageTitle, setUploadImageTitle] = React.useState('upload an image');
  const [updateProfilePic, setUpdateProfilePic] = React.useState(null);
  const [state, setState] = React.useState({
    updateFirstName: context.firstName,
    updateLastName: context.lastName,
    updateBio: context.bio,
    updateAge: context.age,
    updateGender: context.gender,
    updateLocation: context.location,
    updateWeight: context.weight,

    // for the sake of now, will change to respond to context and unit system
    updateHeightFt: Math.floor(context.height / 12),
    updateHeightIn: context.height % 12,
    updateHeightCm: Math.round(inchesToCm(context.height)),

    firstNameChange: false,
    lastNameChange: false,
    bioChange: false,
    ageChange: false,
    genderChange: false,
    heightChange: false,
    locationChange: false,
    profilePicChange: false,
    weightChange: false,

    heightFtChange: false,
    heightCmChange: false,
    heightInChange: false,

    firstNameMsg: '',
    lastNameMsg: '',
    bioMsg: '',
    ageMsg: '',
    genderMsg: '',
    heightMsg: '',
    locationMsg: '',
    profilePicMsg: '',
    weightMsg: '',

    heightFtMsg: '',
    heightCmMsg: '',
    heightInMsg: '',
  });

  // cancel token for cancelling Axios requests on unmount
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();

  const handleFirstNameChange = (val) => {
    Yup.reach(editProfileSchema, "updateFirstName").validate(val)
      .then(function(isValid) {
        setState(prevState => ({
          ...prevState,
          updateFirstName: val,
          firstNameChange: val.length !== 0,
          firstNameMsg: ''
        }));
      })
      .catch(function(e) {
        console.log(e);
        setState(prevState => ({
          ...prevState,
          firstNameMsg: e.errors[0],
        }));
      })
  }

  const handleLastNameChange = (val) => {
    Yup.reach(editProfileSchema, "updateLastName").validate(val)
      .then(function(isValid) {
        setState(prevState => ({
          ...prevState,
          updateLastName: val,
          lastNameChange: val.length !== 0,
          lastNameMsg: ''
        }));
      })
      .catch(function(e) {
        console.log(e);
        setState(prevState => ({
          ...prevState,
          lastNameMsg: e.errors[0],
        }));
      })
  }

  const handleBioChange = (val) => {
    Yup.reach(editProfileSchema, "updateBio").validate(val)
      .then(function(isValid) {
        setState(prevState => ({
          ...prevState,
          updateBio: val,
          bioChange: val.length !== 0,
          bioMsg: ''
        }));
      })
      .catch(function(e) {
        console.log(e);
        setState(prevState => ({
          ...prevState,
          bioMsg: e.errors[0],
        }));
      })
  }

  const handleAgeChange = (val) => {
    const validationString = val === '' ? undefined : val
    Yup.reach(editProfileSchema, "updateAge").validate(validationString)
      .then(function(isValid) {
        setState(prevState => ({
          ...prevState,
          updateAge: val,
          ageChange: val.length !== 0,
          ageMsg: ''
        }));
      })
      .catch(function(e) {
        console.log(e);
        setState(prevState => ({
          ...prevState,
          ageMsg: e.errors[0],
        }));
      })
  }

  const handleGenderChange = (val) => {
    Yup.reach(editProfileSchema, "updateGender").validate(val)
      .then(function(isValid) {
        setState(prevState => ({
          ...prevState,
          updateGender: val,
          genderChange: val.length !== 0,
          genderMsg: ''
        }));
      })
      .catch(function(e) {
        console.log(e);
        setState(prevState => ({
          ...prevState,
          genderMsg: e.errors[0],
        }));
      })
  }

  const handleLocationChange = (val) => {
    Yup.reach(editProfileSchema, "updateLocation").validate(val)
      .then(function(isValid) {
        setState(prevState => ({
          ...prevState,
          updateLocation: val,
          locationChange: val.length !== 0,
          locationMsg: ''
        }));
      })
      .catch(function(e) {
        console.log(e);
        setState(prevState => ({
          ...prevState,
          locationMsg: e.errors[0],
        }));
      })
  }

  // FIGURE OUT HOW TO HANDLE THIS EXACTLY
  const handleHeightCmChange = (val) => {
    const validationString = val === '' ? undefined : val
    Yup.reach(editProfileSchema, "updateHeightCm").validate(validationString)
      .then(function(isValid) {
        setState(prevState => ({
          ...prevState,
          updateHeightCm: val,
          heightCmChange: val.length !== 0,
          heightCmMsg: ''
        }));
      })
      .catch(function(e) {
        console.log(e);
        setState(prevState => ({
          ...prevState,
          heightCmMsg: e.errors[0],
        }));
      })
  }

  const handleHeightFtChange = (val) => {
    const validationString = val === '' ? undefined : val
    Yup.reach(editProfileSchema, "updateHeightFt").validate(validationString)
      .then(function(isValid) {
        setState(prevState => ({
          ...prevState,
          updateHeightFt: val,
          heightFtChange: val.length !== 0,
          heightFtMsg: ''
        }));
      })
      .catch(function(e) {
        console.log(e);
        setState(prevState => ({
          ...prevState,
          heightFtMsg: e.errors[0],
        }));
      })
  }

  const handleHeightInChange = (val) => {
    const validationString = val === '' ? undefined : val
    Yup.reach(editProfileSchema, "updateHeightIn").validate(validationString)
      .then(function(isValid) {
        setState(prevState => ({
          ...prevState,
          updateHeightIn: val,
          heightInChange: val.length !== 0,
          heightInMsg: ''
        }));
      })
      .catch(function(e) {
        console.log(e);
        setState(prevState => ({
          ...prevState,
          heightInMsg: e.errors[0],
        }));
      })
  }

  const handleWeightChange = (val) => {
    const validationString = val === '' ? undefined : val
    Yup.reach(editProfileSchema, "updateWeight").validate(validationString)
      .then(function(isValid) {
        setState(prevState => ({
          ...prevState,
          updateWeight: val,
          weightChange: val.length !== 0,
          weightMsg: ''
        }));
      })
      .catch(function(e) {
        console.log(e);
        setState(prevState => ({
          ...prevState,
          weightMsg: e.errors[0],
        }));
      })
  }

  const renderHeightInput = () => {
    const { unitSystem } = context.settings;
    if (unitSystem === METRIC) {
      // single textbox for cm
      return (
        <Textbox 
          headerText="Height (Cm)"
          placeholder="Your height in cm..."
          icon="user"
          keyboardType='numeric'
          defaultValue={state.heightCm.toString(10)}
          handleChange={handleHeightCmChange}
          didChange={state.heightCmChange}
          errMsg={state.heightCmMsg}
        />
      )
    } else if (unitSystem === ENGLISH) {
      // text boxes for ft and in
      return (
        <View style={styles.englishHeightContainer}>
          <Textbox 
            headerText="Height (Ft)"
            placeholder="Ft..."
            icon="user"
            keyboardType='numeric'
            defaultValue={state.updateHeightFt.toString(10)}
            handleChange={handleHeightFtChange}
            didChange={state.heightFtChange}
            errMsg={state.heightFtMsg}
          />
          <Textbox 
            headerText="Height (In)"
            placeholder="Inches..."
            icon="user"
            keyboardType='numeric'
            defaultValue={state.updateHeightIn.toString(10)}
            handleChange={handleHeightInChange}
            didChange={state.heightInChange}
            errMsg={state.heightInMsg}
          />
        </View>
      )
    } else {
      return <Text>unit system isn't english or metric...</Text>
    }
  }

  const updateProfile = () => {
    const asyncUpdateProfile = async () => {
      setIsLoading(true);
      console.log("updating profile...")
      var { updateFirstName, updateLastName, updateBio, updateLocation, updateGender } = state
      var { updateHeightFt, updateHeightIn, updateHeightCm, updateWeight, updateAge } = state
      var { profilePicture } = context
      var { unitSystem } = context.settings
      unitSystem = unitSystem.toLowerCase()
      var userToken = await getData();

      // turn this into a function that returns a promise later and await/.then it
      try {
        if (updateProfilePic) {
          console.log("uploading profile pic: ", updateProfilePic)
          var formData = new FormData();
          formData.append("profilePic", updateProfilePic)
          // formData.append("currImgHash", profilePicture.etag)
          // check for duplicate pic upload
          // var verifyRes = await fetch(checkDuplicateURL, {
          //   method: "POST",
          //   body: formData,
          // })
          // var verifyJson = await verifyRes.json()
          // if (!verifyJson.success) {
          //   Alert.alert(`Oh No :(`, verifyJson.message, [{ text: "Okay" }]);
          //   setIsLoading(false);
          //   return
          // }
          // console.log(formData.getHeaders())
          const config = {
            // headers: {'Content-Type': 'multipart/form-data'},
            headers: {'Authorization': `Bearer ${userToken}`},
            cancelToken: source.token
          }
          var res = await axios.post(uploadPicURL, {data: formData}, config)
          // var uploadPicRes = await fetch(uploadPicURL, {
          //   method: "POST",
          //   headers: {
          //     'Content-Type': 'multipart/form-data',
          //     'Authorization': `Bearer ${userToken}`
          //   },
          //   body: formData
          // })
          // var uploadPicJson = await uploadPicRes.json()
          if (res.data.success) {
            console.log("successfully updated profile picture!")
          } else {
            console.log(res.data)
            throw new Error(res.data.message)
          }
        }
      } catch(e) {
        console.log(e)
        Alert.alert(`Oh No :(`, e.toString(), [{ text: "Okay" }]);
        setIsLoading(false);
        return;
      }

      // convert height to pure inches
      var height = unitSystem === METRIC ? toEnglishHeight(updateHeightCm) : toInches(updateHeightFt, updateHeightIn)
      // if unit system is metric, convert weight to lbs
      var weight = unitSystem === METRIC ? toEnglishWeight(updateWeight) : updateWeight

      var reqBody = {
        firstName: updateFirstName,
        lastName: updateLastName,
        bio: updateBio,
        location: updateLocation,
        gender: updateGender,
        weight,
        height,
        age: updateAge,
        userToken,
      }
      console.log("updating information: ", reqBody)

      try {
        var updateRes = await fetch(updateProfileURL, {
          method: "POST",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(reqBody),
        })
        var updateJson = await updateRes.json()
        console.log("update json: ", updateJson)
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
        console.error(e)
        Alert.alert(`Oh No :(`, "Something went wrong with the connection to the server. Please try again.", [{ text: "Okay" }]);
        setIsLoading(false);
        return;
      }
    }
    asyncUpdateProfile();
  }

  if (context.mounted) {
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
              headerText={"First Name"}
              placeholder="Your first name..."
              icon="user"
              defaultValue={state.updateFirstName}
              handleChange={handleFirstNameChange}
              didChange={state.firstNameChange}
              errMsg={state.firstNameMsg}
            />
          </View>
          <View style={[styles.textContainer, {borderColor: colors.border}]}>
            <Textbox 
              headerText={"Last Name"}
              placeholder="Your last name..."
              icon="user"
              defaultValue={state.updateLastName}
              handleChange={handleLastNameChange}
              didChange={state.lastNameChange}
              errMsg={state.lastNameMsg}
            />
          </View>
          <View style={[styles.textContainer, {borderColor: colors.border}]}>
            <Textbox 
              headerText={"Bio"}
              placeholder="Your first name..."
              icon="user"
              defaultValue={state.updateBio}
              handleChange={handleBioChange}
              didChange={state.bioChange}
              errMsg={state.bioMsg}
            />
          </View>
          <View style={[styles.textContainer, {borderColor: colors.border}]}>
            <Textbox 
              headerText={"Age"}
              placeholder="Your age..."
              icon="user"
              keyboardType='numeric'
              defaultValue={state.updateAge.toString(10)}
              handleChange={handleAgeChange}
              didChange={state.ageChange}
              errMsg={state.ageMsg}
            />
          </View>
          <View style={[styles.textContainer, {borderColor: colors.border}]}>
            <Textbox 
              headerText={"Location"}
              placeholder="Your city..."
              icon="user"
              defaultValue={state.updateLocation}
              handleChange={handleLocationChange}
              didChange={state.locationChange}
              errMsg={state.locationMsg}
            />
          </View>
          <View style={[styles.textContainer, {borderColor: colors.border}]}>
            <Textbox 
              headerText={"Gender"}
              placeholder="Your gender..."
              icon="user"
              defaultValue={state.updateGender}
              handleChange={handleGenderChange}
              didChange={state.genderChange}
              errMsg={state.genderMsg}
            />
          </View>
          <View style={[styles.textContainer, {borderColor: colors.border}]}>
            {renderHeightInput()}
          </View>
          <View style={[styles.textContainer, {borderColor: colors.border}]}>
            <Textbox 
              headerText={'Weight'}
              placeholder={`Your weight in ${unitSystem === METRIC ? 'kg' : 'lbs'}`}
              icon="user"
              keyboardType='numeric'
              defaultValue={state.updateWeight.toString(10)}
              handleChange={handleWeightChange}
              didChange={state.weightChange}
              errMsg={state.weightMsg}
            />
          </View>
          <Button 
            title={uploadImageTitle}
            buttonStyle={styles.uploadImageButton}
            titleStyle={{color: colors.textColor}}
            onPress={() => {
              ImagePicker.showImagePicker(imagePickerOptions, (response) => {
                if (response.didCancel) {
                  console.log('User cancelled image picker');
                } else if (response.error) {
                  console.log('ImagePicker Error: ', response.error);
                } else if (response.customButton) {
                  console.log('User tapped custom button: ', response.customButton);
                } else {
                  // if (response.type !== 'image/jpeg') {
                  //   Alert.alert(`Oh No :(`, `Image must be`, [{ text: "Okay" }]);
                  //   return;
                  // }
                  const photo = {
                    uri:  Platform.OS === "android" ? response.uri : response.uri.replace("file://", ""),
                    // uri: response.uri,
                    name: response.fileName === null ? "newProfilePicture" : response.fileName,
                    type: response.type
                  };
                  console.log(Object.keys(response))
                  console.log('uploaded photo: ', photo)
                  setUploadImageTitle(`uploaded a new photo`);
                  setUpdateProfilePic(photo);
                  // You can also display the image using data:
                  // const source = { uri: 'data:image/jpeg;base64,' + response.data };
                }
              });
            }}
          />
          <Button
            buttonStyle={[styles.saveButton, {backgroundColor: colors.button}]}
            title="Save changes"
            onPress={updateProfile}
          />
        </ScrollView>
      </SafeAreaView>
    )
  } else {
    // spa hasn't mounted and established context yet
    return (
      <View className="profile-loading-container">
        <Text>loading...</Text>
      </View>
    )
  }
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
    backgroundColor: '#DDDBF1'
  },
  saveButton: {
    marginTop: 30,
  }
})