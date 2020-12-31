import * as Yup from 'yup';

const editGoalsSchema = Yup.object({
  goalSteps: Yup.number()
    .typeError('Must be a number')
    .positive("Must be greater than 0")
    .max(1000000000, "That's a bit ambitious...")
    .required('Cannot be empty'),
  goalLaps: Yup.number()
    .typeError('Must be a number')
    .positive("Must be greater than 0")
    .max(1000000000, "That's a bit ambitious...")
    .required('Cannot be empty'),
  goalVertical: Yup.number()
    .typeError('Must be a number')
    .positive("Must be greater than 0")
    .max(1000000000, "That's a bit ambitious...")
    .required('Cannot be empty'),
  goalCaloriesBurned: Yup.number()
    .typeError('Must be a number')
    .positive("Must be greater than 0")
    .max(1000000000, "That's a bit ambitious...")
    .required('Cannot be empty'),
  goalWorkoutTime: Yup.number()
    .typeError('Must be a number')
    .positive("Must be greater than 0")
    .max(1000000000, "That's a bit ambitious...")
    .required('Cannot be empty'), 
})
export default editGoalsSchema