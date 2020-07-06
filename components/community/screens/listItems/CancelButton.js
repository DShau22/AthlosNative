import React from 'react'
import ActionButton from '../../ActionButton'
export default function CancelButton(props) {
  return (
    <ActionButton
      title='Cancel'
      afterPressTitle='Cancelled'
      onPress={props.cancel}
    />
  )
}