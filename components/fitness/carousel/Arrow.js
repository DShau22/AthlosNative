import React from 'react'

const Arrow = ({ direction, clickFunction, glyph, activity }) => (
  <div
    className={ `slide-arrow ${direction} ${activity}` }
    onClick={ clickFunction }
  >
    { glyph }
  </div>
);
export default Arrow
