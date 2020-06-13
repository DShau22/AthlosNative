import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default function Duration( props ) {
  return (
    <div className="duration-circle">
      <FontAwesomeIcon icon="clock"/>
      <span>{props.duration / 10}</span>
    </div>
  )
}
