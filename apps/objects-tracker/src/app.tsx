import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import AuthPage from './pages/auth-page';
import MapPage from './pages/map-page';
import { authStore } from './stores/auth-store';

const theme = createTheme();

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  if (!authStore.isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const App: React.FC = observer(() => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route
          path="/map"
          element={
            <ProtectedRoute>
              <MapPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </ThemeProvider>
  );
});

export default App;
