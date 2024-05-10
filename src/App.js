import React, { useState } from 'react';
import './App.css';
import ExerciseSimulation from './components/ExerciseSimulation';
import { Slider, Typography, InputLabel, Select, MenuItem, Alert, InputAdornment, FormControl, Input, FormHelperText, Divider } from '@mui/material';

function App() {
  const [age, setAge] = useState(30);
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(170);
  const [gender, setGender] = useState('male');
  const [pace, setPace] = useState(10);
  const [maxHeartRate, setMaxHeartRate] = useState(220 - age);
  const [simulationStarted, setSimulationStarted] = useState(false);
  const [fitnessLevel, setFitnessLevel] = useState('');

  const handleWeightChange = (event) => {
    setWeight(parseInt(event.target.value));
  };

  const handleHeightChange = (event) => {
    setHeight(parseInt(event.target.value));
  };


  const calculateBMI = () => {
    const heightInMeters = height / 100; // Convert height from cm to meters
    const bmi = weight / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
  };

  const handleAgeChange = (event) => {
    const newAge = parseInt(event.target.value);
    setAge(newAge);
    setMaxHeartRate(220 - newAge);
  };

  const handlePaceChange = (event, newValue) => {
    setPace(newValue);
  };

  const handleStartSimulation = () => {
    setSimulationStarted(true);
  };

  const handleFitnessLevelChange = (event) => {
    setFitnessLevel(event.target.value);
  };

  const handleResetSimulation = () => {
    setSimulationStarted(false);
  };

  const [simulationSpeed, setSimulationSpeed] = useState(1);

  const handleSimulationSpeedChange = (event) => {
    setSimulationSpeed(parseInt(event.target.value));
  };

  const [targetDistance, setTargetDistance] = useState(null);

  return (
    <div className="App">
      <div className="container">
        <div className="sidebar">
          <Typography variant="h6" component="h3" gutterBottom>
            Set Your Profile
          </Typography>


          <div className="input-container">

            <FormControl variant="standard" sx={{ m: 0, mt: 3, width: '15ch' }}>
              <Input
                type='number' value={age} onChange={handleAgeChange}
                inputProps={{
                  'aria-label': 'Age',
                }}
              />
              <FormHelperText>Age</FormHelperText>
            </FormControl>
          </div>

          <div className="input-container" style={{ display: 'flex', justifyContent: 'center' }}>

          <Alert variant="outlined" severity="info" sx={{ m: 0, mt: 0, width: '20ch' }}>
          Max HR: {maxHeartRate} bpm

          </Alert>
          </div>



          <div className="input-container">

            <FormControl variant="standard" sx={{ m: 0, mt: 0, width: '15ch' }}>
              <Input
                type='number' value={weight} onChange={handleWeightChange}
                endAdornment={<InputAdornment position="end">kg</InputAdornment>}
                aria-describedby="standard-weight-helper-text"
                inputProps={{
                  'aria-label': 'weight',
                }}
              />
              <FormHelperText>Weight</FormHelperText>
            </FormControl>
          </div>

          <div className="input-container">

            <FormControl variant="standard" sx={{ m: 0, mt: 0, width: '15ch' }}>
              <Input
                type='number' value={height} onChange={handleHeightChange}
                endAdornment={<InputAdornment position="end">cm</InputAdornment>}

              />
              <FormHelperText>Height</FormHelperText>
            </FormControl>
          </div>
          <div className="input-container" style={{ display: 'flex', justifyContent: 'center' }}>

          <Alert variant="outlined" severity="info" sx={{ m: 0, mt: 0, width: '20ch' }}>
          BMI: {calculateBMI()}
        </Alert>
        </div>

          <div>
            <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
              <InputLabel id="demo-simple-select-standard-label">Select Fitness Level</InputLabel>
              <Select
                value={fitnessLevel}
                onChange={handleFitnessLevelChange}
                sx={{ m: 2, mt: 0, width: '20ch' }}
                label="Fitness Level"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                <MenuItem value={"couch-potato"}>Couch Potato</MenuItem>
                <MenuItem value={"weekend-warrior"}>Weekend Warrior</MenuItem>
                <MenuItem value={"fitness-enthusiast"}>Fitness Enthusiast</MenuItem>
                <MenuItem value={"marathon-maniac"}>Parkrun Hero</MenuItem>
                <MenuItem value={"superhuman"}>Eliud Kipchoge</MenuItem>
              </Select>
            </FormControl>
          </div>
          
          <Divider />



          <div className="input-container">

            <FormControl  variant="standard" sx={{ m: 0, mt: 3, width: '20ch' }}>
              <Input
                type='number' value={targetDistance || ''} onChange={(e) => setTargetDistance(e.target.value ? parseFloat(e.target.value) : null)}
                endAdornment={<InputAdornment position="end">km</InputAdornment>}

              />
              <FormHelperText>Target Distance</FormHelperText>
            </FormControl>
          </div>
          <div className="input-container">

            <Typography id="input-slider" sx={{ m: 0, mt: 3, width: '25ch' }}
              gutterBottom>
              Speed (km/h)
            </Typography>
            <Slider
              defaultValue={10}
              width={10}
              value={pace}
              min={1}
              max={25}
              step={1}
              onChange={handlePaceChange}
              valueLabelDisplay="auto"
              sx={{ m: 0, mt: 0, width: '25ch' }}
            />
          </div>




          <div className="input-container">
            <Typography variant="subtitle1" sx={{ m: 0, mt: 3, width: '25ch' }} gutterBottom>
              Simulation Rate
            </Typography>
            <Slider
              value={simulationSpeed}
              min={1}
              max={100}
              step={1}
              sx={{ m: 0, mt: 0, width: '25ch' }}
              onChange={handleSimulationSpeedChange}
              valueLabelDisplay="auto"
            />
          </div>





          {simulationStarted ? (
            <button onClick={handleResetSimulation}>Reset Simulation</button>
          ) : (
            <button onClick={handleStartSimulation} disabled={!fitnessLevel}>
              Start Simulation
            </button>
          )}
        </div>
        <div className="main-content">
          {simulationStarted && (
            <ExerciseSimulation
              pace={pace}
              maxHeartRate={maxHeartRate}
              fitnessLevel={fitnessLevel}
              onResetSimulation={handleResetSimulation}
              simulationSpeed={simulationSpeed}
              targetDistance={targetDistance}
              weight={weight}
              height={height}
              gender={gender}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;