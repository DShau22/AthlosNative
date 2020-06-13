// given the url in props.match, shows the title on the header

function displayTitle(url) {
  const root = '/app'
  if (url === `${root}`) {
    return "Home"
  } else if (/community/.test(url)) {
    return "Community"
  } else if (/fitness/.test(url)) {
    return "Fitness"
  } else if (/profile/.test(url)) {
    return "Profile"
  } else if (/settings/.test(url)) {
    return "Settings"
  } else {
    return "unknown"
  }
}

module.exports = { displayTitle }