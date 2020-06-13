function validateSignUpInputs(state) {
  var {
    signUpEmail,
    signUpPassword,
    signUpPasswordConf,
    signUpFirstName,
    signUpLastName,
    signUpUserName,
  } = state
  let inputs = [
    signUpEmail,
    signUpPassword,
    signUpPasswordConf,
    signUpFirstName,
    signUpLastName,
    signUpUserName,
  ]
  
  inputs.forEach((input, idx) => {
  })
}

module.exports = {
  validateSignUpInputs,
}