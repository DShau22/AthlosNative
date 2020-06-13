import React from 'react'

export default function UnitSystemMenu(props) {
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
        <span className="dropdown-item" onClick={props.onSelect}>English</span>
        <span className="dropdown-item" onClick={props.onSelect}>metric</span>
      </div>
      </div>
    </div>
  )
}
