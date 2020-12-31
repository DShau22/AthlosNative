
const devServerURL = "http://localhost:8080"
// const devServerURL = "http://10.0.2.2:8080"
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

    // community stuff
    sendFriendReq: `${serverURL}/sendFriendReq`,
    acceptFriendReq: `${serverURL}/acceptRequest`,
    acceptFollowerRequest: `${serverURL}/acceptFollowerRequest`,
    rejectFollowerRequest: `${serverURL}/rejectFollowerRequest`,
    removeFollower: `${serverURL}/removeFollower`,

    cancelFollowRequest: `${serverURL}/cancelFollowRequest`,
    stopFollowing: `${serverURL}/stopFollowing`,
    unfollow: `${serverURL}/unfollow`,
    follow: `${serverURL}/follow`,

    // search stuff
    getSearchUser: `${serverURL}/getSearchUser`,
    searchUser: `${serverURL}/searchUser`,
    getSearchUserPeople: `${serverURL}/getSearchUserPeople`,

    getSearchUserBasicInfo: `${serverURL}/getSearchUserBasicInfo`,
    getSearchUserFriends: `${serverURL}/getSearchUserFriends`,
    // getSearchUserFitness: `${serverURL}/getSearchUserFitness`,
    getSearchUserFitnessBests: `${serverURL}/getSearchUserFitnessBests`,
    getSearchUserFitness: `${serverURL}/getSearchUserFitness`,

    // user data and info
    getData: `${serverURL}/getUserFitness`,
    getUserInfo: `${serverURL}/getUserInfo`,
    updateProfile: `${serverURL}/updateProfile`,
    checkDuplicatePic: `${serverURL}/checkDuplicatePic`,
    uploadProfilePic: `${serverURL}/uploadProfilePic`,
    getBests: `${serverURL}/getBests`,
    getProfilePic: `${serverURL}/getProfilePic`,
    getUsername: `${serverURL}/getUsername`,
    updateSettings: `${serverURL}/updateSettings`,
    upload: `${serverURL}/upload`,
    updateWeeklyGoals: `${serverURL}/updateWeeklyGoals`
}

export default ENDPOINTS