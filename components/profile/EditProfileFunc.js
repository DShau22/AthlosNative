import React from 'react'
import { UserDataContext } from "../../Context"
import { View, StyleSheet, Alert } from 'react-native'
import { Button } from 'react-native-elements'
import { Text } from 'react-native-elements'
import { getData } from '../utils/storage'

import * as Yup from 'yup';
import ImagePicker from 'react-native-image-picker';
const imagePickerOptions = {
  title: 'Select a photo',
  customButtons: [{ name: 'fb', title: 'Choose Photo from Facebook' }],
  storageOptions: {
    skipBackup: true,
    path: 'images',
  },
};

import { weightConvert, heightConvert, englishHeight } from "../utils/unitConverter"
import { textField, textArea, weightDisplay, heightDisplay } from '../generic/fieldComponents'
import ENDPOINTS from "../endpoints"
import editProfileSchema from "./EditProfileSchema"
import Textbox from "../nativeLogin/Textbox"
import Spinner from 'react-native-loading-spinner-overlay';

const updateProfileURL = ENDPOINTS.updateProfile
const checkDuplicateURL = ENDPOINTS.checkDuplicatePic
const uploadPicURL = ENDPOINTS.uploadProfilePic
const imgAlt = "./default_profile.png"

export default function EditProfileFunc(props) {
  const context = React.useContext(UserDataContext);
  const [isLoading, setIsLoading] = React.useState(false);
  const [state, setState] = React.useState({
    updateFirstName: context.firstName,
    updateLastName: context.lastName,
    updateBio: context.bio,
    updateAge: context.age,
    updateGender: context.gender,
    updateHeight: context.height,
    updateLocation: context.location,
    updateProfilePic: {},

    // for the sake of now, will change later maybe
    updateHeightFt: '',
    updateHeightCm: '',
    updateHeightIn: '',

    firstNameChange: false,
    lastNameChange: false,
    bioChange: false,
    ageChange: false,
    genderChange: false,
    heightChange: false,
    locationChange: false,
    profilePicChagne: false,

    firstNameMsg: '',
    lastNameMsg: '',
    bioMsg: '',
    ageMsg: '',
    genderMsg: '',
    heightMsg: '',
    locationMsg: '',
    profilePicMsg: '',
  });

  const handleFirstNameChange = (val) => {
    console.log(val);
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
    console.log(val);
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
    console.log(val);
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
    console.log(val);
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
    console.log(val);
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
    console.log(val);
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
  // const handleHeightChange = (val) => {
  //   console.log(val);
  //   Yup.reach(editProfileSchema, "updateHeightCm").validate(val)
  //     .then(function(isValid) {
  //       setState(prevState => ({
  //         ...prevState,
  //         updateLastName: val,
  //         lastNameChange: val.length !== 0,
  //         lastNameMsg: ''
  //       }));
  //     })
  //     .catch(function(e) {
  //       console.log(e);
  //       setState(prevState => ({
  //         ...prevState,
  //         lastNameMsg: e.errors[0],
  //       }));
  //     })
  // }

  const updateProfile = () => {
    const asyncUpdateProfile = async () => {
      setIsLoading(true);
      console.log("updating profile...")
      var { updateFirstName, updateLastName, updateBio, updateLocation, updateGender } = state
      var { updateHeightFt, updateHeightIn, updateHeightCm, updateWeight, updateAge } = state
      var { updateProfilePic } = state
      var { profilePicture } = context
      var { unitSystem } = context.settings
      unitSystem = unitSystem.toLowerCase()
      var userToken = await getData();

      var formData = new FormData();

      formData.append("profilePic", updateProfilePic)
      formData.append("currImgHash", profilePicture.etag)
      // check out what this logs in the backend...
      if (updateProfilePic) formData.append("product[images_attributes[0][file]]", updateProfilePic);

      // check to see if file was already uploaded in the past
      // turn this into a function that returns a promise later and await/.then it
      try {
        if (updateProfilePic) {
          var verifyRes = await fetch(checkDuplicateURL, {
            method: "POST",
            body: formData,
          })
          var verifyJson = await verifyRes.json()
          if (!verifyJson.success) {
            Alert.alert(`Oh No :(`, verifyJson.message, [{ text: "Okay" }]);
            return
          }
          var headers = new Headers()
          headers.append("authorization", `Bearer ${userToken}`)
          var uploadPicRes = await fetch(uploadPicURL, {
            method: "POST",
            headers,
            body: formData
          })
          var uploadPicJson = await uploadPicRes.json()
          if (uploadPicJson.success) {
            console.log("successfully updated profile picture!")
          }
        }
      } catch(e) {
        Alert.alert(`Oh No :(`, "Something went wrong with the connection to the server. Please try again.", [{ text: "Okay" }]);
        setIsLoading(false);
      }

      // if unit system is English, convert ft and in into 1 number in inches
      var weight = unitSystem === 'metric' ? `${updateWeight} kg` : `${updateWeight} lbs`
      var height = unitSystem === 'metric' ? `${updateHeightCm} cm` : `${updateHeightFt} ft ${updateHeightIn} in`
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

      try {
        var updateRes = await fetch(updateProfileURL, {
          method: "POST",
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(reqBody),
        })
        var updateJson = await updateRes.json()
        console.log("aioajweif", updateJson)
        if (updateJson.success) {
          Alert.alert(`All Done!`, "Successfully updated your profile!", [{ text: "Okay" }]);
          setIsLoading(false);
          // refresh the page to get new context n everything aka make a request again to the server or update
          // async storage here!
  
        } else {
          Alert.alert(`Oh No :(`, updateJson.message, [{ text: "Okay" }]);
          setIsLoading(false);
        }
      } catch(e) {
        Alert.alert(`Oh No :(`, "Something went wrong with the connection to the server. Please try again.", [{ text: "Okay" }]);
        setIsLoading(false);
      }
    }
    asyncUpdateProfile();
  }

  var { firstName, lastName, bio, age, location, gender, height, weight } = context
  const { unitSystem } = context.settings
  weight = weightConvert(unitSystem, weight)
  height = heightConvert(unitSystem, height)
  if (context.mounted) {
    return (
      <>
        <Spinner
          visible={isLoading}
          textContent={'Loading...'}
          textStyle={styles.spinnerTextStyle}
        />
        <Textbox 
          headerText={"First Name"}
          placeholder="Your first name..."
          icon="user"
          defaultValue={state.updateFirstName}
          handleChange={handleFirstNameChange}
          didChange={state.firstNameChange}
          errMsg={state.firstNameMsg}
        />
        <Textbox 
          headerText={"Last Name"}
          placeholder="Your last name..."
          icon="user"
          defaultValue={state.updateLastName}
          handleChange={handleLastNameChange}
          didChange={state.lastNameChange}
          errMsg={state.lastNameMsg}
        />
        <Textbox 
          headerText={"Bio"}
          placeholder="Your first name..."
          icon="user"
          defaultValue={state.updateBio}
          handleChange={handleBioChange}
          didChange={state.bioChange}
          errMsg={state.bioMsg}
        />
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
        <Textbox 
          headerText={"Location"}
          placeholder="Your city..."
          icon="user"
          defaultValue={state.updateLocation}
          handleChange={handleLocationChange}
          didChange={state.locationChange}
          errMsg={state.locationMsg}
        />
        <Textbox 
          headerText={"Gender"}
          placeholder="Your gender..."
          icon="user"
          defaultValue={state.updateGender}
          handleChange={handleGenderChange}
          didChange={state.genderChange}
          errMsg={state.genderMsg}
        />
        <Text>ADD SOMETHING FOR HEIGHT</Text>
        {/* <Textbox
          headerText={"Height (conditional on unit system)"}
          placeholder="Your gender..."
          icon="user"
          handleChange={handleFirstNameChange}
          didChange={data.firstNameChange}
          errMsg={data.firstNameMsg}
        /> */}
        <Text>IMAGE PICKERS</Text>
        <Button 
          title="upload an image"
          onPress={() => {
            ImagePicker.showImagePicker(imagePickerOptions, (response) => {
              if (response.didCancel) {
                console.log('User cancelled image picker');
              } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
              } else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
              } else {
                const photo = { uri: response.uri, name: 'image.jpg', type: 'image/jpeg' };
                console.log('uploaded photo: ', photo)
                setState(prevState => ({
                  ...prevState,
                  profilePicture: photo
                }))
                // You can also display the image using data:
                // const source = { uri: 'data:image/jpeg;base64,' + response.data };
              }
            });
          }}
        />
        <Button
          title="Save changes"
          onPress={updateProfile}
        />
        {/* <Formik
          initialValues={{
            updateFirstName: firstName,
            updateLastName: lastName,
            updateBio: bio,
            updateAge: age,
            updateLocation: location,
            updateGender: gender,
            updateHeightCm: unitSystem === 'metric' ? height.split(' ')[0] : '',
            updateHeightIn: unitSystem === 'english' ? englishHeight(height).split(' ')[0] : '', // num ft num in
            updateHeightFt: unitSystem === 'english' ? englishHeight(height).split(' ')[2] : '', // num ft num in
            updateWeight: weight ? weight.split(' ')[0] : '' // weight format is 'weight units'
          }}
          validationSchema={validationSchema}
          onSubmit={(values, { setSubmitting }) => {
            console.log(values)
            updateProfile(values)
            setSubmitting(false)
          }}
        >
          {({ errors, touched, setFieldValue }) => (
            <Form>
              <View className='prof-pic-container'>
                <Image style={styles.image} source={{uri: context.profilePicture.profileURL}}/>
                  <TextInput
                    type="file"
                    onChange={(event) => {
                      setFieldValue("file", event.currentTarget.files[0]);
                    }}
                    accept="image/x-png,image/jpeg"
                  />
              </View>
              {textField('First Name', 'text', 'updateFirstName', 'field', errors.updateFirstName, touched.updateFirstName)}
              {textField('Last Name', 'text', 'updateLastName', 'field', errors.updateLastName, touched.updateLastName)}
              {textArea('Bio', 'updateBio', 'field', errors.updateBio, touched.updateBio)}
              {textField('Gender', 'text', 'updateGender', 'field', errors.updateGender, touched.updateGender)}
              {textField('Age', 'text', 'updateAge', 'field', errors.updateAge, touched.updateAge)}
              {textField('Location', 'text', 'updateLocation', 'field', errors.updateLocation, touched.updateLocation)}
              {weightDisplay('updateWeight', 'field', unitSystem, errors)}
              {heightDisplay(
                'updateHeight', //revisit how this is implemented cuz there could be 3 different things
                'field',
                unitSystem,
                errors,
              )}
              <View className='submit-container'>
                <Text className='cancel' onClick={props.closePopup}>Cancel</Text>
              </View>
            </Form>
          )}
        </Formik> */}
      </>
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
  image: {
    width: 50,
    height: 50,
  },
  spinnerTextStyle: {
    color: "black"
  }
})