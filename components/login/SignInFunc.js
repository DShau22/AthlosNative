import React from 'react'
import { Formik, Form } from 'formik'
import * as Yup from 'yup';
import { textField, checkBox } from '../generic/fieldComponents'
export default function SignInFunc(props) {
  const validationSchema = Yup.object({
    signInEmail: Yup.string()
      .required('Cannot be empty'),
    signInPassword: Yup.string()
      .required('Cannot be empty'),
    remember: Yup.string()
      .max(250, "Must be 250 characters or less"),
  })
  return (
    <div className='sign-in-htm'>
      <Formik
        initialValues={{
          signInEmail: '',
          signInPassword: '',
          remember: false,
        }}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting }) => {
          console.log(values)
          props.onSignIn(values)
          setSubmitting(false)
        }}
      >
        {({ errors, touched }) => (
          <Form>
            {textField('Email', 'text', 'signInEmail', 'input-field', errors.signInEmail, touched.signInEmail)}
            {textField('Password', 'password', 'signInPassword', 'input-field', errors.signInPassword, touched.signInPassword)}
            {checkBox('Keep me signed in', 'remember', 'icon')}
            <div className="group">
              <input type="submit" className="button" value="Sign In" id="signInButton" />
            </div>
          </Form>
        )}
      </Formik>
    </div>
  )
}
