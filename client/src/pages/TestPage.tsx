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
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Question {
  id: number;
  question: string;
  options: string[];
  type: string;
}

const TestPage: React.FC = () => {
  const { level } = useParams<{ level: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
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
      setQuestions(response.data);
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

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const submitTest = async () => {
    try {
      const answerArray = Object.entries(answers).map(([questionId, answer]) => ({
        questionId: parseInt(questionId),
        answer,
      }));

      await api.post('/test/submit', {
        userId: user?.id,
        level,
        answers: answerArray,
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

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6">
            Вопрос {currentQuestion + 1} из {questions.length}
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

            <FormControl component="fieldset">
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

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                variant="outlined"
                disabled={currentQuestion === 0}
                onClick={() => setCurrentQuestion(currentQuestion - 1)}
              >
                Предыдущий
              </Button>

              {currentQuestion === questions.length - 1 ? (
                <Button
                  variant="contained"
                  color="success"
                  onClick={submitTest}
                  disabled={!answers[currentQ.id]}
                >
                  Завершить тест
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!answers[currentQ.id]}
                >
                  Следующий вопрос
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>

        <Alert severity="info" sx={{ mt: 3 }}>
          Нельзя пропустить вопрос. Выберите ответ, чтобы продолжить.
        </Alert>
      </Box>
    </Container>
  );
};

export default TestPage;