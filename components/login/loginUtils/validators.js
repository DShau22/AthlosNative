function anyEmpty(state) {
  var {
    signUpEmail,
    signUpPassword,
    signUpPasswordConf,
    signUpFirstName,
    signUpLastName,
    signUpUserName,
  } = state
  return !signUpEmail || !signUpPassword || !signUpPasswordConf || !signUpFirstName || !signUpLastName || !signUpUserName
}

function validateSignUp(state) {
  var {
    // signUpEmail,
    signUpPassword,
    signUpPasswordConf,
    // signUpFirstName,
    // signUpLastName,
    // signUpUserName,
  } = state
  var resJson = {messages: [], success: true}
  // guarentee that all inputs are filled in
  if (anyEmpty(state)) {
    resJson.messages.push('please fill out all inputs')
    resJson.success = false
    return resJson
  }
  // password and confirmation are the same
  if (signUpPassword !== signUpPasswordConf) {
    resJson.messages.push('passwords must match')
    resJson.success = false
  }
  return resJson
}

module.exports = {
  validateSignUp
}