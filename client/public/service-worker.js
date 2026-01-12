import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container, CssBaseline, ThemeProvider, LinearProgress, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Header from './components/Header';
import theme from './theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './i18n';

// Ленивая загрузка компонентов
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const TestSelection = lazy(() => import('./pages/TestSelection'));
const TestPage = lazy(() => import('./pages/TestPage'));
const ResultPage = lazy(() => import('./pages/ResultPage'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));

const LoadingFallback = () => (
  <Box sx={{ width: '100%', mt: 10, display: 'flex', justifyContent: 'center' }}>
    <LinearProgress sx={{ width: '50%' }} />
  </Box>
);

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const { i18n } = useTranslation();

  React.useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <Router>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
            <Route path="/test/select" element={user ? <TestSelection /> : <Navigate to="/login" />} />
            <Route path="/test/:level" element={user ? <TestPage /> : <Navigate to="/login" />} />
            <Route path="/results" element={user ? <ResultPage /> : <Navigate to="/login" />} />
            <Route path="/admin" element={user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </Container>
    </Router>
  );
};

const App: React.FC = () => {
  // Регистрируем Service Worker
  React.useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;