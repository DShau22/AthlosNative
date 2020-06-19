import * as Yup from 'yup';
function equalTo(ref, msg) {
  return Yup.mixed().test({
    name: 'equalTo',
    exclusive: false,
    message: msg || '${path} must be the same as ${reference}',
    params: {
      reference: ref.path,
    },
    test: function(value) {
      return value === this.resolve(ref);
    },
  });
}
Yup.addMethod(Yup.string, 'equalTo', equalTo);

const signUpValidationSchema = Yup.object({
  signUpEmail: Yup.string()
    .required('Cannot be empty')
    .email('Please enter a valid email')
    .max(100, 'Must be less than 100 characters long'),
  signUpPassword: Yup.string()
    .required('Cannot be empty')
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d)[!@#$%^&*-=.A-Za-z\d]{8,}$/,
      "Must contain 8 characters, one uppercase, one lowercase, one number. Only !@#$%^&*-=. special characters allowed."
    ),
  signUpPasswordConf: Yup.string()
    .required('Cannot be empty')
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d)[!@#$%^&*-=.A-Za-z\d]{8,}/,
      "Must contain 8 characters, one uppercase, one lowercase, one number. Only !@#$%^&*-=. special characters allowed."
    )
    .oneOf([Yup.ref('signUpPassword'), null], 'Passwords must match ya fool'),
  signUpFirstName: Yup.string()
    .required('Cannot be empty')
    .matches("^[a-zA-Z]+$", "Must only contains letters"),
  signUpLastName: Yup.string()
    .required('Cannot be empty')
    .matches("^[a-zA-Z]+$", "Must only contains letters"),
  signUpUsername: Yup.string()
    .required('Cannot be empty')
    .matches("^[a-zA-Z0-9.-]+$", "Must only contains letters, numbers, dashes, or periods"),
})

const passwordValidationSchema = Yup.object({
  
})

module.exports = {
  signUpValidationSchema
}