import React, {Component} from 'react'
import SpaContext from "../../Context"

class ImageSlide extends Component {
  constructor(props) {
    super(props)
    this.getLabels = this.getLabels.bind(this)
    this.renderNum = this.renderNum.bind(this)
    // this.renderSecondary = this.renderSecondary.bind(this)
  }

  getLabels(action) {
    var { unitSystem } = this.context.settings
    if (action === "run") {
      return {
        numLabel: "steps",
        secondaryLabel: (unitSystem === "metric") ? "km" : "miles"
      }
    } else if (action === "swim") {
      // CHANGE THIS BASED ON SWIMMING PART OF SETTINGS
      return {
        numLabel: "laps",
        secondaryLabel: (unitSystem === "metric") ? "m" : "yds"
      }
    } else {
      return {
        numLabel: "jumps",
        secondaryLabel: (unitSystem === "metric") ? "cm" : "in"
      }
    }
  }

  renderNum(stats, indexDisplay) {
    var { activityData } = stats
    var labels = this.getLabels(stats.action)
    var num = activityData.length === 0 ? 0 : activityData[indexDisplay].num
    return ( <span> {`${num} ${labels.numLabel}`} </span> )
  }

  render() {
    var { stats, indexDisplay, renderSecondary } = this.props
    return (
      <div className={`imageSlide ${stats.action}`}> 
        <img src={stats.imageUrl} alt="loading..."/>
        {this.renderNum(stats, indexDisplay)}
        {renderSecondary()}
      </div>
    )
  }
}
ImageSlide.contextType = SpaContext
export default ImageSlide
