import React, { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
} from '@mui/material';

export default function CoconutTasks() {
  const [form, setForm] = useState({
    task_name: '',
    weatherRestrictions: '',
    details: '',
    requiredTemperature_min: '',
    requiredTemperature_max: '',
    idealHumidity_max: '',
    requiredWindSpeed_max: '',
    requiredWindGust_max: '',
    requiredCloudCover_max: '',
    requiredPressure_min: '',
    requiredPressure_max: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/coconutTasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const data = await res.json();
        setMessage(data.message || 'Task added successfully!');
        setForm({
          task_name: '',
          weatherRestrictions: '',
          details: '',
          requiredTemperature_min: '',
          requiredTemperature_max: '',
          idealHumidity_max: '',
          requiredWindSpeed_max: '',
          requiredWindGust_max: '',
          requiredCloudCover_max: '',
          requiredPressure_min: '',
          requiredPressure_max: '',
        });
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'An error occurred');
      }
    } catch (err) {
      setError('An error occurred while submitting the form');
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Add Coconut Task
      </Typography>

      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
        <TextField
          label="Task Name"
          name="task_name"
          value={form.task_name}
          onChange={handleChange}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <TextField
          label="Weather Restrictions"
          name="weatherRestrictions"
          value={form.weatherRestrictions}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Details"
          name="details"
          value={form.details}
          onChange={handleChange}
          fullWidth
          multiline
          rows={3}
          sx={{ mb: 2 }}
        />
        {[
          'requiredTemperature_min',
          'requiredTemperature_max',
          'idealHumidity_max',
          'requiredWindSpeed_max',
          'requiredWindGust_max',
          'requiredCloudCover_max',
          'requiredPressure_min',
          'requiredPressure_max',
        ].map((field) => (
          <TextField
            key={field}
            label={field.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())}
            name={field}
            value={form[field]}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          />
        ))}

        <Button variant="contained" type="submit" fullWidth>
          Add Task
        </Button>
      </Box>
    </Container>
  );
}
