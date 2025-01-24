// import React, { useEffect, useState } from 'react';
// import {
//   Container,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   Typography,
//   CircularProgress,
//   TextField,
//   Button,
//   IconButton,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   Box,
//   Alert,
//   AlertTitle,
//   Tooltip,
//   Grid,
//   Card,
//   CardContent,
//   useTheme,
//   useMediaQuery,
//   Stack
// } from '@mui/material';
// import EditIcon from '@mui/icons-material/Edit';
// import DeleteIcon from '@mui/icons-material/Delete';
// import AddIcon from '@mui/icons-material/Add';
// import Layout from '../components/layout';
// // import { useSession } from 'next-auth/react';
// // import { useRouter } from 'next/router';

// const TasksPage = () => {
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('md'));
//   const [tasks, setTasks] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [errorDetails, setErrorDetails] = useState(null);
//   const [editingTask, setEditingTask] = useState(null);
//   const [openDialog, setOpenDialog] = useState(false);
//   const [formData, setFormData] = useState({
//     task_name: '',
//     weatherRestrictions: '',
//     details: '',
//     requiredTemperature_min: '',
//     requiredTemperature_max: '',
//     idealHumidity_min: '',
//     idealHumidity_max: '',
//     requiredWindSpeed_max: '',
//     requiredWindGust_max: '',
//     requiredCloudCover_max: '',
//     requiredPressure_min: '',
//     requiredPressure_max: '',
//   });
//   // const { data: session, status } = useSession(); // Get session data and status
//   //   const router = useRouter();
  
//   //   useEffect(() => {
//   //     // Wait until the session is fully loaded
//   //     if (status === 'loading') return; // Skip the redirect during loading state
    
//   //     // If there is no session, redirect to login page
//   //     if (!session) {
//   //       router.push('/'); // Redirect to login if there's no session
//   //     } else {
//   //       fetchTasks(); // Fetch tasks if the session exists
//   //     }
//   //   }, [session, status, router]); // Dependencies: session, status, router
    
    

    
//   const fieldLabels = {
//     task_name: 'Task Name',
//     weatherRestrictions: 'Weather Conditions',
//     details: 'Task Description',
//     requiredTemperature_min: 'Min Temperature (°C)',
//     requiredTemperature_max: 'Max Temperature (°C)',
//     idealHumidity_min: 'Min Humidity (%)',
//     idealHumidity_max: 'Max Humidity (%)',
//     requiredWindSpeed_max: 'Max Wind Speed (km/h)',
//     requiredWindGust_max: 'Max Wind Gust (km/h)',
//     requiredCloudCover_max: 'Max Cloud Cover (%)',
//     requiredPressure_min: 'Min Pressure (hPa)',
//     requiredPressure_max: 'Max Pressure (hPa)',
//   };

//   useEffect(() => {
//     fetchTasks();
//   }, []);

//   const fetchTasks = async () => {
//     try {
//       const response = await fetch('/api/getTasks');
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || 'Failed to load tasks');
//       }
//       const data = await response.json();
//       setTasks(data);
//       setError(null);
//       setErrorDetails(null);
//     } catch (err) {
//       setError(err.message);
//       setErrorDetails(err.code ? `Error code: ${err.code}` : null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleOpenDialog = (task = null) => {
//     setEditingTask(task);
//     setFormData(task || {
//       task_name: '',
//       weatherRestrictions: '',
//       details: '',
//       requiredTemperature_min: '',
//       requiredTemperature_max: '',
//       idealHumidity_min: '',
//       idealHumidity_max: '',
//       requiredWindSpeed_max: '',
//       requiredWindGust_max: '',
//       requiredCloudCover_max: '',
//       requiredPressure_min: '',
//       requiredPressure_max: '',
//     });
//     setOpenDialog(true);
//     setError(null);
//     setErrorDetails(null);
//   };

//   const handleCloseDialog = () => {
//     setOpenDialog(false);
//     setEditingTask(null);
//     setError(null);
//     setErrorDetails(null);
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prevData) => ({
//       ...prevData,
//       [name]: value,
//     }));
//   };

//   const handleSaveTask = async () => {
//     try {

  
//       const method = editingTask ? 'PUT' : 'POST';
//       const url = editingTask 
//         ? `/api/adminGetTasks/${editingTask.task_id}` 
//         : '/api/adminGetTasks';
      
//       const response = await fetch(url, {
//         method,
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formData),
//       });
  
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || `Failed to ${editingTask ? 'update' : 'create'} task`);
//       }
  
//       const updatedTask = await response.json();
//       setTasks((prevTasks) => {
//         if (editingTask) {
//           return prevTasks.map((task) => 
//             task.task_id === updatedTask.task_id ? updatedTask : task
//           );
//         }
//         return [updatedTask, ...prevTasks];
//       });
  
//       handleCloseDialog();
//     } catch (err) {
//       setError(err.message);
//       setErrorDetails(err.code ? `Error code: ${err.code}` : null);
//     }
//   };
  

//   const handleDeleteTask = async (task_id, taskName) => {
//     if (!window.confirm(`Are you sure you want to delete "${taskName}"?`)) return;
  
//     try {
//       const response = await fetch(`/api/adminGetTasks/${task_id}`, { 
//         method: 'DELETE' 
//       });
      
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || 'Failed to delete task');
//       }
  
//       setTasks((prevTasks) => prevTasks.filter((task) => task.task_id !== task_id));
//     } catch (err) {
//       setError(err.message);
//       setErrorDetails(err.code ? `Error code: ${err.code}` : null);
//     }
//   };
  

//   const renderMobileCard = (task) => (
//     <Card key={task.task_id} sx={{ mb: 2 }}>
//       <CardContent>
//         <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
//           <Typography variant="h6">{task.task_name}</Typography>
//           <Box>
//             <IconButton onClick={() => handleOpenDialog(task)} size="small">
//               <EditIcon />
//             </IconButton>
//             <IconButton
//               onClick={() => handleDeleteTask(task.task_id, task.task_name)}
//               color="error"
//               size="small"
//             >
//               <DeleteIcon />
//             </IconButton>
//           </Box>
//         </Box>
        
//         <Stack spacing={1}>
//           <Box>
//             <Typography variant="subtitle2" color="textSecondary">
//               Weather Conditions
//             </Typography>
//             <Typography>{task.weatherRestrictions || 'None specified'}</Typography>
//           </Box>

//           <Box>
//             <Typography variant="subtitle2" color="textSecondary">
//               Description
//             </Typography>
//             <Typography>{task.details || 'No description'}</Typography>
//           </Box>

//           <Box>
//             <Typography variant="subtitle2" color="textSecondary">
//               Temperature Range
//             </Typography>
//             <Typography>
//               {task.requiredTemperature_min && task.requiredTemperature_max
//                 ? `${task.requiredTemperature_min}°C - ${task.requiredTemperature_max}°C`
//                 : 'No restrictions'}
//             </Typography>
//           </Box>

//           <Box>
//             <Typography variant="subtitle2" color="textSecondary">
//               Humidity Range
//             </Typography>
//             <Typography>
//             {task.idealHumidity_min && task.idealHumidity_max
//                 ? `${task.idealHumidity_min}% - ${task.idealHumidity_max}%`
//                 : 'No restrictions'}
//             </Typography>
//           </Box>

//           <Box>
//             <Typography variant="subtitle2" color="textSecondary">
//               Wind Conditions
//             </Typography>
//             <Typography>
//               {task.requiredWindSpeed_max
//                 ? `Up to ${task.requiredWindSpeed_max} km/h`
//                 : 'No restrictions'}
//             </Typography>
//           </Box>
//         </Stack>
//       </CardContent>
//     </Card>
//   );

//   const renderDesktopTable = () => (
//     <TableContainer component={Paper}>
//       <Table size="medium">
//         <TableHead>
//           <TableRow>
//             <TableCell>Task Name</TableCell>
//             <TableCell>Weather Conditions</TableCell>
//             <TableCell>Description</TableCell>
//             <TableCell>Temperature Range</TableCell>
//             <TableCell>Humidity Range</TableCell>
//             <TableCell>Wind Limits</TableCell>
//             <TableCell>Actions</TableCell>
//           </TableRow>
//         </TableHead>
//         <TableBody>
//           {tasks.map((task) => (
//             <TableRow key={task.task_id} hover>
//               <TableCell>{task.task_name}</TableCell>
//               <TableCell>{task.weatherRestrictions || '-'}</TableCell>
//               <TableCell>{task.details || '-'}</TableCell>
//               <TableCell>
//                 {task.requiredTemperature_min && task.requiredTemperature_max
//                   ? `${task.requiredTemperature_min}°C - ${task.requiredTemperature_max}°C`
//                   : '-'}
//               </TableCell>
//               <TableCell>
//                 {task.idealHumidity_min && task.idealHumidity_max
//                   ? `${task.idealHumidity_min}% - ${task.idealHumidity_max}%`
//                   : '-'}
//               </TableCell>
//               <TableCell>
//                 {task.requiredWindSpeed_max
//                   ? `Up to ${task.requiredWindSpeed_max} km/h`
//                   : '-'}
//               </TableCell>
//               <TableCell>
//                 <Tooltip title="Edit Task">
//                   <IconButton onClick={() => handleOpenDialog(task)} size="small">
//                     <EditIcon />
//                   </IconButton>
//                 </Tooltip>
//                 <Tooltip title="Delete Task">
//                   <IconButton
//                     onClick={() => handleDeleteTask(task.task_id, task.task_name)}
//                     color="error"
//                     size="small"
//                   >
//                     <DeleteIcon />
//                   </IconButton>
//                 </Tooltip>
//               </TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     </TableContainer>
//   );

//   if (loading) {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
//         <CircularProgress />
//       </Box>
//     );
//   }

//   return (
//     <Layout>
//       <Container maxWidth="xl" sx={{ py: 4 }}>
//         <Box sx={{ 
//           display: 'flex', 
//           flexDirection: isMobile ? 'column' : 'row',
//           justifyContent: 'space-between', 
//           alignItems: isMobile ? 'stretch' : 'center',
//           mb: 3,
//           gap: 2
//         }}>
//           <Typography variant="h4" component="h1">
//             Weather-Dependent Tasks
//           </Typography>
//           <Button
//             variant="contained"
//             color="primary"
//             startIcon={<AddIcon />}
//             onClick={() => handleOpenDialog()}
//             fullWidth={isMobile}
//           >
//             Add New Task
//           </Button>
//         </Box>

//         {error && (
//           <Alert 
//             severity="error" 
//             sx={{ mb: 2 }}
//             action={
//               <Button color="inherit" size="small" onClick={() => {
//                 setError(null);
//                 setErrorDetails(null);
//               }}>
//                 Dismiss
//               </Button>
//             }
//           >
//             <AlertTitle>Error</AlertTitle>
//             {error}
//             {errorDetails && (
//               <Typography variant="caption" display="block">
//                 {errorDetails}
//               </Typography>
//             )}
//           </Alert>
//         )}

//         {isMobile ? (
//           <Stack spacing={2}>
//             {tasks.map(renderMobileCard)}
//           </Stack>
//         ) : (
//           renderDesktopTable()
//         )}

//         <Dialog
//           open={openDialog}
//           onClose={handleCloseDialog}
//           maxWidth="md"
//           fullWidth
//           fullScreen={isMobile}
//         >
//           <DialogTitle>
//             {editingTask ? `Edit Task: ${editingTask.task_name}` : 'Add New Task'}
//           </DialogTitle>
//           <DialogContent>
//             <Grid container spacing={2} sx={{ mt: 1 }}>
//               <Grid item xs={12}>
//                 <TextField
//                   label={fieldLabels.task_name}
//                   name="task_name"
//                   value={formData.task_name}
//                   onChange={handleChange}
//                   fullWidth
//                   required
//                   error={!formData.task_name?.trim()}
//                   helperText={!formData.task_name?.trim() ? 'Task name is required' : ''}
//                 />
//               </Grid>
//               <Grid item xs={12}>
//                 <TextField
//                   label={fieldLabels.details}
//                   name="details"
//                   value={formData.details}
//                   onChange={handleChange}
//                   fullWidth
//                   multiline
//                   rows={3}
//                 />
//               </Grid>
//               <Grid item xs={12}>
//                 <TextField
//                   label={fieldLabels.weatherRestrictions}
//                   name="weatherRestrictions"
//                   value={formData.weatherRestrictions}
//                   onChange={handleChange}
//                   fullWidth
//                   multiline
//                   rows={2}
//                 />
//               </Grid>
              
//               <Grid item xs={12}>
//                 <Typography variant="subtitle1" sx={{ mb: 2 }}>
//                   Temperature Range
//                 </Typography>
//                 <Grid container spacing={2}>
//                   <Grid item xs={12} sm={6}>
//                     <TextField
//                       label={fieldLabels.requiredTemperature_min}
//                       name="requiredTemperature_min"
//                       value={formData.requiredTemperature_min}
//                       onChange={handleChange}
//                       fullWidth
//                       type="number"
//                     />
//                   </Grid>
//                   <Grid item xs={12} sm={6}>
//                     <TextField
//                       label={fieldLabels.requiredTemperature_max}
//                       name="requiredTemperature_max"
//                       value={formData.requiredTemperature_max}
//                       onChange={handleChange}
//                       fullWidth
//                       type="number"
//                     />
//                   </Grid>
//                 </Grid>
//               </Grid>

//               <Grid item xs={12}>
//                 <Typography variant="subtitle1" sx={{ mb: 2 }}>
//                   Humidity Range
//                 </Typography>
//                 <Grid container spacing={2}>
//                   <Grid item xs={12} sm={6}>
//                     <TextField
//                       label={fieldLabels.idealHumidity_min}
//                       name="idealHumidity_min"
//                       value={formData.idealHumidity_min}
//                       onChange={handleChange}
//                       fullWidth
//                       type="number"
//                     />
//                   </Grid>
//                   <Grid item xs={12} sm={6}>
//                     <TextField
//                       label={fieldLabels.idealHumidity_max}
//                       name="idealHumidity_max"
//                       value={formData.idealHumidity_max}
//                       onChange={handleChange}
//                       fullWidth
//                       type="number"
//                     />
//                   </Grid>
//                 </Grid>
//               </Grid>

//               <Grid item xs={12}>
//                 <Typography variant="subtitle1" sx={{ mb: 2 }}>
//                   Wind Conditions
//                 </Typography>
//                 <Grid container spacing={2}>
//                   <Grid item xs={12} sm={6}>
//                     <TextField
//                       label={fieldLabels.requiredWindSpeed_max}
//                       name="requiredWindSpeed_max"
//                       value={formData.requiredWindSpeed_max}
//                       onChange={handleChange}
//                       fullWidth
//                       type="number"
//                     />
//                   </Grid>
//                   <Grid item xs={12} sm={6}>
//                     <TextField
//                       label={fieldLabels.requiredWindGust_max}
//                       name="requiredWindGust_max"
//                       value={formData.requiredWindGust_max}
//                       onChange={handleChange}
//                       fullWidth
//                       type="number"
//                     />
//                   </Grid>
//                 </Grid>
//               </Grid>

//               <Grid item xs={12}>
//                 <Typography variant="subtitle1" sx={{ mb: 2 }}>
//                   Other Conditions
//                 </Typography>
//                 <Grid container spacing={2}>
//                   <Grid item xs={12} sm={4}>
//                     <TextField
//                       label={fieldLabels.requiredCloudCover_max}
//                       name="requiredCloudCover_max"
//                       value={formData.requiredCloudCover_max}
//                       onChange={handleChange}
//                       fullWidth
//                       type="number"
//                     />
//                   </Grid>
//                   <Grid item xs={12} sm={4}>
//                     <TextField
//                       label={fieldLabels.requiredPressure_min}
//                       name="requiredPressure_min"
//                       value={formData.requiredPressure_min}
//                       onChange={handleChange}
//                       fullWidth
//                       type="number"
//                     />
//                   </Grid>
//                   <Grid item xs={12} sm={4}>
//                     <TextField
//                       label={fieldLabels.requiredPressure_max}
//                       name="requiredPressure_max"
//                       value={formData.requiredPressure_max}
//                       onChange={handleChange}
//                       fullWidth
//                       type="number"
//                     />
//                   </Grid>
//                 </Grid>
//               </Grid>
//             </Grid>
//           </DialogContent>
//           <DialogActions sx={{ p: 2, gap: 1 }}>
//             <Button onClick={handleCloseDialog} color="inherit">
//               Cancel
//             </Button>
//             <Button onClick={handleSaveTask} variant="contained" color="primary">
//               {editingTask ? 'Save Changes' : 'Create Task'}
//             </Button>
//           </DialogActions>
//         </Dialog>
//       </Container>
//     </Layout>
//   );
// };

// export default TasksPage;


