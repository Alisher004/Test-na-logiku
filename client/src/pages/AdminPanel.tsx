import React, { useState, useEffect, useCallback} from 'react';
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
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  BarChart,
  People,
  QuestionAnswer,
  School,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import QuestionDialog from '../components/QuestionDialog';

interface Question {
  id: number;
  level: string;
  type: string;
  question_ru: string;
  question_kg: string;
  options_ru: string[];
  options_kg: string[];
  correct_answer: string;
  created_at: string;
}

interface User {
  id: number;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
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
}

const AdminPanel: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { t } = useTranslation();

  // Dashboard статистикасы
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
  });

  useEffect(() => {
    fetchData();
  }, [tab]);

  const fetchData = async () => {
    try {
      if (tab === 0) {
        // Dashboard статистикасы
        const [usersRes, questionsRes, resultsRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/questions'),
          api.get('/admin/results'),
        ]);
        
        setUsers(usersRes.data);
        setQuestions(questionsRes.data);
        setResults(resultsRes.data);
        
        // Статистиканы эсептөө
        const avgScore = resultsRes.data.length > 0 
          ? resultsRes.data.reduce((sum: number, r: Result) => sum + r.percentage, 0) / resultsRes.data.length
          : 0;
        
        setStats({
          totalUsers: usersRes.data.length,
          totalQuestions: questionsRes.data.length,
          totalTests: resultsRes.data.length,
          avgScore: Math.round(avgScore),
        });
      } else if (tab === 1) {
        const response = await api.get('/admin/questions');
        setQuestions(response.data);
      } else if (tab === 2) {
        const response = await api.get('/admin/users');
        setUsers(response.data);
      } else {
        const response = await api.get('/admin/results');
        setResults(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch data');
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const handleOpenDialog = (question?: Question) => {
    if (question) {
      setEditingQuestion(question);
      setFormData({
        level: question.level,
        type: question.type,
        question_ru: question.question_ru,
        question_kg: question.question_kg,
        options_ru: question.options_ru,
        options_kg: question.options_kg,
        correct_answer: question.correct_answer,
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
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingQuestion(null);
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleOptionChange = (lang: 'ru' | 'kg', index: number, value: string) => {
    const newOptions = [...formData[`options_${lang}`]];
    newOptions[index] = value;
    setFormData({
      ...formData,
      [`options_${lang}`]: newOptions,
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingQuestion) {
        await api.put(`/admin/questions/${editingQuestion.id}`, formData);
        setSuccess('Вопрос обновлен успешно');
      } else {
        await api.post('/admin/questions', formData);
        setSuccess('Вопрос создан успешно');
      }
      handleCloseDialog();
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save question');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этот вопрос?')) {
      try {
        await api.delete(`/admin/questions/${id}`);
        setSuccess('Вопрос удален успешно');
        fetchData();
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to delete question');
      }
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'weak': return 'Слабая';
      case 'medium': return 'Средняя';
      case 'high': return 'Высокая';
      default: return level;
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

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          🎓 Административная панель
        </Typography>
        
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Управление вопросами, пользователями и результатами тестов
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

        {/* Dashboard Cards */}
        {tab === 0 && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <People color="primary" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="h4" component="div">
                    {stats.totalUsers}
                  </Typography>
                  <Typography color="text.secondary">
                    Пользователей
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
                    Вопросов
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
                    Пройдено тестов
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
                    Средний результат
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
            <Tab icon={<BarChart />} label="Дашборд" />
            <Tab icon={<QuestionAnswer />} label="Вопросы" />
            <Tab icon={<People />} label="Пользователи" />
            <Tab icon={<School />} label="Результаты" />
          </Tabs>
        </Paper>

        {/* Dashboard Content */}
        {tab === 0 && (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Последние результаты тестов
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Студент</TableCell>
                            <TableCell align="right">Уровень</TableCell>
                            <TableCell align="right">Результат</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {results.slice(0, 5).map((result) => (
                            <TableRow key={result.id}>
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
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Распределение по уровням логики
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      {['high', 'medium', 'weak'].map((level) => {
                        const count = results.filter(r => r.color_level === level).length;
                        const percentage = results.length > 0 ? (count / results.length) * 100 : 0;
                        
                        return (
                          <Box key={level} sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="body2">
                                {getLevelText(level)} логика
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
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Questions Tab */}
        {tab === 1 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6">
                Управление вопросами
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
              >
                Добавить вопрос
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Уровень</TableCell>
                    <TableCell>Тип</TableCell>
                    <TableCell>Вопрос (RU)</TableCell>
                    <TableCell>Вопрос (KG)</TableCell>
                    <TableCell>Правильный ответ</TableCell>
                    <TableCell>Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {questions.map((question) => (
                    <TableRow key={question.id}>
                      <TableCell>{question.id}</TableCell>
                      <TableCell>
                        <Chip 
                          label={question.level === 'easy' ? 'Легкий' : 'Средний'} 
                          color={question.level === 'easy' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={question.type === 'logic' ? 'Логический' : 'Мотивационный'} 
                          color={question.type === 'logic' ? 'primary' : 'secondary'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={{ maxWidth: 200 }}>
                        <Typography noWrap>
                          {question.question_ru}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 200 }}>
                        <Typography noWrap>
                          {question.question_kg}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {question.correct_answer}
                      </TableCell>
                      <TableCell>
                        <IconButton 
                          size="small" 
                          onClick={() => handleOpenDialog(question)}
                          title="Редактировать"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleDelete(question.id)}
                          title="Удалить"
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
          </Box>
        )}

        {/* Users Tab */}
        {tab === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Пользователи системы
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>ФИО</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Роль</TableCell>
                    <TableCell>Дата регистрации</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{user.full_name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip 
                          label={user.role} 
                          color={user.role === 'admin' ? 'error' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString('ru-RU')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Results Tab */}
        {tab === 3 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Результаты тестирования
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Студент</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Уровень</TableCell>
                    <TableCell align="right">Баллы</TableCell>
                    <TableCell align="right">Процент</TableCell>
                    <TableCell>Уровень логики</TableCell>
                    <TableCell>Дата</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell>{result.id}</TableCell>
                      <TableCell>{result.full_name}</TableCell>
                      <TableCell>{result.email}</TableCell>
                      <TableCell>
                        {result.level === 'easy' ? 'Легкий' : 'Средний'}
                      </TableCell>
                      <TableCell align="right">{result.score}/10</TableCell>
                      <TableCell align="right">{result.percentage}%</TableCell>
                      <TableCell>
                        <Chip 
                          label={getLevelText(result.color_level)} 
                          color={getLevelColor(result.color_level) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(result.completed_at).toLocaleDateString('ru-RU')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Box>

      {/* Question Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingQuestion ? 'Редактировать вопрос' : 'Добавить новый вопрос'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Уровень сложности"
                  value={formData.level}
                  onChange={(e) => handleFormChange('level', e.target.value)}
                  sx={{ mb: 2 }}
                >
                  <MenuItem value="easy">Легкий</MenuItem>
                  <MenuItem value="medium">Средний</MenuItem>
                </TextField>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Тип вопроса"
                  value={formData.type}
                  onChange={(e) => handleFormChange('type', e.target.value)}
                  sx={{ mb: 2 }}
                >
                  <MenuItem value="logic">Логический</MenuItem>
                  <MenuItem value="motivational">Мотивационный</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              Вопрос на русском языке
            </Typography>
            <TextField
              fullWidth
              label="Текст вопроса"
              value={formData.question_ru}
              onChange={(e) => handleFormChange('question_ru', e.target.value)}
              multiline
              rows={3}
              sx={{ mb: 3 }}
            />

            <Typography variant="subtitle1" gutterBottom>
              Вопрос на кыргызском языке
            </Typography>
            <TextField
              fullWidth
              label="Суроонун тексти"
              value={formData.question_kg}
              onChange={(e) => handleFormChange('question_kg', e.target.value)}
              multiline
              rows={3}
              sx={{ mb: 3 }}
            />

            <Typography variant="subtitle1" gutterBottom>
              Варианты ответов (русский)
            </Typography>
            <Grid container spacing={2}>
              {formData.options_ru.map((option, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <TextField
                    fullWidth
                    label={`Вариант ${index + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange('ru', index, e.target.value)}
                  />
                </Grid>
              ))}
            </Grid>

            <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
              Жооп варианттары (кыргызча)
            </Typography>
            <Grid container spacing={2}>
              {formData.options_kg.map((option, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <TextField
                    fullWidth
                    label={`Вариант ${index + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange('kg', index, e.target.value)}
                  />
                </Grid>
              ))}
            </Grid>

            <TextField
              fullWidth
              label="Правильный ответ"
              value={formData.correct_answer}
              onChange={(e) => handleFormChange('correct_answer', e.target.value)}
              sx={{ mt: 3 }}
              helperText="Введите точный текст правильного ответа"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingQuestion ? 'Сохранить изменения' : 'Создать вопрос'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPanel;