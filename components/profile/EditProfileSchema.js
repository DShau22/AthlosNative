import * as Yup from 'yup';

const editProfileSchema = Yup.object({
  updateFirstName: Yup.string()
    .max(15, 'Must be 15 characters or less')
    .required('Cannot be empty'),
  updateLastName: Yup.string()
    .max(20, 'Must be 20 characters or less')
    .required('Cannot be empty'),
  updateBio: Yup.string()
    .max(250, "Must be 250 characters or less"),
  updateAge: Yup.number()
    .typeError('Age must be a number')
    .positive("Must be greater than 0")
    .max(150, "You're not THAT old are you...")
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
export default editProfileSchema