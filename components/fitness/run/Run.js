import React, { Component } from 'react'
import Carousel from "../carousel/Carousel"
import Calories from "../Calories"
import Duration from "../Duration"
import SpaContext from '../../Context'
import Past from "../charts/Past"
import RunDoughnut from "./RunDoughnut"
import withFitnessPage from "../withFitnessPage"
import PaceLineProgression from "../charts/PaceLineProgression"

// btw restPaceMin and walkPaceMax is walking
// greater that walkPaceMax is running
const walkPaceMax = 2.314 // 130 steps per minute is a fast walk, which is 2.16 steps/sec, 2.314 (.2sec) / step
// anything above restPaceMax is resting
const restPaceMin = 5 // say 60 steps per minute is basically resting. 1 step/sec, 5 (.2sec) / step

class Run extends Component {
  constructor(props) {
    super(props)
    this.state = {
      paceLabels: [],
      paceDate: [], 
    }
    this.estimateDistanceRun = this.estimateDistanceRun.bind(this)
  }

  componentDidMount() {
    console.log('mounted')
  }

  makeDoughnutData() {
    var runCount = 0
    var walkCount = 0
    var count = 0
    var { activityData } = this.context.runJson
    activityData.forEach((session, i) => {
      session.paces.forEach((pace, j) => {
        // if pace is somehow undefined or NaN or null then skip
        if (!(!pace || isNaN(pace))) {
          if (pace > walkPaceMax) {
            runCount += 1
          } else if (pace > restPaceMin && pace < walkPaceMax) {
            walkCount += 1
          }
          count += 1
        } else {
          console.log("this pace entry is corrupted somehow...")
        }
      })
    })
    if (count === 0) {
      return [0, 0, 0]
    }
    var runPercent = runCount / count
    var walkPercent = walkCount / count
    return [runPercent, walkPercent, 1 - (runPercent + walkPercent)]
  }

  calcAvgPace() {
    var { activityData } = this.context.runJson
    var avg = 0
    var count = 0
    activityData.forEach((session, i) => {
      session.paces.forEach((pace, j) => {
        avg += pace
        count += 1
      })
    })
    return (count === 0) ? 0 : avg / count
  }

  estimateDistanceRun() {
    var { settings } = this.context
    var { unitSystem } = settings
    // this means the person's height is in cm, display km
    if (unitSystem === "metric") {

    } else {
      // person's height in inches, display miles
    }
    return "estimated dist"
  }

  // returns an array of time labels for a given paces array
  // and the total time the user spent on running mode
  makePaceLabels(paces, totalTime) {
    let timeInterval = Math.floor(totalTime / paces.length)
    let timeSeries = Array(paces.length)

    // add 1 to length of paces array cuz you wanna start with 0
    // on the display chart
    for (let i = 0; i < paces.length + 1; i++) {
      timeSeries[i] = `${Math.floor(timeInterval * i / 10)} sec`
    }
    return timeSeries
  }

  render() {
    var { runJson } = this.context

    // from withFitnessPage
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

    var currentStatDisplay = runJson.activityData[activityIndex]
    return (
      <div className="run-container">
        <Carousel
          stats={runJson}
          previousSlide={previousSlide}
          nextSlide={nextSlide}
          activityIndex={activityIndex}
          displayDate={displayDate}
          dropdownItemClick={dropdownItemClick}
          renderSecondary={this.estimateDistanceRun}
        />
        <div className="row">
          <div className="col-4" align="center">
            <Calories 
              cals={isNullOrUndefined(currentStatDisplay) ? 0 : currentStatDisplay.calories}
            />
          </div>
          <div className="col-4" align="center">
            
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
              chartTitle="Previous Runs"
              labels={pastGraphLabels}
              data={pastGraphData}
              hoverLabel="Steps"
              activity="Runs"
              yAxisMin={0}
              yAxisMax={Math.max(...pastGraphData)}
            />
          </div>
        </div>
        <div className="row">
          <div className="col">
            <PaceLineProgression
              activity="Pace Progression"
              displayDate={displayDate}
              data={[0, ...currentStatDisplay.paces]} // add 0 to beginning of paces array to indicate 0 pace at time 0
              labels={this.makePaceLabels(currentStatDisplay.paces, currentStatDisplay.time)}
              hoverLabel="Pace"
              yAxisMin={0}
              yAxisMax={Math.max(...currentStatDisplay.paces) + 2}
            />
          </div>
        </div>
        <div className="row mt-3">
          <div className="col-6">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title">Avg Steps per Session</h5>
                {calcAvgNum()}
              </div>
            </div>
          </div>
          <div className="col-6">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title">Avg Pace per Session</h5>
                {this.calcAvgPace()}
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
                <RunDoughnut
                  labels={['% run', '% walk', '% rest']}
                  data={this.makeDoughnutData()}
                  colors={[
                    'rgba(102, 255, 102, 0.4)',
                    'rgba(255, 255, 0, 0.4)',
                    'rgba(255, 51, 0, 0.4)',
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

Run.contextType = SpaContext
export default withFitnessPage(Run)
