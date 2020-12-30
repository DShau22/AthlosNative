// these functions convert to the system that you pass in
// most of these are for the edit profile form fields
const kgToLbs = (2.20462 / 1.0)
const lbsToKg = (1.0 / 2.20462)
const inToCm = (2.54 / 1.0)
const cmToIn = (1.0 / 2.54)
const ftToCm = (30.48 / 1.0)

// converts from metric to english weight (kg to lbs)
const toEnglishWeight = (weightInKg) => {
  if (weightInKg === '') weightInKg = 0
  return parseFloat(weightInKg) * kgToLbs
}

// converts from metric to english height (cm to in)
const toEnglishHeight = (heightInCm) => {
  if (heightInCm === '') heightInCm = 0
  return parseFloat(heightInCm) * cmToIn
}

// returns array [ft, in] given height in inches
const toFtAndInches = (inches) => {
  if (inches === '') inches = 0
  return [Math.floor(parseFloat(inches) / 12), parseFloat(inches) % 12]
}

// returns inches given height in ft, inches
const toInches = (ft, inches) => {
  if (ft === '') ft = 0
  if (inches === '') inches = 0
  return 12 * parseFloat(ft) + parseFloat(inches)
}

// converts inches to centimeters
const inchesToCm = (inches) => {
  if (inches === '') inches = 0
  return parseFloat(inches) * inToCm
}

// converts pounds to kilograms
const poundsToKg = (lbs) => {
  if (lbs === '') lbs = 0
  return parseFloat(lbs) * lbsToKg
}

// system is the system you wanna display in
// returns 'num kg' or 'num lbs'
function weightConvert(system, weight) {
  if (!system) return ""
  var parsed = weight.split(" ") // [num units]
  var units = parsed[1]
  weight = parsed[0]
  system = system.toLowerCase()
  var convertedWeight = weight
  if (system === "english" && units === "kg") {
    //convert kg to lbs, 1kg = 2.20462 lbs
    convertedWeight = Math.round(parseInt(weight) * kgToLbs)
    units = "lbs"
  } else if (system === "metric" && units === "lbs") {
    // convert lbs to kg
    convertedWeight = Math.round(parseInt(weight) * lbsToKg)
    units = "kg"
  }
  return convertedWeight.toString() + " " + units
}

// system is the system you wanna display in
// returns 'num ft num in' or 'num cm'
function heightConvert(system, height) {
  if (!system) return ""
  var parsed = height.split(" ") // either [num, ft, num, in] or [num, cm]
  system = system.toLowerCase()
  var convertedHeight = height
  if (system === "english" && parsed[1] === "cm") {
    //convert cm to in, then in to ft and in
    var heightInCm = parsed[0]
    convertedHeight = `${parseInt(heightInCm) * cmToIn} in`
  } else if (system === "metric" && parsed[1] === "ft") {
    // convert ft, in to cm
    let feet = parseInt(parsed[0])
    let inches = parseInt(parsed[2])
    convertedHeight = `${Math.round((feet * ftToCm) + (inches * inToCm)).toString()} cm`
  }
  return convertedHeight.toString()
}

// takes height in inches and returns 'num ft num in'
function englishHeight(height) {
  var feet = Math.floor(height / 12)
  var inches = Math.round(height - (12 * feet))
  return `${feet} ft ${inches} in`
}

// FOR RAW DOUBLES
// the system that the height passed in is in
function rawHeightConvert(system, verticalHeight) {
  // want it in metric system
  var converted = (system === "metric") ? verticalHeight * inToCm : verticalHeight * cmToIn
  return parseFloat(converted).toFixed(2)
}

export { 
  weightConvert,
  heightConvert,
  englishHeight,
  rawHeightConvert,
  toEnglishWeight,
  toEnglishHeight,
  toFtAndInches,
  toInches,
  inchesToCm,
  poundsToKg,
}
