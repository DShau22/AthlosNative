import React from 'react'

export default function PoolLengthMenu(props) {
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
          <span className="dropdown-item" href="#" onClick={props.onSelect}>25 yd</span>
          <span className="dropdown-item" href="#" onClick={props.onSelect}>25 m</span>
          <span className="dropdown-item" href="#" onClick={props.onSelect}>50 m</span>
          <span className="dropdown-item" href="#" onClick={props.onCustomSwimClick}>Custom</span>
        </div>
      </div>
    </div>
  )
}
