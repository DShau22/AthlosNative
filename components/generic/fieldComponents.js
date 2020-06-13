import React from 'react'
import { Field, ErrorMessage } from 'formik'
// specifically for edit profile page
const inputErrorStyle = {'border': '2px solid rgb(255, 162, 162)'}
const errorMsgStyle = { 'color' : 'rgb(255, 162, 162)', 'fontSize': '10pt', 'width': '90%', 'textAlign': 'left' }

function weightDisplay(name, className, unitSystem, errors) {
  return (
    <div className='field-container'>
      <label htmlFor='updateWeight'>Weight</label>
      <div className='weight-container'>
        <Field 
          style={errors.updateWeight ? inputErrorStyle : null}
          name={name}
          className={className}
          type="number"
        />
        <span className='weight-units'>{(unitSystem === "english") ? "lbs" : "kg"}</span>
      </div>
      <ErrorMessage name={name}>{msg => <div style={errorMsgStyle}>{msg}</div>}</ErrorMessage>
    </div>
  )
}

// specifically for edit profile page
function heightDisplay(name, className, unitSystem, errors) {
  if (unitSystem === "English") {
    return (
      <div className='height-wrapper'>
        <label htmlFor='height'>Height</label>
        <div id='height' className="field-container">
          <div className='height-container'>
            <Field 
              style={errors.updateHeightFt ? inputErrorStyle : null}
              name='updateHeightFt'
              className={className}
              type="number"
            />
            <span className='height-units ft'>ft</span>
          </div>
          <ErrorMessage name='updateHeightFt'>{msg => <div style={errorMsgStyle}>{msg}</div>}</ErrorMessage>
          <div className='height-container'>
            <Field 
              style={errors.updateHeightIn? inputErrorStyle : null}
              name='updateHeightIn'
              className={className}
              type="number"
            />
            <span className='height-units in'>in</span>
          </div>
          <ErrorMessage name='updateHeightIn'>{msg => <div style={errorMsgStyle}>{msg}</div>}</ErrorMessage>
        </div>
      </div>
    )
  } else {
    return (
      <div className='height-wrapper'>
        <label htmlFor='height'>Height</label>
        <div className="field-container">
          <div className='height-container'>
            <Field 
              style={errors.updateHeightCm ? inputErrorStyle : null}
              name='updateHeightCm'
              className={className}
              type="number"
            />
            <span className='height-units cm'>cm</span>
          </div>
          <ErrorMessage name='updateHeightCm'>{msg => <div style={errorMsgStyle}>{msg}</div>}</ErrorMessage>
        </div>
      </div>
    )
  }
}

function textField(label, type, name, className, error, touched) {
  return (
    <div className='field-container group'>
      <label className='label' htmlFor={name}>{label}</label>
      <Field 
        style={error && touched ? inputErrorStyle : null}
        name={name}
        className={className}
        type={type}
      />
      <ErrorMessage name={name}>{msg => <div style={errorMsgStyle}>{msg}</div>}</ErrorMessage>
    </div>
  )
}
function textArea(label, name, className, error, touched) {
  return (
    <div className='field-container group'>
      <label className='label' htmlFor={name}>{label}</label>
      <Field
        name={name}
        className={className}
        type="text"
        as='textarea'
        style={error && touched ? inputErrorStyle : null}
      />
      <ErrorMessage style={errorMsgStyle} name={name}/>
    </div>
  )
}
function checkBox(label, name, spanClassName) {
  return (
    <div className='group'>
      <Field
        type="checkbox"
        name={name}
        id='check'
        className='check'
      />
      <label htmlFor="check">
        <span className={spanClassName}></span> {label}
      </label>
    </div>
  )
}
export {
  weightDisplay,
  heightDisplay,
  textArea,
  textField,
  checkBox,
}