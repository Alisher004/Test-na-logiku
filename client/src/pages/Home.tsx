import React from 'react';
import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Box,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import {
  Timer,
  CheckCircle,
  School,
  Psychology,
  ArrowForward,
  AccessTime,
  QuestionAnswer,
} from '@mui/icons-material';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  const handleStartTest = () => {
    if (user) {
      navigate('/test/select');
    } else {
      navigate('/login');
    }
  };

  return (
    <Box>
      {/* Hero Section */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 6 },
          mb: 4,
          textAlign: 'center',
          background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
          color: 'white',
          borderRadius: 2,
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          {t('welcome')}
        </Typography>
        
        <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 4, opacity: 0.9 }}>
          {t('description')}
        </Typography>

        <Button
          variant="contained"
          size="large"
          onClick={handleStartTest}
          sx={{
            bgcolor: 'white',
            color: '#1976d2',
            px: 6,
            py: 1.5,
            fontSize: '1.1rem',
            fontWeight: 'bold',
            '&:hover': {
              bgcolor: '#f5f5f5',
            },
          }}
          endIcon={<ArrowForward />}
        >
          🚀 ТЕСТТИ БАШТОО
        </Button>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <QuestionAnswer sx={{ fontSize: 20 }} />
            <Typography>15 логикалык суроо</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccessTime sx={{ fontSize: 20 }} />
            <Typography>20 мүнөт</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Psychology sx={{ fontSize: 20 }} />
            <Typography>Логикаңызды текшериңиз</Typography>
          </Box>
        </Box>
      </Paper>

      {/* Features */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Psychology color="primary" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Логикалык ой жүгүртүү
              </Typography>
              <Typography color="text.secondary">
                Сиздин аналитикалык жана логикалык ой жүгүртүүңүздү баалоо
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Timer color="secondary" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Убакыт чектөөсү
              </Typography>
              <Typography color="text.secondary">
                20 мүнөт ичинде 15 суроого жооп берүү
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <School color="success" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Натыйжалуулук
              </Typography>
              <Typography color="text.secondary">
                Тесттен кийин деталдуу натыйжа жана сунуштар алуу
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* How It Works */}
      <Paper elevation={2} sx={{ p: 4, mb: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom align="center">
          Тест кандай иштейт?
        </Typography>
        
        <List>
          <ListItem>
            <ListItemIcon>
              <Typography variant="h5" color="primary">1</Typography>
            </ListItemIcon>
            <ListItemText 
              primary="Катталуу же кирүү" 
              secondary="Системага катталып же кирип алыңыз" 
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <Typography variant="h5" color="primary">2</Typography>
            </ListItemIcon>
            <ListItemText 
              primary="Тестти баштоо" 
              secondary="Жогорудагы баскычты басып тестти баштаңыз" 
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <Typography variant="h5" color="primary">3</Typography>
            </ListItemIcon>
            <ListItemText 
              primary="Суроолорго жооп берүү" 
              secondary="15 логикалык суроого 20 мүнөт ичинде жооп бериңиз" 
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <Typography variant="h5" color="primary">4</Typography>
            </ListItemIcon>
            <ListItemText 
              primary="Натыйжаны көрүү" 
              secondary="Тест аяктагандан кийин деталдуу натыйжаңызды көрүңүз" 
            />
          </ListItem>
        </List>
      </Paper>

      {/* CTA Section */}
      <Box sx={{ textAlign: 'center', mt: 6 }}>
        <Typography variant="h5" gutterBottom>
          Даярсызбы?
        </Typography>
        
        <Button
          variant="contained"
          size="large"
          onClick={handleStartTest}
          sx={{
            px: 8,
            py: 2,
            fontSize: '1.2rem',
            fontWeight: 'bold',
            mt: 2,
          }}
          endIcon={<ArrowForward />}
        >
          ТЕСТТИ БАШТОО
        </Button>
        
        {!user && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Тестти баштоо үчүн алгач катталуу же кирүү керек
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default Home;