import React, { Component } from 'react';
// const friendReqURL = "https://us-central1-.cloudfunctions.net/athlos-server/getFriendReqs"
import {
  getBests,
  getProfile,
  getUsername
} from "../../utils/userInfo"
import FriendDisplay from "./FriendDisplay"
import { withRouter } from 'react-router-dom'
const defaultProfile = 'default'
const imgAlt = 'alt'

class FriendRequests extends Component {
  constructor(props) {
    super(props)
    this.state = {
      friendRequestListItems: []
    }
    this.createFriendRequests = this.createFriendRequests.bind(this)
  }

  async componentDidMount() {
    await this.createFriendRequests()
  }

  async createFriendRequests() {
    // onClick function definition
    var { friendRequests, addFriendToState, removeFriendReq, acceptRequest } = this.props
    var liTags = []
    const onClick = () => {
      this.props.history.push(`/app/profile/${username}`)
    }
    const onAcceptRequest = () => {
      acceptRequest(id, firstName, lastName);
      removeFriendReq(id);
      addFriendToState(id, firstName, lastName);
    }
    for (let i = 0; i < friendRequests.length; i++) {
      var { id, firstName, lastName } = friendRequests[i]
      var [username, bests, profileUrl] = await Promise.all([getUsername(id), getBests(id), getProfile(id)])
      liTags.push(
        <FriendDisplay 
          key={id}
          isFriend={false}
          isFriendRequest={true}
          onClick={onClick}
          onAcceptRequest={onAcceptRequest}
          profileUrl={profileUrl}
          defaultProfile={defaultProfile}
          imgAlt={imgAlt}
          firstName={firstName}
          lastName={lastName}
          bests={bests}
        />
      )
    }
    this.setState({ friendRequestListItems: liTags })
  }

  render() {
    return (
      <div className="friend-requests" style={protoStyle}>
        <h4>requests... {this.props.numRequests}</h4>
        <ul className="friend-requests-list">
          {this.state.friendRequestListItems}
        </ul>
      </div>
    )
  }
}

const protoStyle = {
  "marginTop": "100px"
}

export default withRouter(FriendRequests)
