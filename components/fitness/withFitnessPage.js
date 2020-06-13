import React, {Component} from 'react'
import SpaContext from "../Context"
import { parseDate } from "../utils/unitConverter"

// HOC for run, swim, jump fitness pages.
// reuses label and data getting for:
// 1. past laps/jumps/steps (num)
// 2. Carousel display
// 3. Cals and duration circles
// 4. details link button
// 5. pace/jump/time (swim) progressions (swim still adds laps of each stroke done)
// 6. average jumps/steps/laps (num)
// 7. percentToGoal ? 

function reverse(array) {
  var i = 0,
      n = array.length,
      middle = Math.floor(n / 2),
      temp = null;

  for (; i < middle; i += 1) {
     temp = array[i];
     array[i] = array[n - 1 - i];
     array[n - 1 - i] = temp;
  }
}

export default function withFitnessPage( WrappedComponent ) {  
  class WithFitnessPage extends Component {
    constructor(props) {
      super(props)
    
      this.state = {
        activityIndex: 0,
        pastGraphLabels: [],
        pastGraphData: [],
        progressionLabels: [],
        progressionDate: [], 
      }
      this.nextSlide = this.nextSlide.bind(this);
      this.previousSlide = this.previousSlide.bind(this);
      this.makePastGraphLabels = this.makePastGraphLabels.bind(this)
      this.makePastGraphData = this.makePastGraphData.bind(this)
      this.dropdownItemClick = this.dropdownItemClick.bind(this)
      this.displayDate = this.displayDate.bind(this)
      this.calcAvgNum = this.calcAvgNum.bind(this)
      this.calcAvgCals = this.calcAvgCals.bind(this)
    }

    componentDidMount() {
      console.log('mounted')
      this.makePastGraphLabels()
      this.makePastGraphData()
    }

    roundToNDecimals(num, decimals) {
      return parseFloat(num).toFixed(decimals)
    }

    isNullOrUndefined(input) {
      return (input == null)
    }

    // gets the labels for the graph that displays num field over past upload dates
    makePastGraphLabels() {
      var pastGraphLabels = []
      // can be either run, jump or swimming json
      var { activityJson } = this.props
      activityJson.activityData.forEach((session, idx) => {
        var { uploadDate } = session
        var stringToDate = new Date(uploadDate)
        // this is an array
        var dateInfo = parseDate(stringToDate)
        pastGraphLabels.push(dateInfo[0] + ", " + dateInfo[1] + " " + dateInfo[2])
      })
      reverse(pastGraphLabels)
      this.setState({ pastGraphLabels })
    }

    makePastGraphData() {
      var pastGraphData = []
      var { activityJson } = this.props
      activityJson.activityData.forEach((session, idx) => {
        var { num } = session
        pastGraphData.push(num)
      })
      reverse(pastGraphData)
      this.setState({ pastGraphData })
      //debugger
    }

    // returns Day of week, month day (num) in a string format
    // i.e Sat, Jul 20
    displayDate() {
      var { activityJson } = this.props
      var { activityIndex } = this.state
      if (activityJson.activityData.length === 0) {
        return "No uploads yet"
      }
      var { uploadDate } = activityJson.activityData[activityIndex]
      var parsed = parseDate(new Date(uploadDate))
      var date = parsed[0] + ", " + parsed[1] + " " + parsed[2]
      return date
    }

    dropdownItemClick(e) {
      // on dropdown date click, display that date on the dropdown,
      // and switch the image slider to display that date
      this.setState({ activityIndex: parseInt(e.target.id) })
    }

    calcAvgNum() {
      // Activity json contains all the queried activity data
      // NOTE THIS IS NOT THE TRUE AVG SINCE THE QUERY IS AT MAX
      // (50) DOCUMENTS OF ACTIVITY DATA
      var { activityData } = this.props.activityJson
      var avg = 0
      var count = 0
      activityData.forEach((session, idx) => {
        avg += session.num
        count += 1
      })
      return (count === 0) ? 0 : Math.round(avg / count)
    }

    calcAvgCals() {
      var { activityData } = this.props.activityJson
      var avg = 0
      var count = 0
      activityData.forEach((session, idx) => {
        avg += session.calories
        count += 1
      })
      return (count === 0) ? 0 : Math.round(avg / count)
    }

    previousSlide() {
      //debugger
      var { activityData } = this.props.activityJson
      var nextIndex = Math.min((this.state.activityIndex + 1), activityData.length - 1)
      this.setState({ activityIndex: nextIndex })
    }
  
    nextSlide() {
      // 0 represents the most recent upload date
      var nextIndex = Math.max((this.state.activityIndex - 1), 0)
      this.setState({ activityIndex: nextIndex })
    }

    render() {
      var { activityIndex, pastGraphData, pastGraphLabels } = this.state
      return (
        <div>
          <WrappedComponent
            pastGraphData={pastGraphData}
            pastGraphLabels={pastGraphLabels}
            activityIndex={activityIndex}
            dropdownItemClick={this.dropdownItemClick}
            displayDate={this.displayDate}
            nextSlide={this.nextSlide}
            previousSlide={this.previousSlide}
            calcAvgNum={this.calcAvgNum}
            calcAvgCals={this.calcAvgCals}
            isNullOrUndefined={this.isNullOrUndefined}
            roundToNDecimals={this.roundToNDecimals}
            {...this.props}
          />
        </div>
      )
    }
  }
  WithFitnessPage.contextType = SpaContext
  
  return WithFitnessPage
}

