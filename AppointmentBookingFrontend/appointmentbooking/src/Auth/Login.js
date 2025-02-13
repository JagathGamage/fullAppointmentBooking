import { useState } from "react";
import { TextField, Container, Typography, Card, CardContent, Box, Alert } from "@mui/material";
import { LoadingButton } from "@mui/lab";  // Import LoadingButton
import axios from "axios";
import { useNavigate } from "react-router-dom";
import bgImage from "../assets/bg.jpg";

const Login = ({ setLoggedIn, setRole }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate();
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const handleLogin = async () => {
    setError("");
    setLoading(true); // Start loading

    try {
      const response = await axios.post(`${backendUrl}/api/auth/login`, { email, password });

      // Store token and role in localStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.role);
      localStorage.setItem("email", response.data.email);

      // Update App.js state for navbar changes
      setLoggedIn(true);
      setRole(response.data.role);

      // Redirect based on role
      navigate(response.data.role === "ADMIN" ? "/admin" : "/");
    } catch (error) {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        zIndex: -1,
      }}
    >
      <Container maxWidth="sm" sx={{ mt: 15 }}>
        <Card
          sx={{
            p: 4,
            boxShadow: 5,
            borderRadius: 3,
            backdropFilter: "blur(10px)",
            background: "rgba(255, 255, 255, 0.85)",
          }}
        >
          <CardContent>
            <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: "bold", color: "#9575cd" }}>
              Login
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                sx={{ backgroundColor: "white", borderRadius: 1 }}
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                sx={{ backgroundColor: "white", borderRadius: 1 }}
              />

              {/* Loading Button */}
              <LoadingButton
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleLogin}
                loading={loading}  // Shows loading spinner when true
                sx={{
                  backgroundColor: "#9575cd",
                  color: "white",
                  "&:hover": { backgroundColor: "#3A0066" },
                }}
              >
                Login
              </LoadingButton>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Login;
