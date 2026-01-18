import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Radio,
  Alert,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  BarChart,
  People,
  QuestionAnswer,
  School,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

interface Question {
  id: number;
  level: string;
  type: string;
  question_ru: string;
  question_kg: string;
  options_ru: string[];
  options_kg: string[];
  correct_answer: string;
  image_file?: string;
  image_filename?: string;
  created_at: string;
}

interface User {
  id: number;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
  age: string;
}

interface Answer {
  question_id: number;
  question_text_ru: string;
  question_text_kg: string;
  given_answer: string;
  correct_answer: string;
}

interface Result {
  id: number;
  user_id: number;
  full_name: string;
  email: string;
  level: string;
  score: number;
  percentage: number;
  color_level: string;
  completed_at: string;
  total_questions?: number;
  answers?: Answer[];
}

const AdminPanel: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [testSettings, setTestSettings] = useState<any[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'kg' ? 'ky-KG' : 'ru-RU';

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalQuestions: 0,
    totalTests: 0,
    avgScore: 0,
  });

  const [formData, setFormData] = useState({
    level: 'easy',
    type: 'logic',
    question_ru: '',
    question_kg: '',
    options_ru: ['', '', '', ''],
    options_kg: ['', '', '', ''],
    correct_answer: '',
    correct_index: null as number | null,
    imageFile: null as File | null,
    imageFilename: '',
    imageUrl: '',
  });

  // JSON маалыматты массивге айландыруучу функция
  const parseOptions = (options: any): string[] => {
    if (!options || options === '[]' || options === '{}') return [];
    
    if (Array.isArray(options)) {
      return options;
    }
    
    if (typeof options === 'string') {
      try {
        const parsed = JSON.parse(options);
        if (Array.isArray(parsed)) {
          return parsed;
        } else if (typeof parsed === 'object') {
          return Object.values(parsed).map(String);
        }
      } catch (e) {
        console.warn('JSON parse error, using raw string:', e);
        // Эгерде JSON ката болсо, аны сактап калабыз
        return [options];
      }
    }
    
    if (typeof options === 'object') {
      return Object.values(options).map(String);
    }
    
    return [];
  };

  useEffect(() => {
    fetchData();
  }, [tab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (tab === 0) {
        const [usersRes, questionsRes, resultsRes, settingsRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/questions'),
          api.get('/admin/results'),
          api.get('/admin/settings'),
        ]);
        
        // Суроолорду форматтоо
        const formattedQuestions = questionsRes.data.map((question: any) => ({
          ...question,
          options_ru: parseOptions(question.options_ru),
          options_kg: parseOptions(question.options_kg),
        }));
        
        setUsers(usersRes.data);
        setQuestions(formattedQuestions);
        setResults(resultsRes.data);
        // Add default question_count for backward compatibility
        const settingsWithDefaults = settingsRes.data.map((setting: any) => ({
          ...setting,
          question_count: setting.question_count || 15
        }));
        setTestSettings(settingsWithDefaults);
        
        const avgScore = resultsRes.data.length > 0 
          ? resultsRes.data.reduce((sum: number, r: Result) => sum + r.percentage, 0) / resultsRes.data.length
          : 0;
        
        setStats({
          totalUsers: usersRes.data.length,
          totalQuestions: formattedQuestions.length,
          totalTests: resultsRes.data.length,
          avgScore: Math.round(avgScore),
        });
      } else if (tab === 1) {
        const response = await api.get('/admin/questions');
        const formattedQuestions = response.data.map((question: any) => ({
          ...question,
          options_ru: parseOptions(question.options_ru),
          options_kg: parseOptions(question.options_kg),
        }));
        setQuestions(formattedQuestions);
      } else if (tab === 2) {
        const response = await api.get('/admin/users');
        setUsers(response.data);
      } else {
        const response = await api.get('/admin/results');
        setResults(response.data);
      }
      setError('');
    } catch (err: any) {
      console.error('Error fetching data:', err);
      if (err.response?.status === 401) {
        setError(t('sessionExpired'));
        // Сессия бүтсө, логинге багытта
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setError(err.response?.data?.error || t('fetchDataError'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const handleOpenDialog = (question?: Question) => {
    if (question) {
      setEditingQuestion(question);
      // determine correct index from options (prefer RU)
      const idxRu = question.options_ru ? question.options_ru.indexOf(question.correct_answer) : -1;
      const idxKg = question.options_kg ? question.options_kg.indexOf(question.correct_answer) : -1;
      const correctIndex = idxRu >= 0 ? idxRu : idxKg >= 0 ? idxKg : null;

      setFormData({
        level: question.level,
        type: question.type,
        question_ru: question.question_ru,
        question_kg: question.question_kg,
        options_ru: question.options_ru.length ? question.options_ru : ['', '', '', ''],
        options_kg: question.options_kg.length ? question.options_kg : ['', '', '', ''],
        correct_answer: question.correct_answer,
        correct_index: correctIndex,
        imageFile: null,
        imageFilename: question.image_filename || '',
        imageUrl: question.image_file ? `/api/questions/${question.id}/image` : '',
      });
    } else {
      setEditingQuestion(null);
      setFormData({
        level: 'easy',
        type: 'logic',
        question_ru: '',
        question_kg: '',
        options_ru: ['', '', '', ''],
        options_kg: ['', '', '', ''],
        correct_answer: '',
        correct_index: null,
        imageFile: null,
        imageFilename: '',
        imageUrl: '',
      });
    }
    setOpenDialog(true);
  };

  const addOption = () => {
    setFormData((prev) => ({
      ...prev,
      options_ru: [...prev.options_ru, ''],
      options_kg: [...prev.options_kg, ''],
    }));
  };

  const removeOption = (index: number) => {
    if (formData.options_ru.length <= 2) {
      setError(t('minimumTwoOptions'));
      return;
    }
    
    setFormData((prev) => {
      const newRu = prev.options_ru.filter((_, i) => i !== index);
      const newKg = prev.options_kg.filter((_, i) => i !== index);
      let newCorrectIndex = prev.correct_index;
      if (newCorrectIndex === index) {
        newCorrectIndex = null;
      } else if (newCorrectIndex !== null && newCorrectIndex > index) {
        newCorrectIndex = newCorrectIndex - 1;
      }

      // if removed option was the correct one, clear correct_answer
      const newCorrectAnswer = newCorrectIndex !== null ? newRu[newCorrectIndex] : '';

      return {
        ...prev,
        options_ru: newRu,
        options_kg: newKg,
        correct_index: newCorrectIndex,
        correct_answer: newCorrectAnswer,
      };
    });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingQuestion(null);
    setError('');
  };

  const handleFormChange = (field: string, value: any) => {
    // If switching question type, adjust related fields
    if (field === 'type') {
      if (value === 'motivational') {
        setFormData({
          ...formData,
          type: value,
          // motivational questions need only one empty option array element
          options_ru: [''],
          options_kg: [''],
          correct_index: null,
          correct_answer: formData.correct_answer || '',
        });
        return;
      } else {
        // switching to logic: ensure we have at least 2 options
        const optionsRu = formData.options_ru.length >= 2 ? formData.options_ru : ['', '', '', ''];
        const optionsKg = formData.options_kg.length >= 2 ? formData.options_kg : ['', '', '', ''];
        
        setFormData({
          ...formData,
          type: value,
          options_ru: optionsRu,
          options_kg: optionsKg,
        });
        return;
      }
    }

    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleOptionChange = (lang: 'ru' | 'kg', index: number, value: string) => {
    const newOptions = [...formData[lang === 'ru' ? 'options_ru' : 'options_kg']];
    newOptions[index] = value;
    
    setFormData({
      ...formData,
      [lang === 'ru' ? 'options_ru' : 'options_kg']: newOptions,
    });
    
    // keep correct_answer in sync if this option is selected as correct
    if (lang === 'ru' && formData.correct_index === index) {
      setFormData((prev) => ({ ...prev, correct_answer: value }));
    }
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    
    // Validation
    if (!formData.question_ru.trim()) {
      setError(t('questionRuRequired'));
      return;
    }
    
    if (!formData.question_kg.trim()) {
      setError(t('questionKgRequired'));
      return;
    }

    let correctAnswer = formData.correct_answer;
    
    if (formData.type === 'logic') {
      // Logic вопрос үчүн options'тон туура жоопту танда
      if (formData.correct_index !== null && formData.correct_index >= 0) {
        correctAnswer = formData.options_ru[formData.correct_index];
      }
      
      if (!correctAnswer || !correctAnswer.trim()) {
        setError(t('selectCorrectAnswer'));
        return;
      }
      
      // Options validation
      const validRuOptions = formData.options_ru.filter(opt => opt && opt.trim());
      const validKgOptions = formData.options_kg.filter(opt => opt && opt.trim());
      
      if (validRuOptions.length < 2) {
        setError(t('minimumTwoOptions'));
        return;
      }
      
      // Check if all Russian options have corresponding Kyrgyz options
      if (validRuOptions.length !== validKgOptions.length) {
        setError(t('optionsCountMismatch'));
        return;
      }
      
      // Check for duplicate options
      const ruSet = new Set(validRuOptions);
      if (ruSet.size !== validRuOptions.length) {
        setError(t('duplicateOptions'));
        return;
      }
    } else {
      // Motivational вопрос үчүн текшерүү (туура жооп кереги жок)
      // correct_answer бош калат
    }

    try {
      // Prepare data for API
      const { correct_index, imageFile, ...rest } = formData as any;
      const dataToSend = {
        ...rest,
        correct_answer: formData.type === 'motivational' ? '' : correctAnswer.trim(),
      };

      // Process options based on question type
      if (formData.type === 'logic') {
        // Filter out empty options
        const validOptionsRu = formData.options_ru.filter(opt => opt && opt.trim());
        const validOptionsKg = formData.options_kg.filter(opt => opt && opt.trim());

        // Send arrays (backend will stringify when storing)
        dataToSend.options_ru = validOptionsRu;
        dataToSend.options_kg = validOptionsKg;
      } else {
        // Motivational questions: send null so backend stores NULL
        dataToSend.options_ru = null;
        dataToSend.options_kg = null;
      }

      console.log('Sending question data:', dataToSend); // Debug үчүн

      let response;
      if (imageFile) {
        // Use FormData for file upload
        const formDataToSend = new FormData();
        Object.keys(dataToSend).forEach(key => {
          if (dataToSend[key] !== null && dataToSend[key] !== undefined) {
            if (Array.isArray(dataToSend[key])) {
              formDataToSend.append(key, JSON.stringify(dataToSend[key]));
            } else {
              formDataToSend.append(key, dataToSend[key]);
            }
          }
        });
        formDataToSend.append('image', imageFile);

        const config = {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        };

        if (editingQuestion) {
          response = await api.put(`/admin/questions/${editingQuestion.id}`, formDataToSend, config);
        } else {
          response = await api.post('/admin/questions', formDataToSend, config);
        }
      } else {
        // Regular JSON request
        if (editingQuestion) {
          response = await api.put(`/admin/questions/${editingQuestion.id}`, dataToSend);
        } else {
          response = await api.post('/admin/questions', dataToSend);
        }
      }

      setSuccess(editingQuestion ? t('questionUpdated') : t('questionCreated'));
      
      handleCloseDialog();
      fetchData();
      
      // Автоматтык түрдө жок кылуу
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error saving question:', err);
      
      // Detailed error handling
      if (err.response) {
        if (err.response.status === 401) {
          setError(t('unauthorizedError'));
        } else if (err.response.status === 400) {
          const errorMsg = err.response.data.error || err.response.data.message || t('validationError');
          setError(errorMsg);
        } else if (err.response.status === 500) {
          setError(t('serverError'));
        } else {
          setError(err.response.data?.error || t('unknownError'));
        }
      } else if (err.request) {
        setError(t('networkError'));
      } else {
        setError(err.message || t('unknownError'));
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm(t('confirmDeleteQuestion'))) {
      try {
        await api.delete(`/admin/questions/${id}`);
        setSuccess(t('questionDeleted'));
        fetchData();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err: any) {
        console.error('Error deleting question:', err);
        setError(err.response?.data?.error || t('deleteError'));
      }
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'weak': return t('weak');
      case 'medium': return t('medium');
      case 'high': return t('high');
      case 'easy': return t('levelEasy');
      case 'medium': return t('levelMedium');
      default: return level;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'weak': 
      case 'easy': 
        return 'error';
      case 'medium': 
        return 'warning';
      case 'high': 
        return 'success';
      default: 
        return 'default';
    }
  };

  // Results details көрсөтүү үчүн
  const [expandedResult, setExpandedResult] = useState<number | null>(null);

  const toggleResultDetails = (id: number) => {
    setExpandedResult(expandedResult === id ? null : id);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('adminTitle')}
        </Typography>

        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {t('adminSubtitle')}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Dashboard Cards */}
        {tab === 0 && !loading && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <People color="primary" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" component="div">
                    {stats.totalUsers}
                  </Typography>
                  <Typography color="text.secondary">
                    {t('usersLabel')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <QuestionAnswer color="secondary" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" component="div">
                    {stats.totalQuestions}
                  </Typography>
                  <Typography color="text.secondary">
                    {t('questionsLabel')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <School color="success" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" component="div">
                    {stats.totalTests}
                  </Typography>
                  <Typography color="text.secondary">
                    {t('testsCompleted')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <BarChart color="warning" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" component="div">
                    {stats.avgScore}%
                  </Typography>
                  <Typography color="text.secondary">
                    {t('avgResult')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs 
            value={tab} 
            onChange={handleTabChange}
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab icon={<BarChart />} label={t('dashboard')} />
            <Tab icon={<QuestionAnswer />} label={t('manageQuestions')} />
            <Tab icon={<People />} label={t('usersLabel')} />
            <Tab icon={<School />} label={t('lastResults')} />
          </Tabs>
        </Paper>

        {/* Dashboard Content */}
        {tab === 0 && !loading && (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {t('lastResults')}
                    </Typography>
                    {results.length === 0 ? (
                      <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                        {t('noData')}
                      </Typography>
                    ) : (
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Студент</TableCell>
                              <TableCell align="right">Уровень</TableCell>
                              <TableCell align="right">Результат</TableCell>
                              <TableCell align="right">Дата</TableCell>
                              <TableCell align="right">Детали</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {results.slice(0, 5).map((result) => (
                              <React.Fragment key={result.id}>
                                <TableRow hover>
                                  <TableCell>
                                    <Typography variant="body2">
                                      {result.full_name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {result.email}
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="right">
                                    {result.level === 'easy' ? 'Легкий' : 'Средний'}
                                  </TableCell>
                                  <TableCell align="right">
                                    <Chip 
                                      label={`${result.percentage}%`}
                                      color={getLevelColor(result.color_level) as any}
                                      size="small"
                                    />
                                  </TableCell>
                                  <TableCell align="right">
                                    {new Date(result.completed_at).toLocaleDateString(locale)}
                                  </TableCell>
                                  <TableCell align="right">
                                    <IconButton
                                      size="small"
                                      onClick={() => toggleResultDetails(result.id)}
                                    >
                                      {expandedResult === result.id ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                                {expandedResult === result.id && result.answers && (
                                  <TableRow>
                                    <TableCell colSpan={5} sx={{ py: 0 }}>
                                      <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
                                        <Typography variant="subtitle2" gutterBottom>
                                          Детали ответов:
                                        </Typography>
                                        {result.answers.map((answer, index) => (
                                          <Box key={index} sx={{ mb: 1 }}>
                                            <Typography variant="body2">
                                              <strong>Вопрос {index + 1}:</strong> {answer.question_text_ru}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                              Дан ответ: {answer.given_answer} | Правильный: {answer.correct_answer}
                                              {answer.given_answer === answer.correct_answer ? ' ✓' : ' ✗'}
                                            </Typography>
                                          </Box>
                                        ))}
                                      </Box>
                                    </TableCell>
                                  </TableRow>
                                )}
                              </React.Fragment>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {t('distributionLogic')}
                    </Typography>
                    {results.length === 0 ? (
                      <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                        {t('noData')}
                      </Typography>
                    ) : (
                      <Box sx={{ mt: 2 }}>
                        {['high', 'medium', 'weak'].map((level) => {
                          const count = results.filter(r => r.color_level === level).length;
                          const percentage = results.length > 0 ? (count / results.length) * 100 : 0;
                          
                          return (
                            <Box key={level} sx={{ mb: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                <Typography variant="body2">
                                  {getLevelText(level)} {t('logicLevel')}
                                </Typography>
                                <Typography variant="body2">
                                  {count} ({Math.round(percentage)}%)
                                </Typography>
                              </Box>
                              <Box sx={{ 
                                height: 8, 
                                bgcolor: 'grey.200', 
                                borderRadius: 4,
                                overflow: 'hidden'
                              }}>
                                <Box 
                                  sx={{ 
                                    height: '100%', 
                                    width: `${percentage}%`,
                                    bgcolor: level === 'high' ? 'success.main' : 
                                             level === 'medium' ? 'warning.main' : 'error.main'
                                  }}
                                />
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Test Settings */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Настройки тестов
              </Typography>
              <Grid container spacing={2}>
                {testSettings.map((setting) => (
                  <Grid item xs={12} sm={6} key={setting.level}>
                    <Card>
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          {setting.level === 'easy' ? 'Легкий уровень' : 'Средний уровень'}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                          <TextField
                            label="Время (минуты)"
                            type="number"
                            size="small"
                            value={setting.time_minutes}
                            onChange={(e) => {
                              const newSettings = testSettings.map(s => 
                                s.level === setting.level 
                                  ? { ...s, time_minutes: parseInt(e.target.value) || 0 }
                                  : s
                              );
                              setTestSettings(newSettings);
                            }}
                            sx={{ width: 120 }}
                          />
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={async () => {
                              try {
                                await api.put('/admin/settings', testSettings);
                                setSuccess('Настройки сохранены');
                                setTimeout(() => setSuccess(''), 3000);
                              } catch (err: any) {
                                setError('Ошибка сохранения настроек');
                              }
                            }}
                          >
                            Сохранить
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
        )}

        {/* Questions Tab */}
        {tab === 1 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6">
                {t('manageQuestions')} ({questions.length})
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
                disabled={loading}
              >
                {t('addQuestion')}
              </Button>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : questions.length === 0 ? (
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <QuestionAnswer sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    {t('noQuestionsFound')}
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleOpenDialog()}
                    sx={{ mt: 2 }}
                  >
                    {t('addQuestion')}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>{t('levelLabel')}</TableCell>
                      <TableCell>{t('questionType')}</TableCell>
                      <TableCell>Вопрос (RU)</TableCell>
                      <TableCell>Вопрос (KG)</TableCell>
                      <TableCell>{t('correctAnswer')}</TableCell>
                      <TableCell>Изображение</TableCell>
                      <TableCell>{t('actions')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {questions.map((question) => (
                      <TableRow key={question.id} hover>
                        <TableCell>{question.id}</TableCell>
                        <TableCell>
                          <Chip 
                            label={question.level === 'easy' ? t('levelEasy') : t('levelMedium')} 
                            color={question.level === 'easy' ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={question.type === 'logic' ? t('questionTypeLogic') : t('questionTypeMotivational')} 
                            color={question.type === 'logic' ? 'primary' : 'secondary'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell sx={{ maxWidth: 200 }}>
                          <Typography noWrap title={question.question_ru}>
                            {question.question_ru}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ maxWidth: 200 }}>
                          <Typography noWrap title={question.question_kg}>
                            {question.question_kg}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography noWrap title={question.correct_answer || (question.type === 'motivational' ? 'Мотивациялык' : '')}>
                            {question.type === 'motivational' ? 'Мотивациялык' : question.correct_answer}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {question.image_filename ? (
                            <img 
                              src={`/api/questions/${question.id}/image`}
                              alt="Question"
                              style={{ 
                                width: '50px', 
                                height: '50px', 
                                objectFit: 'cover',
                                borderRadius: '4px'
                              }}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <Typography variant="body2" color="text.secondary">-</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <IconButton 
                            size="small" 
                            onClick={() => handleOpenDialog(question)}
                            title={t('edit')}
                            color="primary"
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => handleDelete(question.id)}
                            title={t('delete')}
                            color="error"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* Users Tab */}
        {tab === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              {t('usersLabel')} ({users.length})
            </Typography>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : users.length === 0 ? (
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <People sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    {t('noData')}
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>ФИО</TableCell>
                      <TableCell>{t('email')}</TableCell>
                      <TableCell>{t('age')}</TableCell>
                      <TableCell>{t('dateRegistered')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} hover>
                        <TableCell>{user.id}</TableCell>
                        <TableCell>{user.full_name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip 
                            label={user.age} 
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString(locale)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* Results Tab */}
        {tab === 3 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              {t('lastResults')} ({results.length})
            </Typography>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : results.length === 0 ? (
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <School sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    {t('noData')}
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell>ID</TableCell>
                      <TableCell>{t('student')}</TableCell>
                      <TableCell>{t('email')}</TableCell>
                      <TableCell>{t('levelLabel')}</TableCell>
                      <TableCell align="right">{t('score')}</TableCell>
                      <TableCell align="right">{t('percentage')}</TableCell>
                      <TableCell>{t('logicLevel')}</TableCell>
                      <TableCell>{t('dateTime')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {results.map((result) => (
                      <React.Fragment key={result.id}>
                        <TableRow hover>
                          <TableCell>
                            <IconButton 
                              size="small" 
                              onClick={() => toggleResultDetails(result.id)}
                              title={expandedResult === result.id ? t('hideDetails') : t('showDetails')}
                            >
                              {expandedResult === result.id ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </TableCell>
                          <TableCell>{result.id}</TableCell>
                          <TableCell>{result.full_name}</TableCell>
                          <TableCell>{result.email}</TableCell>
                          <TableCell>
                            {result.level === 'easy' ? t('levelEasy') : t('levelMedium')}
                          </TableCell>
                          <TableCell align="right">
                            {result.score}/{result.total_questions}
                          </TableCell>
                          <TableCell align="right">{result.percentage}%</TableCell>
                          <TableCell>
                            <Chip 
                              label={getLevelText(result.color_level)} 
                              color={getLevelColor(result.color_level) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(result.completed_at).toLocaleString(locale)}
                          </TableCell>
                        </TableRow>
                        
                        {expandedResult === result.id && result.answers && (
                          <TableRow>
                            <TableCell colSpan={9} sx={{ backgroundColor: 'action.hover' }}>
                              <Box sx={{ py: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                  {t('detailedAnswers')}
                                </Typography>
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>#</TableCell>
                                      <TableCell>Вопрос</TableCell>
                                      <TableCell>Данный ответ</TableCell>
                                      <TableCell>Правильный ответ</TableCell>
                                      <TableCell>Статус</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {result.answers.map((answer, index) => (
                                      <TableRow key={answer.question_id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>
                                          {locale === 'ky-KG' ? answer.question_text_kg : answer.question_text_ru}
                                        </TableCell>
                                        <TableCell>{answer.given_answer}</TableCell>
                                        <TableCell>{answer.correct_answer}</TableCell>
                                        <TableCell>
                                          <Chip 
                                            label={answer.given_answer === answer.correct_answer ? t('correct') : t('incorrect')}
                                            color={answer.given_answer === answer.correct_answer ? 'success' : 'error'}
                                            size="small"
                                          />
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </Box>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </Box>

      {/* Question Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingQuestion ? t('editQuestionTitle') : t('newQuestionTitle')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label={t('levelLabel')}
                  value={formData.level}
                  onChange={(e) => handleFormChange('level', e.target.value)}
                  sx={{ mb: 2 }}
                >
                  <MenuItem value="easy">{t('levelEasy')}</MenuItem>
                  <MenuItem value="medium">{t('levelMedium')}</MenuItem>
                </TextField>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label={t('questionType')}
                  value={formData.type}
                  onChange={(e) => handleFormChange('type', e.target.value)}
                  sx={{ mb: 2 }}
                >
                  <MenuItem value="logic">{t('questionTypeLogic')}</MenuItem>
                  <MenuItem value="motivational">{t('questionTypeMotivational')}</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              {t('questionTitle1')}
            </Typography>
            <TextField
              fullWidth
              label="Текст вопроса *"
              value={formData.question_ru}
              onChange={(e) => handleFormChange('question_ru', e.target.value)}
              multiline
              rows={3}
              sx={{ mb: 3 }}
              error={!formData.question_ru.trim()}
              helperText={!formData.question_ru.trim() ? t('requiredField') : ''}
            />

            <Typography variant="subtitle1" gutterBottom>
              {t('questionTitle2')}
            </Typography>
            <TextField
              fullWidth
              label="Суроонун тексти *"
              value={formData.question_kg}
              onChange={(e) => handleFormChange('question_kg', e.target.value)}
              multiline
              rows={3}
              sx={{ mb: 3 }}
              error={!formData.question_kg.trim()}
              helperText={!formData.question_kg.trim() ? t('requiredField') : ''}
            />

            {/* Image Upload Section */}
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              Изображение (необязательно)
            </Typography>
            <Box sx={{ mb: 3 }}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="image-upload"
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setFormData({
                      ...formData,
                      imageFile: file,
                      imageFilename: file.name,
                      imageUrl: URL.createObjectURL(file)
                    });
                  }
                }}
              />
              <label htmlFor="image-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<Add />}
                  sx={{ mr: 2 }}
                >
                  Выбрать изображение
                </Button>
              </label>
              {formData.imageFilename && (
                <Typography variant="body2" color="text.secondary">
                  Выбрано: {formData.imageFilename}
                </Typography>
              )}
              {formData.imageUrl && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <img 
                    src={formData.imageUrl}
                    alt="Preview"
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '200px', 
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                    onError={(e) => {
                      console.error('Preview failed to load');
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </Box>
              )}
              {editingQuestion?.image_filename && !formData.imageFile && (
                <Typography variant="body2" color="text.secondary">
                  Текущее изображение: {editingQuestion.image_filename}
                </Typography>
              )}
            </Box>

            {formData.type === 'logic' && (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {t('optionsRuTitle')}
                  </Typography>
                  <Button 
                    startIcon={<Add />} 
                    onClick={addOption}
                    size="small"
                  >
                    {t('addOption')}
                  </Button>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  {formData.options_ru.map((option, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                      <Radio
                        checked={formData.correct_index === index}
                        onChange={() => {
                          setFormData({ 
                            ...formData, 
                            correct_index: index,
                            correct_answer: formData.options_ru[index] || ''
                          });
                        }}
                        value={index}
                        name="correctAnswer"
                      />
                      <TextField
                        fullWidth
                        size="small"
                        label={`Вариант ${index + 1} *`}
                        value={option}
                        onChange={(e) => handleOptionChange('ru', index, e.target.value)}
                        error={!option.trim()}
                        helperText={!option.trim() ? t('requiredField') : ''}
                      />
                      {formData.options_ru.length > 2 && (
                        <IconButton 
                          size="small" 
                          onClick={() => removeOption(index)}
                          color="error"
                          title={t('removeOption')}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  ))}
                  
                  {formData.options_ru.length < 4 && (
                    <Typography variant="caption" color="text.secondary">
                      {t('minimumTwoOptionsNote')}
                    </Typography>
                  )}
                </Box>

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                  {t('optionsKgTitle')}
                </Typography>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {formData.options_kg.map((option, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <TextField
                        fullWidth
                        size="small"
                        label={`Вариант ${index + 1} *`}
                        value={option}
                        onChange={(e) => handleOptionChange('kg', index, e.target.value)}
                        error={!option.trim()}
                        helperText={!option.trim() ? t('requiredField') : ''}
                      />
                    </Grid>
                  ))}
                </Grid>
              </>
            )}

            {formData.type === 'motivational' ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                {t('motivationalQuestionNote')}
              </Typography>
            ) : (
              <>
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                  {t('correctAnswer')}
                </Typography>
                <TextField
                  fullWidth
                  label={t('correctAnswer') + ' *'}
                  value={formData.correct_answer}
                  onChange={(e) => handleFormChange('correct_answer', e.target.value)}
                  multiline
                  rows={3}
                  sx={{ mb: 2 }}
                  error={!formData.correct_answer.trim()}
                  helperText={!formData.correct_answer.trim() ? t('requiredField') : ''}
                />
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('selectCorrect')}
                  </Typography>
                  {formData.correct_index !== null ? (
                    <Chip 
                      label={`Выбран вариант ${formData.correct_index + 1}: ${formData.options_ru[formData.correct_index]}`}
                      color="success"
                      variant="outlined"
                    />
                  ) : (
                    <Typography variant="caption" color="error">
                      {t('selectCorrectOption')}
                    </Typography>
                  )}
                </Box>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t('cancel')}</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={!formData.question_ru.trim() || !formData.question_kg.trim()}
          >
            {editingQuestion ? t('saveChanges') : t('createQuestion')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPanel;