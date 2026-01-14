import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Download, Visibility, Print } from '@mui/icons-material';

interface Result {
  id: number;
  level: string;
  score: number;
  percentage: number;
  color_level: string;
  completed_at: string;
  user_id: number;
  full_name?: string;
  email?: string;
}

interface HistoryItem extends Result {
  full_name: string;
  email: string;
  total_questions: number;
}

const ResultPage: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [results, setResults] = useState<Result[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  const locale = i18n.language === 'kg' ? 'ky-KG' : 'ru-RU';

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError('');

      // Личные результаты
      const myResultsResponse = await api.get(`/test/results/${user?.id}`);
      setResults(myResultsResponse.data);

      // Вся история (только для админа)
      if (user?.role === 'admin') {
        try {
          const historyResponse = await api.get('/admin/history');
          setHistory(historyResponse.data);
        } catch (historyError) {
          console.log('History endpoint not available');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch results');
      console.error('Failed to fetch results:', err);
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'weak': return 'error';
      case 'medium': return 'warning';
      case 'high': return 'success';
      default: return 'default';
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'weak': return t('weak');
      case 'medium': return t('medium');
      case 'high': return t('high');
      default: return level;
    }
  };


  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  const latestResult = results[0];

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          📊 {t('yourResults')}
        </Typography>

        {/* Latest Result Summary */}
        {latestResult && (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  {t('latestResultTitle')}
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    {t('testLevel')}
                  </Typography>
                  <Typography variant="h5">
                    {latestResult.level === 'easy' ? t('easyLevel') : t('mediumLevel')}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    {t('correctAnswers')}
                  </Typography>
                  <Typography variant="h5">
                    {latestResult.score} / 10
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    {t('percentage')}
                  </Typography>
                  <Typography variant="h5">
                    {latestResult.percentage}%
                  </Typography>
                </Grid>
              </Grid>

              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('level')}
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={latestResult.percentage} 
                  sx={{ 
                    height: 10, 
                    borderRadius: 5,
                    mb: 1 
                  }}
                  color={getLevelColor(latestResult.color_level) as any}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Chip 
                    label={getLevelText(latestResult.color_level)} 
                    color={getLevelColor(latestResult.color_level)}
                    sx={{ fontWeight: 'bold' }}
                  />
                  <Typography variant="body2">
                    {new Date(latestResult.completed_at).toLocaleDateString(locale, {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs 
            value={tab} 
            onChange={(e, v) => setTab(v)}
            variant="fullWidth"
          >
            <Tab label={t('myResultsTab')} />
            {user?.role === 'admin' && <Tab label={t('historyTab')} />}
          </Tabs>
        </Paper>

        {/* My Results Tab */}
        {tab === 0 && (
          <Box>
            {results.length === 0 ? (
              <Alert severity="info">
                {t('noResultsInfo')}
              </Alert>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('dateTime')}</TableCell>
                      <TableCell>{t('levelLabel')}</TableCell>
                      <TableCell align="center">{t('score')}</TableCell>
                      <TableCell align="center">{t('percentage')}</TableCell>
                      <TableCell>{t('logicLevel')}</TableCell>
                      <TableCell>{t('actions')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {results.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell>
                          {new Date(result.completed_at).toLocaleString(locale)}
                        </TableCell>
                        <TableCell>
                          {result.level === 'easy' ? t('easyLevel') : t('mediumLevel')}
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="h6">
                            {result.score}/10
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="h6" color="primary">
                            {result.percentage}%
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={getLevelText(result.color_level)} 
                            color={getLevelColor(result.color_level)}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* Test History Tab (Admin Only) */}
        {tab === 1 && user?.role === 'admin' && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              {t('historyTitle')}
            </Typography>
            
            {history.length === 0 ? (
              <Alert severity="info">
                {t('noHistory')}
              </Alert>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('student')}</TableCell>
                      <TableCell>{t('email')}</TableCell>
                      <TableCell>{t('testLevel')}</TableCell>
                      <TableCell>{t('dateTime')}</TableCell>
                      <TableCell align="center">{t('score')}</TableCell>
                      <TableCell align="center">{t('percentage')}</TableCell>
                      <TableCell>{t('logicLevel')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {history.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Typography fontWeight="medium">
                            {item.full_name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {item.email}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {item.level === 'easy' ? t('easyLevel') : t('mediumLevel')}
                        </TableCell>
                        <TableCell>
                          {new Date(item.completed_at).toLocaleString(locale)}
                        </TableCell>
                        <TableCell align="center">
                          <Typography fontWeight="medium">
                            {item.score}/10
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography 
                            fontWeight="medium"
                            color={
                              item.percentage >= 70 ? 'success.main' :
                              item.percentage >= 40 ? 'warning.main' : 'error.main'
                            }
                          >
                            {item.percentage}%
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip 
                              label={getLevelText(item.color_level)} 
                              color={getLevelColor(item.color_level)}
                              size="small"
                            />
                            <Box sx={{ 
                              width: 8, 
                              height: 8, 
                              borderRadius: '50%',
                              bgcolor: 
                                item.color_level === 'high' ? 'success.main' :
                                item.color_level === 'medium' ? 'warning.main' : 'error.main'
                            }} />
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {t('totalRecords')}: {history.length}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default ResultPage;