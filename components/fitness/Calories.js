import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default function Calories( props ) {
  return (
    <div className="calories-circle">
      <FontAwesomeIcon icon="fire-alt"/>
      <span>{props.cals}</span>
    </div>
  )
}
