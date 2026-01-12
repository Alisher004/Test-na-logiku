import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import TestSelection from './pages/TestSelection';
import TestPage from './pages/TestPage';
import ResultPage from './pages/ResultPage';
import AdminPanel from './pages/AdminPanel';
import { useAuth } from './contexts/AuthContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// React Router future flag'дерди кошуу
const routerOptions = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  },
};

const App: React.FC = () => {
  const { user } = useAuth();
  const { i18n } = useTranslation();

  React.useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router {...routerOptions}>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
            <Route path="/test/select" element={user ? <TestSelection /> : <Navigate to="/login" />} />
            <Route path="/test/:level" element={user ? <TestPage /> : <Navigate to="/login" />} />
            <Route path="/results" element={user ? <ResultPage /> : <Navigate to="/login" />} />
            <Route path="/admin" element={user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/" />} />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
};

export default App;