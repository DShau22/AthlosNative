import React from 'react'

export default function PrivacyMenu(props) {
  return (
    <div className='settings-dropdown'>
      <div className="btn-group">
      <button
        type="button"
        className="btn btn-primary dropdown-toggle"
        data-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false"
      >
        {props.dropdownText}
      </button>
      <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
        <span className="dropdown-item" onClick={props.onSelect}>everyone</span>
        <span className="dropdown-item" onClick={props.onSelect}>friends</span>
        <span className="dropdown-item" onClick={props.onSelect}>just me</span>
      </div>
      </div>
    </div>
  )
}
