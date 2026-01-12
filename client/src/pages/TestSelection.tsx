import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Box,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  Select,
  MenuItem,
  Grid,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowForward, 
  Language, 
  School,
  Timer,
  Psychology,
} from '@mui/icons-material';

const TestSelection: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  
  const [selectedLevel, setSelectedLevel] = useState('easy');
  const [testLanguage, setTestLanguage] = useState(i18n.language);
  const [testSettings, setTestSettings] = useState({
    easy: { questions: 15, time: 20 },
    medium: { questions: 15, time: 20 }
  });

  useEffect(() => {
    // Загружаем настройки теста
    loadTestSettings();
  }, []);

  const loadTestSettings = async () => {
    try {
      // Здесь можно загрузить настройки с сервера
      // const response = await api.get('/test/settings');
      // setTestSettings(response.data);
    } catch (error) {
      console.error('Failed to load test settings:', error);
    }
  };

  const handleStartTest = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Сохраняем язык теста
    localStorage.setItem('test_language', testLanguage);
    
    // Проверяем, не проходил ли уже этот уровень
    const testHistory = JSON.parse(localStorage.getItem('test_history') || '{}');
    if (testHistory[selectedLevel]) {
      if (window.confirm('Вы уже проходили этот уровень теста. Хотите пройти снова?')) {
        navigate(`/test/${selectedLevel}`);
      }
    } else {
      navigate(`/test/${selectedLevel}`);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          🧠 Тест параметрлерин тандоо
        </Typography>

        <Alert severity="info" sx={{ mb: 4 }}>
          Ар бир деңгээлди бир жолу гана тапшыра аласыз. Тест убакыты: 20 мүнөт.
        </Alert>

        <Grid container spacing={3}>
          {/* Язык теста */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <Language color="primary" />
                  <Typography variant="h6">Тест тилин тандаңыз</Typography>
                </Box>
                
                <FormControl fullWidth>
                  <Select
                    value={testLanguage}
                    onChange={(e) => setTestLanguage(e.target.value)}
                    sx={{ mb: 2 }}
                  >
                    <MenuItem value="ru">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography>🇷🇺 Русский язык</Typography>
                      </Box>
                    </MenuItem>
                    <MenuItem value="kg">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography>🇰🇬 Кыргыз тили</Typography>
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
                
                <Typography variant="body2" color="text.secondary">
                  Суроолор жана жооптор тандалган тилде көрсөтүлөт
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Уровень теста */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                  Тест деңгээлин тандаңыз:
                </Typography>
                
                <RadioGroup
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                >
                  <Paper 
                    elevation={selectedLevel === 'easy' ? 3 : 0}
                    sx={{ 
                      p: 2, 
                      mb: 2, 
                      border: '2px solid',
                      borderColor: selectedLevel === 'easy' ? 'primary.main' : 'transparent',
                      borderRadius: 2,
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: 'primary.light',
                      }
                    }}
                    onClick={() => setSelectedLevel('easy')}
                  >
                    <FormControlLabel
                      value="easy"
                      control={<Radio />}
                      label={
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <School color="success" />
                            <Typography variant="subtitle1" fontWeight="bold">
                              🟢 Жеңил деңгээл
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Psychology fontSize="small" />
                              <Typography variant="body2">
                                {testSettings.easy.questions} логикалык суроо
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Timer fontSize="small" />
                              <Typography variant="body2">
                                {testSettings.easy.time} мүнөт
                              </Typography>
                            </Box>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            Башталгыч деңгээл, негизги логикалык суроолор
                          </Typography>
                        </Box>
                      }
                    />
                  </Paper>
                  
                  <Paper 
                    elevation={selectedLevel === 'medium' ? 3 : 0}
                    sx={{ 
                      p: 2, 
                      border: '2px solid',
                      borderColor: selectedLevel === 'medium' ? 'warning.main' : 'transparent',
                      borderRadius: 2,
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: 'warning.light',
                      }
                    }}
                    onClick={() => setSelectedLevel('medium')}
                  >
                    <FormControlLabel
                      value="medium"
                      control={<Radio />}
                      label={
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <School color="warning" />
                            <Typography variant="subtitle1" fontWeight="bold">
                              🟡 Орто деңгээл
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Psychology fontSize="small" />
                              <Typography variant="body2">
                                {testSettings.medium.questions} логикалык суроо
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Timer fontSize="small" />
                              <Typography variant="body2">
                                {testSettings.medium.time} мүнөт
                              </Typography>
                            </Box>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            Орто деңгээл, татаал логикалык суроолор
                          </Typography>
                        </Box>
                      }
                    />
                  </Paper>
                </RadioGroup>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Кнопка начала теста */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          {!user ? (
            <Alert severity="warning" sx={{ mb: 3 }}>
              Тестти баштоо үчүн алгач катталуу же кирүү керек
            </Alert>
          ) : null}
          
          <Button
            variant="contained"
            size="large"
            onClick={handleStartTest}
            disabled={!user}
            sx={{
              px: 6,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              minWidth: 300,
            }}
            endIcon={<ArrowForward />}
          >
            {user ? 'ТЕСТТИ БАШТОО' : 'КИРҮҮ / КАТТАЛУУ'}
          </Button>
          
          {user && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Тандалган деңгээл: {selectedLevel === 'easy' ? 'Жеңил' : 'Орто'} | 
              Тил: {testLanguage === 'ru' ? 'Русский' : 'Кыргызча'}
            </Typography>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default TestSelection;