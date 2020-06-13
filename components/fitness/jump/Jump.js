import React, { Component } from 'react'
import Carousel from "../carousel/Carousel"
import Calories from "../Calories"
import Duration from "../Duration"
import SpaContext from '../../Context'
import Past from "../charts/Past"
import withFitnessPage from "../withFitnessPage"
import { rawHeightConvert } from "../../utils/unitConverter" 

class Jump extends Component {
  constructor(props) {
    super(props)
    this.getCurrentBestHeight = this.getCurrentBestHeight.bind(this)
  }

  calcAvgHeight() {
    var { activityData } = this.context.jumpJson
    var avg = 0
    var count = 0
    activityData.forEach((session, i) => {
      session.heights.forEach((height, j) => {
        avg += height; count += 1;
      })
    })
    // show only 2 decimal digits
    return (count === 0) ? 0 : parseFloat(avg / count).toFixed(2)
  }

  getCurrentBestHeight() {
    var { unitSystem } = this.context.settings
    var { activityData } = this.context.jumpJson
    var { activityIndex } = this.props
    if (activityData.length === 0) { return null }
    var session = activityData[activityIndex]
    var best = Math.max(...session.heights)
    best = unitSystem === "metric" ? rawHeightConvert(unitSystem, best) : best
    return (
      <span>
        {"highest: " + best + (unitSystem === "metric" ? " cm" : " in")}
      </span>
    )
  }

  render() {
    var { jumpJson, settings, bests } = this.context
    var { unitSystem } = settings
    var {
      activityIndex,
      pastGraphData,
      pastGraphLabels,
      dropdownItemClick,
      displayDate,
      nextSlide,
      previousSlide,
      calcAvgNum,
      calcAvgCals,
      isNullOrUndefined
    } = this.props
    var currentStatDisplay = jumpJson.activityData[activityIndex]
    console.log(pastGraphData)
    return (
      <div className="jump-container">
        <div className="row">
          <div className="col">
            <Carousel
              stats={jumpJson}
              previousSlide={previousSlide}
              nextSlide={nextSlide}
              activityIndex={activityIndex}
              displayDate={displayDate}
              dropdownItemClick={dropdownItemClick}
              renderSecondary={this.getCurrentBestHeight}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-4" align="center">
            <Calories 
              cals={isNullOrUndefined(currentStatDisplay) ? 0 : currentStatDisplay.calories}
            />
          </div>
          <div className="col-4" align="center">
            {/* don't need details from jump rn
            <Details detailsLink={jumpLink}/> */}
          </div>
          <div className="col-4" align="center">
            <Duration 
              duration={isNullOrUndefined(currentStatDisplay) ? 0 : currentStatDisplay.time}
            />
          </div>
        </div>
        <div className="row">
          {/* eventually configure the min and max of y axis */}
          <div className="col">
            <Past
              chartTitle="Previous Sessions"
              labels={pastGraphLabels}
              data={pastGraphData}
              hoverLabel="Jumps"
              activity="Jumps"
              yAxisMin={0}
              yAxisMax={20}
            />
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-6">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title">Avg Jumps per Session</h5>
                {calcAvgNum()}
              </div>
            </div>
          </div>
          <div className="col-6">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title">Avg height per Session</h5>
                {this.calcAvgHeight() + " " + (unitSystem === "metric" ? "cm" : "in")}
              </div>
            </div>
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-6">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title">Avg Cals per Session</h5>
                {calcAvgCals()}
              </div>
            </div>
          </div>
          <div className="col-6">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title">Overall Best</h5>
                {bests.jump}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

Jump.contextType = SpaContext
export default withFitnessPage(Jump)
