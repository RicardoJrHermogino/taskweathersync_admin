import React, { useState } from "react";
import { useRouter } from "next/router";
import { Box, Button, Container, TextField, Typography, IconButton, InputAdornment, Paper } from "@mui/material";
import { Visibility, VisibilityOff, Cloud } from "@mui/icons-material";
import { signIn } from "next-auth/react";
import Head from "next/head"; // Import the Head component

const Login = () => {
  const router = useRouter();
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await signIn("credentials", {
        redirect: false,
        username,
        password,
      });

      if (result.error) {
        setError(result.error);
      } else {
        router.push("/inside_pages/dashboard");
      }
    } catch (err) {
      setError("Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* SEO Meta Tags */}
      <Head>
        <title>TaskWeatherSync Admin Portal Sanaol</title>
        <meta name="description" content="Sign in to the TaskWeatherSync Admin Portal to manage tasks and weather updates." />
        <meta name="robots" content="index, follow" />
      </Head>

      <Box
        sx={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        {/* Decorative elements */}
        <Box
          sx={{
            position: "absolute",
            top: "5%",
            left: "5%",
            opacity: 0.1,
            transform: "scale(2)",
          }}
        >
          <Cloud sx={{ fontSize: 100, color: "#2196F3" }} />
        </Box>
        <Box
          sx={{
            position: "absolute",
            bottom: "10%",
            right: "8%",
            opacity: 0.1,
            transform: "scale(1.5)",
          }}
        >
          <Cloud sx={{ fontSize: 80, color: "#2196F3" }} />
        </Box>

        <Container maxWidth="xs" sx={{ my: "auto", position: "relative" }}>
          <Box sx={{ mb: 4, textAlign: "center" }}>
            <Cloud sx={{ fontSize: 40, color: "#1976D2", mb: 2 }} />
            <Typography
              variant="h4"
              sx={{
                fontWeight: 600,
                color: "#1565C0",
                letterSpacing: "-0.5px",
              }}
            >
              TaskWeatherSync
            </Typography>
            <Typography
              variant="subtitle2"
              sx={{
                color: "#1976D2",
                textTransform: "uppercase",
                letterSpacing: "1px",
                fontSize: "0.75rem",
              }}
            >
              Admin Portal
            </Typography>
          </Box>

          <Paper
            elevation={0}
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(10px)",
              borderRadius: 3,
              border: "1px solid rgba(255, 255, 255, 0.3)",
              p: 4,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 500,
                color: "#1565C0",
                mb: 1,
              }}
            >
              Sign in
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: "#5C6BC0",
                mb: 4,
              }}
            >
              Access your admin dashboard
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                value={username}
                onChange={(e) => setUserName(e.target.value)}
                fullWidth
                placeholder="Username"
                variant="outlined"
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    '& fieldset': {
                      borderColor: 'rgba(25, 118, 210, 0.2)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(25, 118, 210, 0.4)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1976D2',
                    }
                  },
                }}
                InputProps={{
                  sx: { borderRadius: 2 }
                }}
              />

              <TextField
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    '& fieldset': {
                      borderColor: 'rgba(25, 118, 210, 0.2)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(25, 118, 210, 0.4)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1976D2',
                    }
                  },
                }}
                InputProps={{
                  sx: { borderRadius: 2 },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: '#5C6BC0' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {error && (
                <Typography
                  color="error"
                  variant="body2"
                  sx={{ mb: 2, fontSize: "0.875rem" }}
                >
                  {error}
                </Typography>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                sx={{
                  py: 1.75,
                  backgroundColor: '#1976D2',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  boxShadow: '0 2px 8px rgba(25, 118, 210, 0.25)',
                  '&:hover': {
                    backgroundColor: '#1565C0',
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.35)',
                  },
                }}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    </>
  );
};

export default Login;
