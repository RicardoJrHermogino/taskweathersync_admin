import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Card,
  Grid,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  Tooltip,
  Chip,
  Stack,
  FormControl,
  FormLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Close as CloseIcon,
  DeviceThermostat as TempIcon,
  WaterDrop as HumidityIcon,
  Air as WindIcon,
  Cloud as CloudIcon,
  Speed as PressureIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Layout from '../components/layout';
import { CircularProgress } from '@mui/material';
import ProtectedRoute from '../components/protectedRoute';

const colors = {
  primary: '#647CBF',
  secondary: '#8E9FBF',
  background: '#F7FAFC',
  text: '#2D3748',
  subtext: '#718096',
  error: '#FC8181',
  success: '#68D391',
  warning: '#F6AD55',
};

// Updated arrays for dropdown options with specific ranges
const temperatureOptionsMin = Array.from({ length: 3 }, (_, i) => i + 18); // 18-20°C
const temperatureOptionsMax = Array.from({ length: 17 }, (_, i) => i + 20); // 20-36°C

const humidityOptionsMin = Array.from({ length: 11 }, (_, i) => i + 60); // 60-70%
const humidityOptionsMax = Array.from({ length: 26 }, (_, i) => i + 70); // 70-95%

// Wind speed options in m/s with one decimal place
const windSpeedOptions = Array.from({ length: 101 }, (_, i) => (i / 10).toFixed(1)); // 0.0-10.0 m/s
const windGustOptions = Array.from({ length: 101 }, (_, i) => (i / 10).toFixed(1)); // 0.0-10.0 m/s

const pressureOptionsMin = Array.from({ length: 16 }, (_, i) => i + 1000); // 1000-1015 hPa
const pressureOptionsMax = Array.from({ length: 26 }, (_, i) => i + 1015); // 1015-1040 hPa

const getCloudCoverDescription = (percentage) => {
  const value = parseInt(percentage);
  if (value <= 10) return "Clear sky - Little to no clouds visible";
  if (value <= 25) return "Few clouds - Mostly sunny conditions";
  if (value <= 50) return "Scattered clouds - Partly cloudy";
  if (value <= 75) return "Broken clouds - Mostly cloudy";
  if (value <= 90) return "Overcast - Very cloudy with some breaks";
  return "Complete overcast - Sky completely covered";
};

const weatherConditions = [
  // Clear
  { id: '800', label: 'Clear sky', group: 'Clear' },
  
  // Clouds
  { id: '801', label: 'Few clouds (11-25%)', group: 'Clouds' },
  { id: '802', label: 'Scattered clouds (25-50%)', group: 'Clouds' },
  { id: '803', label: 'Broken clouds (51-84%)', group: 'Clouds' },
  { id: '804', label: 'Overcast clouds (85-100%)', group: 'Clouds' },
  
  // Rain
  { id: '500', label: 'Light rain', group: 'Rain' },
  { id: '501', label: 'Moderate rain', group: 'Rain' },
  { id: '502', label: 'Heavy intensity rain', group: 'Rain' },
  { id: '503', label: 'Very heavy rain', group: 'Rain' },
  { id: '504', label: 'Extreme rain', group: 'Rain' },
  { id: '520', label: 'Light intensity shower rain', group: 'Rain' },
  { id: '521', label: 'Shower rain', group: 'Rain' },
];

const getWindSpeedDescription = (speed) => {
  const speedNum = parseFloat(speed);
  if (speedNum < 0.5) return "Calm - Smoke rises vertically";
  if (speedNum < 1.5) return "Light air - Smoke drift shows wind direction";
  if (speedNum < 3.3) return "Light breeze - Leaves rustle, wind felt on face";
  if (speedNum < 5.5) return "Gentle breeze - Leaves and twigs in motion";
  if (speedNum < 8.0) return "Moderate breeze - Dust and paper raised, small branches move";
  if (speedNum < 10.7) return "Fresh breeze - Small trees sway";
  if (speedNum < 13.8) return "Strong breeze - Large branches in motion, umbrella use difficult";
  if (speedNum >= 13.8) return "Near gale or stronger - Whole trees in motion";
  return "";
};


const getPressureDescription = (pressure) => {
  const value = parseInt(pressure);
  if (value < 1000) return "Very low - Strong storm likely";
  if (value < 1005) return "Low - Stormy conditions likely";
  if (value < 1010) return "Moderately low - Unsettled weather";
  if (value < 1015) return "Slightly low - Changing conditions";
  if (value < 1020) return "Normal - Fair weather";
  if (value < 1025) return "Slightly high - Generally good weather";
  if (value < 1030) return "Moderately high - Very dry, stable conditions";
  return "Very high - Extremely dry and stable";
};

  // First, add this debugging function at the top level
  const debugWeatherRestrictions = (formRestrictions, conditionId) => {
    console.log('Form Restrictions:', formRestrictions);
    console.log('Condition ID:', conditionId);
    console.log('Types:', {
      formType: typeof formRestrictions[0],
      conditionType: typeof conditionId
    });
  };

  // Add this humidity description helper function
  const getHumidityDescription = (humidity) => {
    const value = parseInt(humidity);
    if (value < 60) return "Low - The air is dry, moisture evaporates quickly.";
    if (value < 70) return "Moderate - Some moisture in the air, but still balanced.";
    if (value < 80) return "High - The air holds a lot of moisture, making it feel damp.";
    if (value < 85) return "Very high - Excess moisture in the air, making surfaces feel sticky.";
    if (value < 90) return "Oppressive - The air is almost saturated with moisture, making it hard for sweat to evaporate.";
    return "Extreme - The air is nearly full of moisture, similar to a rainforest or after heavy rain.";
  };
  
  

  export default function TaskManagement() {
    const [tasks, setTasks] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const [sortBy, setSortBy] = useState('updated');
    const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

    const [form, setForm] = useState({
      task_name: '',
      weatherRestrictions: [],
      details: '',
      requiredTemperature_min: '',
      requiredTemperature_max: '',
      idealHumidity_min: '',
      idealHumidity_max: '',
      requiredWindSpeed_max: '',
      requiredWindGust_max: '',
      requiredCloudCover_max: '',
      requiredPressure_min: '',
      requiredPressure_max: '',
    });
    const [editId, setEditId] = useState(null);

    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/tasks?sort=${sortBy}`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        // Ensure data is an array
        setTasks(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError(err.message);
        setTasks([]);  // Reset to empty array on error
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchTasks();
    }, [sortBy]);

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!validateForm()) {
        return;
      }
    
      const method = editId ? 'PUT' : 'POST';
      const url = editId ? `/api/tasks/${editId}` : '/api/tasks';
    
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    
      if (res.ok) {
        fetchTasks();
        setSuccessMessage(editId ? 'Task updated successfully!' : 'Task added successfully!');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
        
        handleCloseForm();
      }
    };

    

    const handleCloseForm = () => {
      setForm({
        task_name: '',
        weatherRestrictions: [],
        details: '',
        requiredTemperature_min: '',
        requiredTemperature_max: '',
        idealHumidity_min: '',
        idealHumidity_max: '',
        requiredWindSpeed_max: '',
        requiredWindGust_max: '',
        requiredCloudCover_max: '',
        requiredPressure_min: '',
        requiredPressure_max: '',
      });
      setEditId(null);
      setShowForm(false);
      setActiveStep(0);
    };

    const requiredFields = {
      task_name: "Task Name",
      details: "Details",
      weatherRestrictions: "Weather Conditions",
      requiredTemperature_min: "Minimum Temperature",
      requiredTemperature_max: "Maximum Temperature",
      idealHumidity_min: "Minimum Humidity",
      idealHumidity_max: "Maximum Humidity",
      requiredWindSpeed_max: "Maximum Wind Speed",
      requiredWindGust_max: "Maximum Wind Gust",
      requiredCloudCover_max: "Maximum Cloud Cover",
      requiredPressure_min: "Minimum Pressure",
      requiredPressure_max: "Maximum Pressure"
    };

    const validateForm = () => {
      const emptyFields = [];
      
      Object.entries(requiredFields).forEach(([field, label]) => {
        if (field === 'weatherRestrictions') {
          if (!form[field] || form[field].length === 0) {
            emptyFields.push(label);
          }
        } else if (!form[field] || form[field] === '') {
          emptyFields.push(label);
        }
      });

      if (emptyFields.length > 0) {
        alert(`Please fill in all required fields: \n${emptyFields.join('\n')}`);
        return false;
      }

      return true;
    };

    const validateStep = (step) => {
      const stepFields = {
        0: ['task_name', 'details', 'weatherRestrictions'],
        1: ['requiredTemperature_min', 'requiredTemperature_max', 'idealHumidity_min', 'idealHumidity_max'],
        2: ['requiredWindSpeed_max', 'requiredWindGust_max', 'requiredCloudCover_max', 'requiredPressure_min', 'requiredPressure_max']
      };

      const emptyFields = [];
      stepFields[step].forEach(field => {
        if (field === 'weatherRestrictions') {
          if (!form[field] || form[field].length === 0) {
            emptyFields.push(requiredFields[field]);
          }
        } else if (!form[field] || form[field] === '') {
          emptyFields.push(requiredFields[field]);
        }
      });

      if (emptyFields.length > 0) {
        alert(`Please fill in all required fields: \n${emptyFields.join('\n')}`);
        return false;
      }
      return true;
    };

    const handleNext = () => {
      if (validateStep(activeStep)) {
        setActiveStep((prev) => prev + 1);
      }
    };

    const steps = ['Basic Info', 'Temperature & Humidity', 'Wind & Pressure'];

    const TaskCard = ({ task }) => (
      <Card sx={{ 
        p: 3, 
        mb: 2, 
        borderRadius: 2,
        boxShadow: 'rgba(149, 157, 165, 0.1) 0px 8px 24px',
        '&:hover': { transform: 'translateY(-2px)', transition: 'transform 0.2s' }
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ color: colors.text, mb: 1 }}>
              {task.task_name}
            </Typography>
            <Typography variant="body2" color={colors.subtext}>
              {task.details}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Edit">
            <IconButton 
              onClick={() => {
                setForm({
                  ...task,
                  weatherRestrictions: normalizeWeatherRestrictions(task.weatherRestrictions)
                });
                setEditId(task.task_id);
                setShowForm(true);
              }}
              size="small"
            >
              <EditIcon />
            </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton 
                onClick={() => handleDelete(task.task_id)}
                size="small"
                sx={{ color: colors.error }}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={1} alignItems="center">
              <TempIcon sx={{ color: colors.warning }} />
              <Typography variant="body2">
                Temperature: {task.requiredTemperature_min}°C to {task.requiredTemperature_max}°C
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={1} alignItems="center">
              <HumidityIcon sx={{ color: colors.primary }} />
              <Typography variant="body2">
                Humidity: {task.idealHumidity_min}% to {task.idealHumidity_max}%
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={1} alignItems="center">
              <WindIcon sx={{ color: colors.success }} />
              <Typography variant="body2">
                Wind Speed: Max {task.requiredWindSpeed_max} km/h
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={1} alignItems="center">
              <CloudIcon sx={{ color: colors.secondary }} />
              <Typography variant="body2">
                Cloud Cover: Max {task.requiredCloudCover_max}%
              </Typography>
            </Stack>
          </Grid>
        </Grid>

        {task.weatherRestrictions && task.weatherRestrictions.length > 0 && (
          <Box sx={{ mt: 2 }}>
            {task.weatherRestrictions.map((code) => {
              const condition = weatherConditions.find(c => c.id === String(code));
              return (
                <Chip 
                  key={code}
                  label={condition ? `${code} - ${condition.label}` : `${code} - Unknown`}
                  size="small"
                  sx={{ 
                    bgcolor: `${colors.primary}20`, 
                    color: colors.primary,
                    mr: 1,
                    mb: 1
                  }}
                />
              );
            })}
          </Box>
        )}

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color={colors.subtext}>
            <Stack direction="row" spacing={1} alignItems="center">
              <HistoryIcon sx={{ fontSize: 16 }} />
              Created: {new Date(task.created_at).toLocaleString()}
            </Stack>
          </Typography>
          <Typography variant="caption" color={colors.subtext}>
            <Stack direction="row" spacing={1} alignItems="center">
              <HistoryIcon sx={{ fontSize: 16 }} />
              Last modified: {new Date(task.updated_at).toLocaleString()}
            </Stack>
          </Typography>
        </Box>
      </Card>
    );

    const validateCurrentStepOnly = (step) => {
      const stepFields = {
        0: ['task_name', 'details', 'weatherRestrictions'],
        1: ['requiredTemperature_min', 'requiredTemperature_max', 'idealHumidity_min', 'idealHumidity_max'],
        2: ['requiredWindSpeed_max', 'requiredWindGust_max', 'requiredCloudCover_max', 'requiredPressure_min', 'requiredPressure_max']
      };
  
      const emptyFields = [];
      stepFields[step].forEach(field => {
        if (field === 'weatherRestrictions') {
          if (!form[field] || form[field].length === 0) {
            emptyFields.push(requiredFields[field]);
          }
        } else if (!form[field] || form[field] === '') {
          emptyFields.push(requiredFields[field]);
        }
      });
  
      if (emptyFields.length > 0) {
        alert(`Please fill in all required fields for this step: \n${emptyFields.join('\n')}`);
        return false;
      }
      return true;
    };

    const handlePartialSave = async () => {
      if (!validateCurrentStepOnly(activeStep)) {
        return;
      }
    
      const res = await fetch(`/api/tasks/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    
      if (res.ok) {
        fetchTasks();
        setSuccessMessage('Task updated successfully!');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
        
        handleCloseForm();
      }
    };

    const handleDelete = async (id) => {
      // Show simple confirmation dialog
      const confirmed = window.confirm("Are you sure you want to delete this task?");
      
      // Only proceed with deletion if user confirmed
      if (confirmed) {
        const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
        if (res.ok) {
          fetchTasks();
          setSuccessMessage('Task deleted successfully!');
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            setSuccessMessage(null);
          }, 3000);
        }
      }
    };

    const normalizeWeatherRestrictions = (restrictions) => {
      if (!Array.isArray(restrictions)) {
        console.warn('Weather restrictions is not an array:', restrictions);
        return [];
      }
      return restrictions.map(String);
    };

    

    const handleEdit = (task) => {
      setForm({
        ...task,
        weatherRestrictions: task.weatherRestrictions.map(Number) // Changed from String to Number
      });
      setEditId(task.task_id);
      setShowForm(true);
    };

    const getStepContent = (step) => {
      switch (step) {
        case 0:
          return (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Task Name"
                  value={form.task_name}
                  onChange={(e) => setForm({ ...form, task_name: e.target.value })}
                  fullWidth
                  variant="outlined"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Details"
                  value={form.details}
                  onChange={(e) => setForm({ ...form, details: e.target.value })}
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl component="fieldset" fullWidth>
                  <FormLabel component="legend" required>Weather Condition Requirements</FormLabel>
                  {Array.from(new Set(weatherConditions.map(c => c.group))).map(group => (
                    <Accordion key={group}>
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls={`${group}-content`}
                        id={`${group}-header`}
                      >
                        <Typography>
                          {group} ({weatherConditions.filter(c => c.group === group).length} conditions)
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <FormGroup>
                          {weatherConditions
                            .filter(condition => condition.group === group)
                            .map((condition) => (
                              <FormControlLabel
                                key={condition.id}
                                control={
                                  <Checkbox
                                    checked={Array.isArray(form.weatherRestrictions) && 
                                      form.weatherRestrictions.some(id => String(id) === String(condition.id))}
                                      onChange={(e) => {
                                        const newRestrictions = e.target.checked
                                          ? [...form.weatherRestrictions, Number(condition.id)]
                                          : form.weatherRestrictions.filter(id => Number(id) !== Number(condition.id));
                                        setForm({ ...form, weatherRestrictions: newRestrictions });
                                      }}
                                  />
                                }
                                label={`${condition.id} - ${condition.label}`}
                              />
                          ))}
                        </FormGroup>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </FormControl>
              </Grid>
            </Grid>
          );
        case 1:
          return (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color={colors.subtext} gutterBottom>
                  Temperature Range (°C)
                </Typography>
                <Stack direction="row" spacing={2}>
                  <FormControl fullWidth required>
                    <InputLabel>Minimum Temperature</InputLabel>
                    <Select
                      value={form.requiredTemperature_min}
                      onChange={(e) => setForm({ ...form, requiredTemperature_min: e.target.value })}
                      label="Minimum Temperature"
                      required
                    >
                      <MenuItem value="" disabled>Select Minimum Temperature</MenuItem>
                      {temperatureOptionsMin.map((temp) => (
                        <MenuItem key={temp} value={temp}>{temp}°C</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth required>
                    <InputLabel>Maximum Temperature</InputLabel>
                    <Select
                      value={form.requiredTemperature_max}
                      onChange={(e) => setForm({ ...form, requiredTemperature_max: e.target.value })}
                      label="Maximum Temperature"
                      required
                      error={form.requiredTemperature_max <= form.requiredTemperature_min}
                    >
                      <MenuItem value="" disabled>Select Maximum Temperature</MenuItem>
                      {temperatureOptionsMax.map((temp) => (
                        <MenuItem 
                          key={temp} 
                          value={temp}
                          disabled={temp <= form.requiredTemperature_min}
                        >
                          {temp}°C
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color={colors.subtext} gutterBottom>
                  Humidity Range (%)
                </Typography>
                <Stack direction="row" spacing={2}>
                <FormControl fullWidth required>
                  <InputLabel>Minimum Humidity</InputLabel>
                  <Select
                    value={form.idealHumidity_min}
                    onChange={(e) => setForm({ ...form, idealHumidity_min: e.target.value })}
                    label="Minimum Humidity"
                    required
                    renderValue={(value) => `${value}% - ${getHumidityDescription(value)}`}
                  >
                    <MenuItem value="" disabled>Select Minimum Humidity</MenuItem>
                    {humidityOptionsMin.map((humidity) => (
                      <MenuItem key={humidity} value={humidity}>
                        <Typography>{humidity}%</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          {getHumidityDescription(humidity)}
                        </Typography>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth required>
                  <InputLabel>Maximum Humidity</InputLabel>
                  <Select
                    value={form.idealHumidity_max}
                    onChange={(e) => setForm({ ...form, idealHumidity_max: e.target.value })}
                    label="Maximum Humidity"
                    required
                    error={form.idealHumidity_max <= form.idealHumidity_min}
                    renderValue={(value) => `${value}% - ${getHumidityDescription(value)}`}
                  >
                    <MenuItem value="" disabled>Select Maximum Humidity</MenuItem>
                    {humidityOptionsMax.map((humidity) => (
                      <MenuItem 
                        key={humidity} 
                        value={humidity}
                        disabled={humidity <= form.idealHumidity_min}
                      >
                        <Typography>{humidity}%</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          {getHumidityDescription(humidity)}
                        </Typography>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                </Stack>
              </Grid>
            </Grid>
          );
        case 2:
          return (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Maximum Wind Speed</InputLabel>
                <Select
                  value={form.requiredWindSpeed_max}
                  onChange={(e) => setForm({ ...form, requiredWindSpeed_max: e.target.value })}
                  label="Maximum Wind Speed"
                  required
                  renderValue={(value) => `${value} m/s - ${getWindSpeedDescription(value)}`}
                >
                  <MenuItem value="" disabled>Select Maximum Wind Speed</MenuItem>
                  {windSpeedOptions.map((speed) => (
                    <MenuItem key={speed} value={speed}>
                      <Typography>{speed} m/s</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        {getWindSpeedDescription(speed)}
                      </Typography>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Maximum Wind Gust</InputLabel>
                <Select
                  value={form.requiredWindGust_max}
                  onChange={(e) => setForm({ ...form, requiredWindGust_max: e.target.value })}
                  label="Maximum Wind Gust"
                  required
                  renderValue={(value) => `${value} m/s - ${getWindSpeedDescription(value)}`}
                >
                  <MenuItem value="" disabled>Select Maximum Wind Gust</MenuItem>
                  {windGustOptions.map((gust) => (
                    <MenuItem key={gust} value={gust}>
                      <Typography>{gust} m/s</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        {getWindSpeedDescription(gust)}
                      </Typography>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Maximum Cloud Cover</InputLabel>
                <Select
                  value={form.requiredCloudCover_max}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setForm({ ...form, requiredCloudCover_max: value });
                  }}
                  label="Maximum Cloud Cover"
                  required
                  renderValue={(value) => `${value}% - ${getCloudCoverDescription(value)}`}
                >
                  <MenuItem value="" disabled>Select Maximum Cloud Cover</MenuItem>
                  {Array.from({ length: 20 }, (_, i) => (i + 1) * 5).map((percentage) => (
                    <MenuItem key={percentage} value={percentage}>
                      <Typography>{percentage}%</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        {getCloudCoverDescription(percentage)}
                      </Typography>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color={colors.subtext} gutterBottom>
                  Pressure Range (hPa)
                </Typography>
                <Stack direction="row" spacing={2}>
                <FormControl fullWidth required>
                  <InputLabel>Minimum Pressure</InputLabel>
                  <Select
                    value={form.requiredPressure_min}
                    onChange={(e) => setForm({ ...form, requiredPressure_min: e.target.value })}
                    label="Minimum Pressure"
                    required
                    renderValue={(value) => `${value} hPa - ${getPressureDescription(value)}`}
                  >
                    <MenuItem value="" disabled>Select Minimum Pressure</MenuItem>
                    {pressureOptionsMin.map((pressure) => (
                      <MenuItem key={pressure} value={pressure}>
                        <Typography>{pressure} hPa</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          {getPressureDescription(pressure)}
                        </Typography>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth required>
                  <InputLabel>Maximum Pressure</InputLabel>
                  <Select
                    value={form.requiredPressure_max}
                    onChange={(e) => setForm({ ...form, requiredPressure_max: e.target.value })}
                    label="Maximum Pressure"
                    required
                    error={form.requiredPressure_max <= form.requiredPressure_min}
                    renderValue={(value) => `${value} hPa - ${getPressureDescription(value)}`}
                  >
                    <MenuItem value="" disabled>Select Maximum Pressure</MenuItem>
                    {pressureOptionsMax.map((pressure) => (
                      <MenuItem 
                        key={pressure} 
                        value={pressure}
                        disabled={pressure <= form.requiredPressure_min}
                      >
                        <Typography>{pressure} hPa</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          {getPressureDescription(pressure)}
                        </Typography>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                </Stack>
              </Grid>
            </Grid>
          );
        default:
          return null;
    }
  };

  return (
    <ProtectedRoute>
    <Layout>
      <Box sx={{ bgcolor: colors.background, minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ color: colors.text, fontWeight: 600 }}>
              Coconut Tasks 
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FormControl size="small">
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  sx={{ minWidth: 200 }}
                >
                  <MenuItem value="updated">Latest Modified</MenuItem>
                  <MenuItem value="created">Latest Added</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowForm(true)}
                sx={{
                  bgcolor: colors.primary,
                  '&:hover': { bgcolor: colors.secondary },
                }}
              >
                Add Task
              </Button>
            </Box>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ 
              p: 3, 
              bgcolor: '#FFF3F3', 
              borderRadius: 2,
              color: colors.error,
              textAlign: 'center' 
            }}>
              <Typography>Error loading tasks: {error}</Typography>
              <Button 
                onClick={fetchTasks}
                sx={{ mt: 2 }}
                variant="outlined"
                color="error"
              >
                Retry
              </Button>
            </Box>
          ) : tasks.length === 0 ? (
            <Box sx={{ 
              p: 4, 
              textAlign: 'center',
              bgcolor: 'white',
              borderRadius: 2,
              boxShadow: 'rgba(149, 157, 165, 0.1) 0px 8px 24px',
            }}>
              <Typography color={colors.subtext} mb={2}>
                No tasks found
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowForm(true)}
                sx={{
                  bgcolor: colors.primary,
                  '&:hover': { bgcolor: colors.secondary },
                }}
              >
                Add Your First Task
              </Button>
            </Box>
          ) : (
            tasks.map((task) => (
              <TaskCard key={task.task_id} task={task} />
            ))
          )}

<Dialog open={showForm} onClose={handleCloseForm} maxWidth="md" fullWidth>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              {editId ? 'Edit Task' : 'New Task'}
            </Typography>
            <IconButton onClick={handleCloseForm}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === steps.length - 1 ? (
            <form onSubmit={handleSubmit}>
              {getStepContent(activeStep)}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={() => setActiveStep((prev) => prev - 1)}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  type="submit"
                  sx={{ bgcolor: colors.primary, '&:hover': { bgcolor: colors.secondary } }}
                >
                  {editId ? 'Update Task' : 'Create Task'}
                </Button>
              </Box>
            </form>
          ) : (
            <Box>
              {getStepContent(activeStep)}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={() => setActiveStep((prev) => prev - 1)}
                >
                  Back
                </Button>
                <Stack direction="row" spacing={2}>
                  {editId && (
                    <Button
                      variant="contained"
                      onClick={handlePartialSave}
                      sx={{ 
                        bgcolor: colors.success, 
                        '&:hover': { bgcolor: '#56c17f' }
                      }}
                    >
                      Save Changes
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    sx={{ bgcolor: colors.primary, '&:hover': { bgcolor: colors.secondary } }}
                  >
                    Next
                  </Button>
                </Stack>
              </Box>
            </Box>
          )}
        </Box>
      </Dialog>
      {successMessage && (
  <Box
  sx={{
    position: 'fixed',
    top: 0, // Position at the very top
    left: '50%', // Move to center horizontally
    transform: 'translateX(-50%)', // Adjust to center properly
    bgcolor: colors.success,
    color: 'white',
    p: 2,
    borderRadius: 1,
    boxShadow: 3,
    zIndex: 1300,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 'fit-content', // Adjust width to content size
    minWidth: '200px', // Set a minimum width for better visibility
    textAlign: 'center',
  }}
>
  <Typography>{successMessage}</Typography>
</Box>

)}
        </Container>
      </Box>
    </Layout>
    </ProtectedRoute>
  );
  }
