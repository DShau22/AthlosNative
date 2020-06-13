import React from 'react'

// FUNCTIONAL COMPONENT FOR DISPLAY FRIENDS AND FRIEND REQUESTS
// IN A LIST FORMAT FOR THE COMMUNITY COMPONENT
export default function FriendDisplay(props) {

  function renderRelationship() {
    if (props.isFriend) {
      return (
        <div className='rank'>
          {`Rank: ${props.rank}`}
        </div>
      )
    } else if (props.isFriendRequest) {
      return (
        <div
          className='accept-request-btn'
          onClick={props.onAcceptRequest}
        >
          Accept
        </div>
      )
    } else {
      return (
        <div className='send-req-btn'>
          Request Sent/Add Friend
        </div>
      )
    }
  }

  function showStats() {
    // make request to get their settings and only display if they allow it
    return (
      <React.Fragment>
        <div className='stat'>
          tot steps
        </div>
        <div className='stat'>
          tot laps
        </div>
        <div className='stat'>
          highest jump
        </div>
      </React.Fragment>
    )
  }

  return (
    // total display should be flex with row direction
    <li
      className="list-group-item friend-display"
    >
      <div className='img-container'>
        <img
          src={(props.profileUrl ? props.profileUrl : props.defaultProfile)}
          alt={props.imgAlt}
          onClick={props.onClick}
        />
      </div>
      {/* display should be flex with col direction */}
      <div className='user-info'>
        <div className='top-row ml-3'>
          <div className='name-container'>
            <strong className='name' onClick={props.onClick}>{props.firstName} {props.lastName}</strong>
          </div>
          {/* put an icon to the left. This shows the rank, accept req button, or send req button*/}
          {renderRelationship()}
        </div>
        {/* display this depending on their settings */}
        <div className='bot-row ml-3'>
          {showStats()}
        </div>
      </div>
    </li>
  )
}