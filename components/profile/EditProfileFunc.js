import React, { useContext } from 'react'
import SpaContext from "../Context"
import { getToken } from '../utils/storage'
import { Formik, Form } from 'formik'
import * as Yup from 'yup';
import "./css/editProfile.css"
import { weightConvert, heightConvert, englishHeight } from "../utils/unitConverter"
import { textField, textArea, weightDisplay, heightDisplay } from '../generic/fieldComponents'
import ENDPOINTS from "../endpoints"
const updateProfileURL = ENDPOINTS.updateProfile
const checkDuplicateURL = ENDPOINTS.checkDuplicatePic
const uploadPicURL = ENDPOINTS.uploadProfilePic
const imgAlt = "./default_profile.png"

export default function EditProfileFunc(props) {
  const context = useContext(SpaContext);
  const validationSchema = Yup.object({
    updateFirstName: Yup.string()
      .max(15, 'Must be 15 characters or less')
      .required('Cannot be empty'),
    updateLastName: Yup.string()
      .max(20, 'Must be 20 characters or less')
      .required('Cannot be empty'),
    updateBio: Yup.string()
      .max(250, "Must be 250 characters or less"),
    updateAge: Yup.number()
      .positive("Must be greater than 0")
      .integer("Must be a whole number"),
    updateLocation: Yup.string()
      .max(250, 'Must be 250 characters or less'),
    updateGender: Yup.string()
      .max(50, 'Must be 50 characters or less'),
    updateHeightCm: Yup.number()
      .positive("Must be greater than 0")
      .integer("Must be a whole number"),
    updateHeightIn: Yup.number()
      .positive("Must be greater than 0")
      .integer("Must be a whole number"),
    updateHeightFt: Yup.number()
      .positive("Must be greater than 0")
      .integer("Must be a whole number"),
    updateWeight: Yup.number()
      .positive("Must be greater than 0")
      .integer("Must be a whole number"),
  })
  async function updateProfile(formValues) {
    alert("updating")
    var { updateFirstName, updateLastName, updateBio, updateLocation, updateGender } = formValues
    var { updateHeightFt, updateHeightIn, updateHeightCm, updateWeight, updateAge } = formValues
    var { file } = formValues
    var { profilePicture } = context
    var { unitSystem } = context.settings
    unitSystem = unitSystem.toLowerCase()
    var userToken = getToken()

    var formData = new FormData();

    formData.append("profilePic", file)
    formData.append("currImgHash", profilePicture.etag)

    // check to see if file was already uploaded in the past
    // turn this into a function that returns a promise later and await/.then it
    if (file) {
      var verifyRes = await fetch(checkDuplicateURL, {
        method: "POST",
        body: formData,
      })
      var verifyJson = await verifyRes.json()
      if (!verifyJson.success) {
        alert(verifyJson.message)
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
        alert("successfully updated profile picture!")
      }
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
      alert("successfully updated profile")
      // refresh the page to get new context n everything
      window.location.reload()
    } else {
      alert(updateJson.message)
    }
  }

  var { firstName, lastName, bio, age, location, gender, height, weight } = context
  const { unitSystem } = context.settings
  weight = weightConvert(unitSystem, weight)
  height = heightConvert(unitSystem, height)
  console.log(context)
  if (context.mounted) {
    return (
      <div className="edit-profile-container">
        <Formik
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
              <div className='prof-pic-container'>
                <img src={context.profilePicture.profileURL} width="300" height="300" alt={imgAlt}/>
                <label htmlFor='submit-prof-pic' className='custom-file-upload'>
                  <input
                    id='submit-prof-pic'
                    type="file"
                    onChange={(event) => {
                      setFieldValue("file", event.currentTarget.files[0]);
                    }}
                    accept="image/x-png,image/jpeg"
                  />
                  Upload an Image
                </label>
              </div>
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
              <div className='submit-container'>
                <input type="submit" className="button" value="Update Profile" id="update-button"/>
                <div className='cancel' onClick={props.closePopup}>Cancel</div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    )
  } else {
    // spa hasn't mounted and established context yet
    return (
      <div className="profile-loading-container">
        <span>loading...</span>
      </div>
    )
  }
}
