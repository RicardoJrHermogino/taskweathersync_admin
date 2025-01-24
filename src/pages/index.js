// import React, { useState } from "react";
// import { useRouter } from "next/router";
// import { Box, Button, Container, TextField, Typography, IconButton, InputAdornment } from "@mui/material";
// import { Visibility, VisibilityOff } from "@mui/icons-material";
// import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
// import { signIn } from "next-auth/react"; // Import NextAuth's signIn method

// const Login = () => {
//   const router = useRouter();
//   const [username, setUserName] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Use NextAuth's signIn method to authenticate the user
//     const result = await signIn("credentials", {
//       redirect: false, // Prevent automatic redirect
//       username,
//       password,
//     });

//     if (result.error) {
//       setError(result.error); // Display error message if authentication fails
//     } else {
//       // Redirect to the dashboard page after successful login
//       router.push("/inside_pages/dashboard");
//     }
//   };

//   const togglePasswordVisibility = () => {
//     setShowPassword(!showPassword);
//   };

//   return (
//     <Box
//       sx={{
//         background: "linear-gradient(to bottom, #e0f7fa, #ffffff)",
//         minHeight: "100vh",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//       }}
//     >
//       <Container
//         maxWidth="xs"
//         sx={{
//           background: "#ffffff",
//           borderRadius: "16px",
//           boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
//           textAlign: "center",
//           padding: 4,
//         }}
//       >
//         <Box
//           sx={{
//             display: "flex",
//             justifyContent: "center",
//             alignItems: "center",
//             width: 48,
//             height: 48,
//             backgroundColor: "#f5f5f5",
//             borderRadius: "50%",
//             margin: "0 auto 16px",
//           }}
//         >
//           <LockOutlinedIcon color="primary" />
//         </Box>
//         <Typography variant="h5" gutterBottom>
//           Sign in to your admin account
//         </Typography>

//         <Box component="form" noValidate onSubmit={handleSubmit}>
//           <TextField
//             value={username}
//             onChange={(e) => setUserName(e.target.value)}
//             margin="normal"
//             fullWidth
//             label="Username"
//             variant="outlined"
//             type="text"
//           />
//           <TextField
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             margin="normal"
//             fullWidth
//             label="Password"
//             variant="outlined"
//             type={showPassword ? "text" : "password"}
//             InputProps={{
//               endAdornment: (
//                 <InputAdornment position="end">
//                   <IconButton onClick={togglePasswordVisibility} edge="end">
//                     {showPassword ? <VisibilityOff /> : <Visibility />}
//                   </IconButton>
//                 </InputAdornment>
//               ),
//             }}
//           />

//           {error && (
//             <Typography color="error" sx={{ mt: 2 }}>
//               {error}
//             </Typography>
//           )}

//           <Button
//             type="submit"
//             variant="contained"
//             color="primary"
//             fullWidth
//             sx={{ textTransform: "none", borderRadius: "8px", py: 1.5 }}
//           >
//             Sign in
//           </Button>
//         </Box>
//       </Container>
//     </Box>
//   );
// };

// export default Login;


// import React, { useState, useEffect } from 'react';
// import {
//   Container,
//   Typography,
//   TextField,
//   Button,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   IconButton,
//   Box,
// } from '@mui/material';
// import DeleteIcon from '@mui/icons-material/Delete';
// import EditIcon from '@mui/icons-material/Edit';

// export default function Products() {
//   const [products, setProducts] = useState([]);
//   const [form, setForm] = useState({ name: '', category: '' });
//   const [editId, setEditId] = useState(null);

//   // Fetch all products
//   const fetchProducts = async () => {
//     const res = await fetch('/api/products');
//     const data = await res.json();
//     setProducts(data);
//   };

//   // Handle form submission (Add or Update)
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const method = editId ? 'PUT' : 'POST';
//     const url = editId ? `/api/products/${editId}` : '/api/products';

//     const res = await fetch(url, {
//       method,
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(form),
//     });

//     if (res.ok) {
//       fetchProducts();
//       setForm({ name: '', category: '' });
//       setEditId(null);
//     }
//   };

//   // Handle Delete
//   const handleDelete = async (id) => {
//     const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
//     if (res.ok) fetchProducts();
//   };

//   // Populate form for editing
//   const handleEdit = (product) => {
//     setForm({ name: product.name, category: product.category });
//     setEditId(product.id);
//   };

//   useEffect(() => {
//     fetchProducts();
//   }, []);

//   return (
//     <Container maxWidth="md" sx={{ mt: 4 }}>
//       <Typography variant="h4" gutterBottom>
//         Product Management
//       </Typography>
//       <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
//         <TextField
//           label="Name"
//           value={form.name}
//           onChange={(e) => setForm({ ...form, name: e.target.value })}
//           fullWidth
//           sx={{ mb: 2 }}
//         />
//         <TextField
//           label="Category"
//           value={form.category}
//           onChange={(e) => setForm({ ...form, category: e.target.value })}
//           fullWidth
//           sx={{ mb: 2 }}
//         />
//         <Button variant="contained" type="submit">
//           {editId ? 'Update Product' : 'Add Product'}
//         </Button>
//       </Box>
//       <TableContainer component={Paper}>
//         <Table>
//           <TableHead>
//             <TableRow>
//               <TableCell>ID</TableCell>
//               <TableCell>Name</TableCell>
//               <TableCell>Category</TableCell>
//               <TableCell>Actions</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {products.map((product) => (
//               <TableRow key={product.id}>
//                 <TableCell>{product.id}</TableCell>
//                 <TableCell>{product.name}</TableCell>
//                 <TableCell>{product.category}</TableCell>
//                 <TableCell>
//                   <IconButton onClick={() => handleEdit(product)}>
//                     <EditIcon />
//                   </IconButton>
//                   <IconButton onClick={() => handleDelete(product.id)}>
//                     <DeleteIcon />
//                   </IconButton>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </TableContainer>
//     </Container>
//   );
// }

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
    idealHumidity_min: '',
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
          idealHumidity_min: '',
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
          'idealHumidity_min',
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
