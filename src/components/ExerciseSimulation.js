import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Typography, Grid, Card, CardContent, Paper, Alert, Button } from '@mui/material';

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function formatPace(pace) {
  if (pace === 0) {
    return '0:00';
  }

  const totalSeconds = Math.round(pace * 60);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function calculateCalorieBurn(pace, weight, elapsedTime) {
  const time = elapsedTime / 60; // Convert seconds to minutes
  let met = 0;

  if (pace < 6.4) {
    met = 5;
  } else if (pace < 8) {
    met = 8.3;
  } else if (pace < 8.3) {
    met = 9;
  } else if (pace < 9.7) {
    met = 9.8;
  } else if (pace < 10.8) {
    met = 10.5;
  } else if (pace < 11.3) {
    met = 11;
  } else if (pace < 12.1) {
    met = 11.5;
  } else if (pace < 12.9) {
    met = 11.8;
  } else if (pace < 13.8) {
    met = 12.3;
  } else if (pace < 14.5) {
    met = 12.8;
  } else if (pace < 16.1) {
    met = 14.5;
  } else if (pace < 17.7) {
    met = 16;
  } else if (pace < 19.3) {
    met = 19;
  } else if (pace < 20.9) {
    met = 19.8;
  } else {
    met = 23;
  }

  const calorieBurn = (met * weight * 3.5) / 200 * time;
  return calorieBurn.toFixed(0);
}


function calculateSummaryStats(elapsedTime, distance, simulationData, targetDistance, energyLevel) {
  const totalTime = elapsedTime;
  const totalDistance = distance;
  const avgSpeed = totalDistance ? (totalDistance / (totalTime / 3600)).toFixed(1) : '0.0';
  const avgPace = totalDistance ? formatPace(totalTime / 60 / totalDistance) : '0:00';
  const avgHeartRate = simulationData.length ? Math.round(simulationData.reduce((sum, data) => sum + data.heartRate, 0) / simulationData.length) : 0;
  const maxSimulationHeartRate = simulationData.length ? Math.max(...simulationData.map((data) => data.heartRate)) : 0;

  return {
    avgPace,
    avgSpeed,
    totalTime: formatTime(totalTime),
    distance: totalDistance.toFixed(2),
    avgHeartRate: avgHeartRate.toString(),
    maxHeartRate: maxSimulationHeartRate.toString(),
    reachedTargetDistance: targetDistance && totalDistance >= targetDistance,
    energyLevelReachedZero: energyLevel === 0,
  };
}

function ExerciseSimulation({ pace, maxHeartRate, fitnessLevel, onResetSimulation, simulationSpeed, targetDistance, weight, height, gender }) {
  const [heartRate, setHeartRate] = useState(0);
  const [energyLevel, setEnergyLevel] = useState(100);
  const [simulationData, setSimulationData] = useState([]);
  const [simulationPaused, setSimulationPaused] = useState(false);
  const [simulationEnded, setSimulationEnded] = useState(false);
  const [simulationSummary, setSimulationSummary] = useState(null);
  const [distance, setDistance] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let calculatedHeartRate;
    switch (fitnessLevel) {
      case 'couch-potato':
        calculatedHeartRate = 80 + pace * 10;
        break;
      case 'weekend-warrior':
        calculatedHeartRate = 75 + pace * 8.5;
        break;
      case 'fitness-enthusiast':
        calculatedHeartRate = 70 + pace * 7.5;
        break;
      case 'marathon-maniac':
        calculatedHeartRate = 65 + pace * 6.5;
        break;
      case 'superhuman':
        calculatedHeartRate = 60 + pace * 5;
        break;
      default:
        calculatedHeartRate = 70 + pace * 6;
    }
    setHeartRate(calculatedHeartRate);
  }, [pace, fitnessLevel]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!simulationPaused && !simulationEnded) {
        setEnergyLevel((prevEnergyLevel) => {
          const targetHeartRate = maxHeartRate * 0.7;
          const heartRateDifference = heartRate - targetHeartRate;
          
          let energyChangeRate;
          if (heartRate < targetHeartRate) {
            // Heart rate is below the target, energy levels go up
            energyChangeRate = (heartRate - targetHeartRate) / 2000;
          } else {
            // Heart rate is above or equal to the target, energy levels go down
            energyChangeRate = (heartRate - targetHeartRate) / 500;
            if (heartRate > maxHeartRate) {
                energyChangeRate = (heartRate - targetHeartRate) / 100;

            }
          }
          
          // Adjust energyChangeRate based on fitness level
          switch (fitnessLevel) {
            case 'couch-potato':
              energyChangeRate *= 1.5;
              break;
            case 'weekend-warrior':
              energyChangeRate *= 1.2;
              break;
            case 'fitness-enthusiast':
              energyChangeRate *= 1;
              break;
            case 'marathon-maniac':
              energyChangeRate *= 0.5;
              break;
            case 'superhuman':
              energyChangeRate *= 0.25;
              break;
            default:
              energyChangeRate *= 1;
          }
          
          const energyChange = energyChangeRate * simulationSpeed;
          const newEnergyLevel = prevEnergyLevel - energyChange;
          
          return Math.max(Math.min(newEnergyLevel, 100), 0);
        });
  
        setDistance((prevDistance) => {
          const newDistance = prevDistance + (pace / 3600) * simulationSpeed;
          if (targetDistance && newDistance >= targetDistance) {
            setSimulationPaused(true);
            setSimulationEnded(true);
          }
          return newDistance;
        });
  
        setElapsedTime((prevElapsedTime) => prevElapsedTime + simulationSpeed);
      }
    }, 1000);
  
    return () => {
      clearInterval(interval);
    };
  }, [heartRate, maxHeartRate, simulationPaused, simulationEnded, pace, simulationSpeed, targetDistance, fitnessLevel]);

  useEffect(() => {
    if (energyLevel === 0) {
      setSimulationPaused(true);
      setSimulationEnded(true);
    }
  }, [energyLevel]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!simulationPaused && !simulationEnded) {
        setSimulationData((prevData) => [
          ...prevData,
          {
            elapsedTime,
            heartRate,
            energyLevel,
          },
        ]);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [elapsedTime, heartRate, energyLevel, simulationPaused, simulationEnded, simulationSpeed]);

  useEffect(() => {
    if (simulationEnded) {
      const summary = calculateSummaryStats(elapsedTime, distance, simulationData, targetDistance, energyLevel);
      setSimulationSummary(summary);
    }
  }, [simulationEnded, elapsedTime, distance, simulationData, targetDistance, energyLevel]);

  const handlePauseSimulation = () => {
    setSimulationPaused((prevPaused) => !prevPaused);
  };

  const handleEndSimulation = () => {
    setSimulationPaused(true);
    setSimulationEnded(true);
  };

  const paceFormatted = formatPace(60 / pace);
  const timeFormatted = formatTime(elapsedTime);
  const calorieBurn = calculateCalorieBurn(pace, weight, elapsedTime);

  const chartData = simulationData.map((data) => ({
    ...data,
    time: formatTime(data.elapsedTime),
  }));

  return (
    <div className="simulation-container">
      <Grid container spacing={3}>
        

        {!simulationEnded && (
          <>
        <Grid item xs={12}>
          <Typography variant="h4" component="h1" gutterBottom>
            Exercise Simulation Dashboard
          </Typography>
        </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h2" gutterBottom>
                    Heart Rate
                  </Typography>
                  <Typography
                    variant="body1"
                    align="center"
                    className={heartRate > maxHeartRate ? 'heart-rate-exceeded' : ''}
                  >
                    {heartRate.toFixed(0)} bpm
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h2" gutterBottom>
                    Energy Level
                  </Typography>
                  <Typography variant="body1" align="center">
                    {energyLevel.toFixed(0)}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h2" gutterBottom>
                    Distance
                  </Typography>
                  <Typography variant="body1" align="center">
                    {distance.toFixed(2)} km
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h2" gutterBottom>
                    Pace
                  </Typography>
                  <Typography variant="body1" align="center">
                    {paceFormatted} /km
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h2" gutterBottom>
                    Speed
                  </Typography>
                  <Typography variant="body1" align="center">
                    {pace.toFixed(1)} km/h
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h2" gutterBottom>
                    Time
                  </Typography>
                  <Typography variant="body1" align="center">
                    {timeFormatted}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sx={{ m: 0, mt: 3, width: '40ch' }}>


                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handlePauseSimulation}
                    style={{ marginRight: '16px' }}
                  >
                    {simulationPaused ? 'Resume' : 'Pause'} Simulation
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleEndSimulation}
                    disabled={simulationPaused || simulationEnded}
                  >
                    End Simulation
                  </Button>

            </Grid>
          </>
        )}
        {simulationEnded && simulationSummary && (
          <>
        <Grid item xs={12}>
          <Typography variant="h4" component="h1" gutterBottom>
            Summary
          </Typography>
        </Grid>
            {simulationSummary.reachedTargetDistance && (
              <Grid item xs={12} style={{ display: 'flex', justifyContent: 'center' }}>

                    <Alert variant="outlined" style={{ display: 'flex', justifyContent: 'center' }} 
                    severity="success" sx={{ m: 0, mt: 0, width: '40ch' }}>
                        Target distance of {targetDistance} km reached!
                    </Alert>

              </Grid>
            )}
            {simulationSummary.energyLevelReachedZero && (
                            <Grid item xs={12} style={{ display: 'flex', justifyContent: 'center' }}>

                            <Alert variant="outlined" style={{ display: 'flex', justifyContent: 'center' }} 
                            severity="error" sx={{ m: 0, mt: 0, width: '40ch' }}>
                                Energy level reached 0%!
                            </Alert>
        
                      </Grid>
            )}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    Average Pace
                  </Typography>
                  <Typography variant="body1" align="center">
                    {simulationSummary.avgPace} /km
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    Average Speed
                  </Typography>
                  <Typography variant="body1" align="center">
                    {simulationSummary.avgSpeed} km/h
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    Distance
                  </Typography>
                  <Typography variant="body1" align="center">
                    {simulationSummary.distance} km
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={2.5}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    Total Time
                  </Typography>
                  <Typography variant="body1" align="center">
                    {simulationSummary.totalTime}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3.5}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    Average Heart Rate
                  </Typography>
                  <Typography variant="body1" align="center">
                    {simulationSummary.avgHeartRate} bpm
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    Max Heart Rate
                  </Typography>
                  <Typography variant="body1" align="center">
                    {simulationSummary.maxHeartRate} bpm
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    Calorie Burn
                  </Typography>
                  <Typography variant="body1" align="center">
                    {calorieBurn} kcal
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
        <Grid item xs={12} sx={{ m: 0, mt: 3}}>
          <Paper>
            <div className="chart-container">
            <LineChart width={800} height={400} data={chartData}>
          <XAxis dataKey="time" />
          <YAxis
            yAxisId="left"
            label={{ value: 'Heart Rate (BPM)', angle: -90, position: 'insideLeft' }}
            domain={[dataMin => Math.floor(dataMin * 0.9), dataMax => Math.ceil(dataMax * 1.1)]}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            label={{ value: 'Energy Level (%)', angle: 90, position: 'insideRight' }}
            domain={[0, 100]}
          />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="heartRate"
            stroke="#8884d8"
            name="Heart Rate"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="energyLevel"
            stroke="#82ca9d"
            name="Energy Level"
          />
        </LineChart>
            </div>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}

export default ExerciseSimulation;