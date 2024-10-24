import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { TextField, Button, Box, Typography, Alert } from '@mui/material';
import { authStore } from '../stores/auth-store';
import { useNavigate } from 'react-router-dom';

const AuthPage: React.FC = observer(() => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    authStore.authenticate();
    if (authStore.isAuthenticated) {
      navigate('/map');
    } else {
      setError('Invalid access code. Please try again.');
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
    >
      <Typography variant="h4" gutterBottom>
        Authentication
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Access Code"
          type="password"
          value={authStore.accessCode}
          onChange={(e) => {
            authStore.setAccessCode(e.target.value);
            setError(''); // Clear error when input changes
          }}
          margin="normal"
        />
        {error && (
          <Alert severity="error" style={{ marginTop: '10px' }}>
            {error}
          </Alert>
        )}
        <Box mt={2}>
          <Button type="submit" variant="contained" color="primary">
            Authenticate
          </Button>
        </Box>
      </form>
    </Box>
  );
});

export default AuthPage;
