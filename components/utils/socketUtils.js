// web sockets
import io from "socket.io-client"

import {
  getFromStorage,
  localStorageKey,
  removeFromStorage,
} from './storage';

// server url
const serverURL = "https://us-central1-.cloudfunctions.net/athlos-server"
const getID = "/tokenToID"

function setUpSocket() {
  // var prom = new Promise(async function(resolve, reject) {
  //   // send request to get decoded user ID
  //   var userToken = getFromStorage(localStorageKey).token
  //   var headers = new Headers()
  //   headers.append("authorization", `Bearer ${userToken}`)
  //   var response = await fetch(serverURL + getID, { method: "GET", headers })
  //   var json = await response.json()
  //   var { userID } = json
  //
  //   // establish socket connection and send socket ID, userID
  //   var data = { userID }
  //   var connectionOptions = {
  //     'sync disconnect on unload':false
  //   }
  //   var socket = io.connect(serverURL, connectionOptions)
  //
  //   // put socket is session storage
  //   sessionStorage.setItem("socket", socket)
  //
  //   // send userID after socket connects
  //   socket.on("connect", () => {
  //     socket.emit("sendUserID", data)
  //   })
  //
  //   socket.on('receiveFriendRequest', (data) => {
  //     console.log("got friend request")
  //     console.log(data)
  //     this.setState({
  //       notification: "!"
  //     })
  //   })
  //
  //   socket.on("newFriend", (data) => {
  //     console.log("got a new friend!")
  //     console.log(data)
  //     this.setState({
  //       notification: "***"
  //     })
  //   })
  //
  //   socket.on("logoutClient", (data) => {
  //     // data should contain the socketID that did the logging out
  //     var { logoutSocketID } = data
  //     console.log(logoutSocketID)
  //     if (socket.id !== logoutSocketID) {
  //       alert("You have been logged out from another tab or browser")
  //     }
  //     removeFromStorage(localStorageKey)
  //     this.setState({
  //       isLoading: true,
  //       logout: true,
  //     });
  //   })
  //
  //   resolve(socket)
  // })
  // return prom
}

module.exports.setUpSocket = setUpSocket
