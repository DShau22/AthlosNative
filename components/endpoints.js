
const devServerURL = "http://localhost:8080"
const prodServerURL = "https://us-central1-athlos-live-beta.cloudfunctions.net/athlos-server"
// toggle on/off for if working with dev env or prod
const dev = true
const serverURL = dev ? devServerURL : prodServerURL
const ENDPOINTS = {
    server: `${serverURL}`,
    // login, signup, and emails
    emailVerify: `${serverURL}/api/account/verify`,
    signUp: `${serverURL}/api/account/signup`,
    signIn: `${serverURL}/api/account/signin`,
    tokenToID: `${serverURL}/tokenToID`,
    confirm: `${serverURL}/confirmation`,
    passwordReset: `${serverURL}/confPasswordReset`,
    forgotPassword: `${serverURL}/forgotPassword`,

    // friend stuff
    sendFriendReq: `${serverURL}/sendFriendReq`,
    acceptFriendReq: `${serverURL}/acceptRequest`,

    // search stuff
    getSearchUser: `${serverURL}/getSearchUser`,
    searchUser: `${serverURL}/searchUser`,
    getSearchUserBasicInfo: `${serverURL}/getSearchUserBasicInfo`,
    getSearchUserFriends: `${serverURL}/getSearchUserFriends`,
    getSearchUserFitness: `${serverURL}/getSearchUserFriends`,

    // user data and info
    getData: `${serverURL}/data`,
    getUserInfo: `${serverURL}/getUserInfo`,
    updateProfile: `${serverURL}/updateProfile`,
    checkDuplicatePic: `${serverURL}/checkDuplicatePic`,
    uploadProfilePic: `${serverURL}/uploadProfilePic`,
    getBests: `${serverURL}/getBests`,
    getProfilePic: `${serverURL}/getProfilePic`,
    getUsername: `${serverURL}/getUsername`,
    updateSettings: `${serverURL}/updateSettings`,
    upload: `${serverURL}/upload`,
}

export default ENDPOINTS