import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Card,
  CardContent,
  LinearProgress,
  Box,
  Alert,
  TextField,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Question {
  id: number;
  question: string;
  options: string[];
  type: string; // 'single', 'multiple', 'text', 'motivational'
  image_url?: string;
  image_filename?: string;
}

const TestPage: React.FC = () => {
  const { level } = useParams<{ level: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [textAnswers, setTextAnswers] = useState<{ [key: number]: string }>({});
  const [timeLeft, setTimeLeft] = useState(20 * 60);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuestions();
  }, [level]);

  useEffect(() => {
    if (timeLeft > 0 && questions.length > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      submitTest();
    }
  }, [timeLeft, questions]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/test/questions/${level}`, {
        params: { lang: i18n.language }
      });
      
      const validatedQuestions = response.data.map((q: any) => ({
        ...q,
        options: Array.isArray(q.options) ? q.options : [],
        type: q.type || 'single'
      }));
      
      console.log('Fetched questions:', validatedQuestions);
      setQuestions(validatedQuestions);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers({
      ...answers,
      [questionId]: answer,
    });
  };

  const handleTextAnswerChange = (questionId: number, text: string) => {
    setTextAnswers({
      ...textAnswers,
      [questionId]: text,
    });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const isCurrentQuestionAnswered = () => {
    const currentQ = questions[currentQuestion];
    if (!currentQ) return false;
    
    if (currentQ.type === 'motivational' || currentQ.type === 'text') {
      return !!textAnswers[currentQ.id] && textAnswers[currentQ.id].trim().length > 0;
    } else {
      return !!answers[currentQ.id];
    }
  };

  const submitTest = async () => {
    try {
      const answerArray = Object.entries(answers).map(([questionId, answer]) => ({
        questionId: parseInt(questionId),
        answer,
        type: 'choice'
      }));

      const textAnswerArray = Object.entries(textAnswers).map(([questionId, text]) => ({
        questionId: parseInt(questionId),
        answer: text,
        type: 'text'
      }));

      await api.post('/test/submit', {
        userId: user?.id,
        level,
        answers: [...answerArray, ...textAnswerArray],
      });

      navigate('/results');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit test');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;

  if (loading) {
    return (
      <Container>
        <Typography align="center">Загрузка вопросов...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (questions.length === 0) {
    return (
      <Container>
        <Typography align="center">Вопросы не найдены</Typography>
      </Container>
    );
  }

  const currentQ = questions[currentQuestion];
  
  if (!currentQ) {
    return (
      <Container>
        <Alert severity="error">Вопрос не найден</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6">
            Вопрос {currentQuestion + 1} из {questions.length}
            {currentQ.type === 'motivational' && ' (Мотивационный)'}
            {currentQ.type === 'text' && ' (Текстовый ответ)'}
          </Typography>
          <Typography variant="h6" color="primary">
            Время: {formatTime(timeLeft)}
          </Typography>
        </Box>

        <LinearProgress variant="determinate" value={progress} sx={{ mb: 3 }} />

        <Card>
          <CardContent>
            <Typography variant="h6" paragraph>
              {currentQ.question}
            </Typography>

            {currentQ.image_url && (
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                <img 
                  src={`http://localhost:5001${currentQ.image_url}`}
                  alt="Question illustration"
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '300px', 
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                  onError={(e) => {
                    console.error('Image failed to load:', e.currentTarget.src);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </Box>
            )}

            {currentQ.type === 'motivational' || currentQ.type === 'text' ? (
              <Box sx={{ mt: 3 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={currentQ.type === 'motivational' ? 6 : 4}
                  variant="outlined"
                  label={currentQ.type === 'motivational' ? 'Ваш ответ (мотивация)' : 'Ваш ответ'}
                  value={textAnswers[currentQ.id] || ''}
                  onChange={(e) => handleTextAnswerChange(currentQ.id, e.target.value)}
                  placeholder={
                    currentQ.type === 'motivational' 
                      ? 'Пожалуйста, напишите вашу мотивацию...' 
                      : 'Пожалуйста, напишите ваш ответ...'
                  }
                />
                {currentQ.type === 'motivational' && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Пожалуйста, напишите вашу мотивацию для участия
                  </Alert>
                )}
              </Box>
            ) : (
              <FormControl component="fieldset" fullWidth>
                <RadioGroup
                  value={answers[currentQ.id] || ''}
                  onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                >
                  {currentQ.options.map((option, index) => (
                    <FormControlLabel
                      key={index}
                      value={option}
                      control={<Radio />}
                      label={option}
                      sx={{ mb: 1 }}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>

              {currentQuestion === questions.length - 1 ? (
                <Button
                  variant="contained"
                  color="success"
                  onClick={submitTest}
                  disabled={!isCurrentQuestionAnswered()}
                >
                  Завершить тест
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!isCurrentQuestionAnswered()}
                >
                  Следующий вопрос
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>

        <Alert severity="info" sx={{ mt: 3 }}>
          {currentQ.type === 'motivational' || currentQ.type === 'text' 
            ? 'Пожалуйста, напишите развернутый ответ' 
            : 'Нельзя пропустить вопрос. Выберите ответ, чтобы продолжить.'}
        </Alert>
      </Box>
    </Container>
  );
};

export default TestPage;