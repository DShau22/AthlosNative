import React from 'react'
import { View, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Image, ActivityIndicator } from 'react-native'
import { Button } from 'react-native-elements'
import { useHeaderHeight } from '@react-navigation/stack';
import GLOBAL_CONSTANTS from '../GlobalConstants'
import * as Yup from 'yup';
import { launchImageLibrary } from 'react-native-image-picker';
import axios from 'axios';

import { UserDataContext, AppFunctionsContext, AppFunctionsContextType } from "../../Context"
import {
  getToken,
} from '../utils/storage';

import {
  poundsToKg,
  roundToDecimal,
  toEnglishHeight,
  toInches,
  inchesToCm
} from "../utils/unitConverter"
import ENDPOINTS from "../endpoints"
import editProfileSchema from "./EditProfileSchema"
import Textbox from "../nativeLogin/Textbox"
import { useTheme } from '@react-navigation/native'

import FontAwesome from 'react-native-vector-icons/FontAwesome';
FontAwesome.loadFont();
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
MaterialIcon.loadFont();
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
MaterialCommunityIcons.loadFont();
import Feather from 'react-native-vector-icons/dist/Feather';
Feather.loadFont();
import CustomIcon from '../../CustomIcons';
import { Platform } from 'react-native'
import { capitalize } from '../utils/strings';
import { UserDataInterface } from '../generic/UserTypes';
CustomIcon.loadFont();


const updateProfileURL = ENDPOINTS.updateProfile
const uploadPicURL = ENDPOINTS.uploadProfilePic
const { METRIC, ENGLISH } = GLOBAL_CONSTANTS

export default function EditProfile(props) {
  const headerHeight = useHeaderHeight();
  const context = React.useContext(UserDataContext) as UserDataInterface;
  const { colors } = useTheme();
  const { updateLocalUserInfo, setAppState } = React.useContext(AppFunctionsContext) as AppFunctionsContextType;
  const { unitSystem } = context.settings
  const [isLoading, setIsLoading] = React.useState(false);
  const [uploadImageTitle, setUploadImageTitle] = React.useState<string>('upload an image');
  const [updateProfilePic, setUpdateProfilePic] = React.useState<any>(null);
  const [displayProfilePicUrl, setDisplayProfilePicUrl] = React.useState<string>(context.profilePicture.profileURL)
  const [state, setState] = React.useState({
    updateFirstName: capitalize(context.firstName),
    updateLastName: capitalize(context.lastName),
    updateBio: capitalize(context.bio),
    updateAge: context.age,
    updateGender: capitalize(context.gender),
    updateLocation: context.location,
    updateWeight: unitSystem === METRIC ? roundToDecimal(poundsToKg(context.weight), 1) : context.weight,

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
    if (unitSystem === METRIC) {
      // single textbox for cm
      return (
        <Textbox
          headerText="Height (Cm)"
          placeholder="Your height in cm..."
          icon={<MaterialCommunityIcons name='human-male-height' size={20} color={colors.textColor}/>}
          keyboardType='numeric'
          defaultValue={state.updateHeightCm.toString(10)}
          handleChange={handleHeightCmChange}
          didChange={state.heightCmChange}
          errMsg={state.heightCmMsg}
        />
      )
    } else {
      // text boxes for ft and in
      return (
        <View style={styles.englishHeightContainer}>
          <View style={{marginBottom: 20}}>
            <Textbox
              headerText="Height (Ft)"
              placeholder="Ft..."
              icon={<MaterialCommunityIcons name='human-male-height' size={20} color={colors.textColor}/>}
              keyboardType='numeric'
              defaultValue={state.updateHeightFt.toString(10)}
              handleChange={handleHeightFtChange}
              didChange={state.heightFtChange}
              errMsg={state.heightFtMsg}
            />
          </View>
          <View>
            <Textbox
              headerText="Height (In)"
              placeholder="Inches..."
              icon={<MaterialCommunityIcons name='human-male-height' size={20} color={colors.textColor}/>}
              keyboardType='numeric'
              defaultValue={state.updateHeightIn.toString(10)}
              handleChange={handleHeightInChange}
              didChange={state.heightInChange}
              errMsg={state.heightInMsg}
            />
          </View>
        </View>
      )
    }
  }

  const updateProfile = () => {
    const asyncUpdateProfile = async () => {
      setIsLoading(true);
      console.log("updating profile...")
      var { updateFirstName, updateLastName, updateBio, updateLocation, updateGender } = state;
      var { updateHeightFt, updateHeightIn, updateHeightCm, updateWeight, updateAge } = state;
      var { unitSystem } = context.settings;
      unitSystem = unitSystem.toLowerCase();
      var userToken = await getToken();

      // turn this into a function that returns a promise later and await/.then it
      try {
        if (updateProfilePic) {
          var formData = new FormData();
          formData.append("profilePic", updateProfilePic)
          const config = {
            headers: {'Authorization': `Bearer ${userToken}`},
            cancelToken: source.token
          }
          var res = await axios.post(uploadPicURL, {data: formData}, config)
          if (res.data.success) {
            console.log("successfully updated profile picture!");
            // we call updateLocalUserInfo(true) after the second backend update to their text fields
            // await updateLocalUserInfo(true);
          } else {
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
        });
        var updateJson = await updateRes.json();
        if (updateJson.success) {
          await updateLocalUserInfo(true);
          const picUpdateReminder = updateProfilePic ? " It may take some time for your picture to update. You can drag down to refresh you profile to get the most updated changes." : ""
          Alert.alert(`All Done!`, "Successfully updated your profile!" + picUpdateReminder, [{ text: "Okay" }]);
          setIsLoading(false);
        } else {
          Alert.alert(`Oh No :(`, updateJson.message, [{ text: "Okay" }]);
          setIsLoading(false);
          return;
        }
      } catch(e) {
        Alert.alert(`Oh No :(`, "Something went wrong with the connection to the server. Please try again.", [{ text: "Okay" }]);
        setIsLoading(false);
        return;
      }
    }
    asyncUpdateProfile();
  }
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset = {headerHeight + 100} // adjust the value here if you need more padding
      style={styles.container}
    >
      {isLoading ? 
        <View style={{
          height: GLOBAL_CONSTANTS.SCREEN_HEIGHT,
          width: GLOBAL_CONSTANTS.SCREEN_WIDTH,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'black',
          opacity: .4,
          zIndex: 1000,
          position: 'absolute',
        }}>
          <ActivityIndicator size='large'/>
        </View> : null
      }
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={{alignItems: 'center', marginTop: 15}}>
          <Image 
            style={{width: 140, height: 140, borderRadius: 140}}
            source={displayProfilePicUrl.length === 0 ? require('../assets/profile.png'): {uri: displayProfilePicUrl}}
          />
        </View>
        <Button 
          title={uploadImageTitle}
          buttonStyle={[styles.uploadImageButton, {backgroundColor: colors.button}]}
          titleStyle={{color: colors.textColor}}
          onPress={() => {
            launchImageLibrary({ mediaType: 'photo', includeBase64: true }, (response) => {
              if (response.didCancel) {
                console.log('User cancelled image picker');
              } else if (response.errorCode) {
                console.log('ImagePicker Error: ', response.errorCode);
                Alert.alert(`Oh No :(`, `${response.errorCode}`, [{ text: "Okay" }]);
              } else {
                const { assets } = response;
                if (!assets) {
                  Alert.alert(`Whoops`, `Looks like you didn't choose a photo. Please make sure to select a photo`, [{ text: "Okay" }]);
                }
                const asset = assets[0];
                const photo = {
                  // uri: asset.uri.replace("file://", ""),
                  uri: asset.uri,
                  name: asset.fileName === null ? "newProfilePicture" : asset.fileName,
                  type: asset.type,
                  base64: asset.base64,
                  email: context.email,
                };
                console.log(Object.keys(response))
                setUploadImageTitle(`uploaded a new photo`);
                setUpdateProfilePic(photo);
                setDisplayProfilePicUrl(photo.uri)
              }
            });
          }}
        />
        <Textbox 
          containerStyle={[styles.textContainer, {borderColor: colors.border}]}
          headerText={"First Name"}
          placeholder="Your first name..."
          icon={<Feather name='user' color={colors.textColor} size={20}/>}
          defaultValue={state.updateFirstName}
          handleChange={handleFirstNameChange}
          didChange={state.firstNameChange}
          errMsg={state.firstNameMsg}
        />
        <Textbox
          containerStyle={[styles.textContainer, {borderColor: colors.border}]}
          headerText={"Last Name"}
          placeholder="Your last name..."
          icon={<Feather name='user' color={colors.textColor} size={20}/>}
          defaultValue={state.updateLastName}
          handleChange={handleLastNameChange}
          didChange={state.lastNameChange}
          errMsg={state.lastNameMsg}
        />
        <View style={[styles.textContainer, {borderColor: colors.border}]}>
          {renderHeightInput()}
        </View>
        <Textbox 
          containerStyle={[styles.textContainer, {borderColor: colors.border}]}
          headerText={`Weight (${unitSystem === METRIC ? 'kg' : 'lbs'})`}
          placeholder={`Your weight in ${unitSystem === METRIC ? 'kg' : 'lbs'}`}
          icon={<MaterialCommunityIcons name='scale' size={20} color={colors.textColor}/>}
          keyboardType='numeric'
          defaultValue={state.updateWeight.toString(10)}
          handleChange={handleWeightChange}
          didChange={state.weightChange}
          errMsg={state.weightMsg}
        />
        <Textbox
          containerStyle={[styles.textContainer, {borderColor: colors.border}]}
          headerText={"Age"}
          placeholder="Your age..."
          icon={<FontAwesome name='birthday-cake' size={20} color={colors.textColor}/>}
          keyboardType='numeric'
          defaultValue={state.updateAge.toString(10)}
          handleChange={handleAgeChange}
          didChange={state.ageChange}
          errMsg={state.ageMsg}
        />
        <Textbox
          containerStyle={[styles.textContainer, {borderColor: colors.border}]}
          headerText={"Gender"}
          placeholder="Your gender..."
          icon={<FontAwesome name='transgender-alt' size={20} color={colors.textColor}/>}
          defaultValue={state.updateGender}
          handleChange={handleGenderChange}
          didChange={state.genderChange}
          errMsg={state.genderMsg}
        />
        {/* <View style={[styles.textContainer, {borderColor: colors.border}]}>
          <Textbox 
            headerText={"Bio"}
            placeholder="Your first name..."
            icon="user"
            defaultValue={state.updateBio}
            handleChange={handleBioChange}
            didChange={state.bioChange}
            errMsg={state.bioMsg}
          />
        </View> */}
        {/* <View style={[styles.textContainer, {borderColor: colors.border}]}>
          <Textbox 
            headerText={"Location"}
            placeholder="Your city..."
            icon="user"
            defaultValue={state.updateLocation}
            handleChange={handleLocationChange}
            didChange={state.locationChange}
            errMsg={state.locationMsg}
          />
        </View> */}
        <Button
          buttonStyle={[styles.saveButton, {backgroundColor: colors.button, marginBottom: 20}]}
          title="Save changes"
          onPress={updateProfile}
        />
      </ScrollView>
    </KeyboardAvoidingView>
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
  englishHeightContainer: {
    flexDirection: 'column',
    // alignItems: 'center',
  },
  uploadImageButton: {
    marginTop: 20
  },
  saveButton: {
    margin: 30,
  }
})