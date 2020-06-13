import React, { Component } from 'react'
import Carousel from "../carousel/Carousel"
import Calories from "../Calories"
import Duration from "../Duration"
import Details from "../Details"
import SpaContext from '../../Context'
import Past from "../charts/Past"
import withFitnessPage from "../withFitnessPage"
import SwimDoughnut from "./SwimDoughnut"

const metersToYards = 1.0 / 1.09361
const yardsToMeters = 1.0 / 0.9144
const swimLink = "/app/swimDetails"

class Swim extends Component {
  constructor(props) {
    super(props)
  
    this.state = {
       
    }
    this.calculateDistance = this.calculateDistance.bind(this)
    this.calcAvgSpeed = this.calcAvgSpeed.bind(this)
  }

  calculateDistance(currentStatDisplay) {
    var { swimLap, unitSystem } = this.context.settings
    const { roundToNDecimals, isNullOrUndefined } = this.props
    unitSystem = unitSystem.toLowerCase()
    if (isNullOrUndefined(currentStatDisplay)) {
      return 0
    }
    var { num } = currentStatDisplay
    if (swimLap === "50 m") {
      let distanceInMeters = 50 * num
      return (unitSystem === "metric" ? 
              distanceInMeters : 
              roundToNDecimals(distanceInMeters * metersToYards, 2))
    } else if (swimLap === "25 m") {
      let distanceInMeters = 25 * num
      return (unitSystem === "metric" ? 
              distanceInMeters : 
              roundToNDecimals(distanceInMeters * metersToYards, 2))
    } else {
      // 25yd
      let distanceInYards = 25 * num
      return (unitSystem === "english" ? 
              distanceInYards : 
              roundToNDecimals(distanceInYards * yardsToMeters, 2))
    }
  }

  calcAvgSpeed() {
    var { activityData } = this.props.activityJson
    var { swimLap, unitSystem } = this.context.settings
    const { roundToNDecimals, isNullOrUndefined } = this.props
    if (isNullOrUndefined(activityData)) {
      return 0
    }
    // returns [50/25, m/yd] both as strings
    var distMetric = swimLap.split(" ")
    var distance = 0; var time = 0;
    // var incrementDistance = (distance, distMetric) => {
    //   return distance + distMetric
    // }
    activityData.forEach((session, i) => {
      var { lapTimes, num } = session
      // sum over all times in the lapTimes array
      time += lapTimes.reduce((a, b) => a + b, 0)
      // add 50/25 * the number of laps done
      distance = distMetric[0] * num
    })
    // now have average distance / time in either m/s or yd/s
    var avgSpeed = (distance === 0 ? 0 : distance / time)

    if (distMetric[1] === "yd") {
      // avg speed is in yds / s
      return (unitSystem === "metric" ?
              roundToNDecimals(avgSpeed * yardsToMeters, 2) :
              avgSpeed)
    } else {
      // avg speed is in meters / s
      return (unitSystem === "metric" ?
              avgSpeed :
              roundToNDecimals(avgSpeed * metersToYards, 2))
    }
  }

  calcAvgTimePerLap() {
    var { activityData } = this.props.activityJson
    const { roundToNDecimals, isNullOrUndefined } = this.props
    if (isNullOrUndefined(activityData)) {
      return 0
    }
    var totalTime = 0; var totalNumLaps = 0;
    activityData.forEach((session, idx) => {
      totalTime += session.lapTimes.reduce((a, b) => a + b, 0)
      totalNumLaps += session.num
    })
    return roundToNDecimals(totalTime / totalNumLaps, 2)
  }

  makeDoughnutData() {
    var { activityData } = this.props.activityJson
    const { isNullOrUndefined } = this.props
    if (isNullOrUndefined(activityData)) {
      return 0
    }
    var flyCount    = 0, 
        backCount   = 0,
        breastCount = 0,
        freeCount   = 0;
    activityData.forEach((session, i) => {
      session.strokes.forEach((stroke, j) => {
        let lowerCaseStroke = stroke.toLowerCase()
        if (lowerCaseStroke === "u") {
          flyCount += 1
        } else if (lowerCaseStroke === "b") {
          backCount += 1
        } else if (lowerCaseStroke === "r") {
          breastCount += 1
        } else if (lowerCaseStroke === "f") {
          freeCount += 1
        }
      })
    })
    return [flyCount, backCount, breastCount, freeCount]     
  }
  
  render() {
    var { settings, swimJson } = this.context
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
      isNullOrUndefined,
    } = this.props
    // this could be undefined if user has no recorded data
    var currentStatDisplay = swimJson.activityData[activityIndex]
    // 50m, 25yd, or 25m
    return (
      <div className="swim-container">
        <div className="row">
          <div className="col">
            <Carousel
              stats={swimJson}
              previousSlide={previousSlide}
              nextSlide={nextSlide}
              activityIndex={activityIndex}
              displayDate={displayDate}
              dropdownItemClick={dropdownItemClick}
              renderSecondary={this.calculateDistance}
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
            <Details detailsLink={swimLink}/>
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
              chartTitle="Previous Swims"
              labels={pastGraphLabels}
              data={pastGraphData}
              hoverLabel="Laps"
              activity="Swims"
              yAxisMin={0}
              yAxisMax={50}
            />
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-6">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title">Avg Laps per Session</h5>
                {calcAvgNum()}
              </div>
            </div>
          </div>
          <div className="col-6">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title">Avg Speed per Lap</h5>
                {this.calcAvgSpeed() + " " + (unitSystem === "metric" ? "m/s" : "yd/s")}
              </div>
            </div>
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-6">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title">Avg Time per Lap</h5>
                {this.calcAvgTimePerLap() + " seconds"}
              </div>
            </div>
          </div>
          <div className="col-6">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title">Avg Strokes per Lap</h5>
                avg strokes
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
                <h5 className="card-title">Stroke Distribution</h5>
                <SwimDoughnut
                  data={this.makeDoughnutData()}
                  labels={["laps fly", "laps back", "laps breast", "laps free"]}
                  colors={[
                    'rgba(102, 255, 102, 0.4)',
                    'rgba(255, 255, 0, 0.4)',
                    'rgba(255, 51, 0, 0.4)',
                    'rgba(255, 153, 0, 0.4)',
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

Swim.contextType = SpaContext
export default withFitnessPage(Swim)
