import React from 'react'
import { Formik, Form } from 'formik'
import * as Yup from 'yup';
import { textField } from '../generic/fieldComponents'

export default function SignUpFunc(props) {
  const validationSchema = Yup.object({
    signUpEmail: Yup.string()
      .required('Cannot be empty')
      .email('Please enter a valid email')
      .max(100, 'Must be less than 100 characters long'),
    signUpPassword: Yup.string()
      .required('Cannot be empty')
      .matches(
        /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
        "Must contain 8 characters, one uppercase, one lowercase, and one number"
      ),
    signUpPasswordConf: Yup.string()
      .required('Cannot be empty')
      .matches(
        /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}/,
        "Must contain 8 characters, one uppercase, one lowercase, one number"
      )
      .oneOf([Yup.ref('signUpPassword'), null], 'Passwords must match'),
    signUpFirstName: Yup.string()
      .required('Cannot be empty'),
    signUpLastName: Yup.string()
      .required('Cannot be empty'),
    signUpUsername: Yup.string()
      .required('Cannot be empty'),
  })
  return (
    <div className="sign-up-htm">
      <Formik
        initialValues={{
          signUpEmail: '',
          signUpPassword: '',
          signUpPasswordConf: '',
          signUpFirstName: '',
          signUpLastName: '',
          signUpUsername: '',
        }}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting }) => {
          console.log(values)
          props.onSignUp(values)
          setSubmitting(false)
        }}
      >
        {({ errors, touched }) => (
          <Form>
            {textField(
              'Email',
              'text',
              'signUpEmail',
              'input-field',
              errors.signUpEmail,
              touched.signUpEmail
            )}
            {textField('Password', 'password', 'signUpPassword', 'input-field', errors.signUpPassword, touched.signUpPassword)}
            {textField('Repeat Password', 'password', 'signUpPasswordConf', 'input-field', errors.signUpPasswordConf, touched.signUpPasswordConf)}
            {textField('First Name', 'text', 'signUpFirstName', 'input-field', errors.signUpFirstName, touched.signUpFirstName)}
            {textField('Last Name', 'text', 'signUpLastName', 'input-field', errors.signUpLastName, touched.signUpLastName)}
            {textField('Username', 'text', 'signUpUsername', 'input-field', errors.signUpUsername, touched.signUpUsername)}
            <div className="group">
              <input type="submit" className="button" value="Sign Up" id="signInButton" />
            </div>
          </Form>
        )}
      </Formik>
    </div>
  )
}
