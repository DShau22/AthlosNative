import React from 'react'
import Run from "./run/Run"
// import Jump from "./jump/Jump"
// import Swim from "./swim/Swim"
import { UserDataContext } from "../../Context"
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import LoadingScreen from '../generic/LoadingScreen';
import { View } from "react-native";

const Fitness = () => {
  // constructor(props) {
  //   super(props)

  //   this.state = {
  //     display: true,
  //     activityDisplay: "", // which activity to display
  //   }
  //   this.renderActivity = this.renderActivity.bind(this)
  //   this.changeActivityDisplay = this.changeActivityDisplay.bind(this)
  // }
  var [display, setDisplay] = React.useState(true);
  var [activityDisplay, setActivityDisplay] = React.useState('');
  const context = React.useContext(UserDataContext);

  const renderActivity = () => {
    var { runJson, jumpJson, swimJson } = context;
    return ( <Text>RUNN BOI</Text> );
    // if (activityDisplay === "run") {
    //   return ( <Run id='run' activityJson={runJson}/> )
    // } else if (activityDisplay === "jump") {
    //   return ( <Jump id='jump' activityJson={jumpJson}/> )
    // } else if (activityDisplay === "swim") {
    //   return ( <Swim id='swim' activityJson={swimJson}/> )
    // } else {
    //   return ( <div className='no-activity-container'> <span>pick an activity</span> </div>)
    // }
  }
  const TopTab = createMaterialTopTabNavigator();
  // BELOW IS HOW YOU PASS PROPS
  return (
    <TopTab.Navigator style={{marginTop: 50}}>
      <TopTab.Screen
        name="Run"
        component={Run}
        initialParams={{
          id: "run",
          activityJson: context.runJson
        }}
      />
      <TopTab.Screen name="Swim" component={LoadingScreen}/>
      <TopTab.Screen name="Jump" component={LoadingScreen}/>
    </TopTab.Navigator>
  )
  // return (
  //   <div className="fitness-container">
  //     <div className="card-header fitness-header">Activity:</div>
  //     <nav className="navbar navbar-expand navbar-text sticky bg-light">
  //       <ul className="navbar-nav mr-auto">
  //         <li className="nav-item mx-4">
  //           <span 
  //             className={`run-link nav-link ${(activityDisplay === "run") ? "active" : ""}`}
  //             onClick={() => {setActivityDisplay("run")}}
  //           >
  //             Run
  //           </span>
  //         </li>
  //         <li className="nav-item mx-4">
  //           <span
  //             className={`swim-link nav-link ${(activityDisplay === "swim") ? "active" : ""}`}
  //             onClick={() => {setActivityDisplay("swim")}}
  //           >
  //             Swim
  //           </span>
  //         </li>
  //         <li className="nav-item mx-4">
  //           <span
  //             className={`jump-link nav-link ${(activityDisplay === "jump") ? "active" : ""}`}
  //             onClick={() => {setActivityDisplay("jump")}}
  //           >
  //             Jump
  //           </span>
  //         </li>
  //       </ul>
  //     </nav>
  //     { renderActivity() }
  //   </div>
  // )
}

export default Fitness;
