import React, { useContext, useState } from 'react';
import {
  Avatar,
  Button,
  TextField,
  Paper,
  Box,
  Typography,
  Snackbar,
  CssBaseline,
  Grid,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthContext } from '../contexts/AuthContext';

const defaultTheme = createTheme();

export default function Authentication() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [formState, setFormState] = useState(0); // 0 = login, 1 = register
  const [open, setOpen] = useState(false);

  const { handleRegister, handleLogin } = useContext(AuthContext);

  const handleAuth = async () => {
    try {
      if (formState === 0) {
        await handleLogin(username, password);
      } else {
        const result = await handleRegister(name, username, password);
        setMessage(result);
        setOpen(true);
        setFormState(0);
        setUsername('');
        setPassword('');
        setName('');
        setError('');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Something went wrong';
      setError(msg);
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />

      <Grid
        container
        justifyContent="center"
        alignItems="center"
        sx={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: 2 }}
      >
        <Grid item xs={12} sm={8} md={5} lg={4}>
          <Paper elevation={6} sx={{ padding: 4, borderRadius: 3 }}>
            <Box display="flex" flexDirection="column" alignItems="center">
              <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
                <LockOutlinedIcon />
              </Avatar>

              <Typography component="h1" variant="h5" sx={{ fontWeight: 600 }}>
                {formState === 0 ? 'Login to UniChat' : 'Register on UniChat'}
              </Typography>

              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  variant={formState === 0 ? 'contained' : 'outlined'}
                  onClick={() => setFormState(0)}
                >
                  Sign In
                </Button>
                <Button
                  variant={formState === 1 ? 'contained' : 'outlined'}
                  onClick={() => setFormState(1)}
                >
                  Sign Up
                </Button>
              </Box>

              <Box component="form" noValidate sx={{ mt: 3, width: '100%' }}>
                {formState === 1 && (
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                )}

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                {error && (
                  <Typography color="error" sx={{ mt: 1 }}>
                    {error}
                  </Typography>
                )}

                <Button
                  type="button"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3 }}
                  onClick={handleAuth}
                >
                  {formState === 0 ? 'Login' : 'Register'}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={() => setOpen(false)}
        message={message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </ThemeProvider>
  );
}
