import ImageSlide from "./ImageSlide"
import "./Carousel.css"
import Arrow from "./Arrow"
import React from 'react'
import { parseDate } from "../../utils/unitConverter"
// const jumpActivity = "jump"
// const runActivity = "run"
// const swimActivity = "swim"

class Carousel extends React.Component {
  getDropdownDates(stats) {
    var { dropdownItemClick } = this.props
    var dropdownItems = []
    stats.activityData.forEach((session, idx) => {
      var parsed = parseDate(new Date(session.uploadDate))
      var dayMonth = parsed[0] + ", " + parsed[1] + " " + parsed[2]
      dropdownItems.push(
        <span
          className="dropdown-item"
          key={"dropdown_" + idx}
          id={idx}
          onClick={dropdownItemClick}
        >
          {dayMonth}
        </span>
      )
    })
    return dropdownItems
  }

  render() {
    var { stats, previousSlide, nextSlide, activityIndex, displayDate, renderSecondary } = this.props
    return (
      <div className="carousel">
        <div className="btn-group dropdown">
          <button
            className="btn btn-secondary btn-sm mt-3 dropdown-toggle"
            type="button"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
          >
            {displayDate()}
          </button>
          <div className="dropdown-menu activities-dropdown">
            {this.getDropdownDates(stats)}
          </div>
        </div>

        <div className="slideShow">
          <Arrow
            direction="left"
            clickFunction={ previousSlide }
            glyph="&#8249;"
            activity={stats.action}
          />

          <ImageSlide
            stats={stats}
            indexDisplay={activityIndex}
            renderSecondary={renderSecondary}
          />

          <Arrow
            direction="right"
            clickFunction={ nextSlide }
            glyph="&#8250;"
            activity={stats.action}
          />
        </div>
      </div>
    )
  }
}
export default Carousel
