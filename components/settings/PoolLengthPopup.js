import React from 'react'
import Popup from "reactjs-popup";

export default function PoolLengthPopup(props) {
  return (
    <Popup
      open={props.showCustomSwimSettings}
      closeOnDocumentClick
      onClose={props.closeCustomSwimSettings}
    >
      <div className="popup-modal">
        <div className="close" onClick={props.closeCustomSwimSettings}>
          &times;
        </div>
        <div className="popup-header">Set Custom Pool Length</div>
        <div className="popup-content">
          <form onSubmit={props.setCustomSwimLength}>
            <div className="input-group mt-3">
              <input type="number"className="form-control" onChange={props.onCustomSwimLengthChange} required min='5' max='100' step='.1'/>
              <div className="input-group-append">
                <button
                  className="btn btn-outline-secondary dropdown-toggle unit-select"
                  type="button"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  {props.customSwimUnits}
                </button>
                <div className="dropdown-menu">
                  <span className="dropdown-item" onClick={props.setCustomSwimUnits}>Yards</span>
                  <span className="dropdown-item" onClick={props.setCustomSwimUnits}>Meters</span>
                </div>
              </div>
            </div>

            <div className='save-custom-swim-container'>
              <input type="submit" className="save-custom-swim-btn mt-3 btn btn-primary" value="Done" />
            </div>
          </form>
        </div>
      </div>
    </Popup>
  )
}
