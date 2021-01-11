import * as Yup from 'yup';

const splitValidationSchema = Yup.object({
  split: Yup.number()
    .typeError('Must be a number')
    .positive("Must be greater than 0")
    .max(999, "You'll probably finish a 50 faster than this")
    .integer("Must be a whole number")
});

export {
  splitValidationSchema
}