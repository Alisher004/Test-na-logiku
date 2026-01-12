import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Box,
  IconButton,
  Alert,
  Divider,
  Typography,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Delete,
  Add,
} from '@mui/icons-material';

interface QuestionDialogProps {
  open: boolean;
  onClose: () => void;
  editingQuestion: any;
  onSubmit: (data: any) => void;
  onDelete?: (id: number) => void;
}

const QuestionDialog: React.FC<QuestionDialogProps> = ({
  open,
  onClose,
  editingQuestion,
  onSubmit,
  onDelete,
}) => {
  const [formData, setFormData] = useState({
    level: 'easy',
    type: 'logic',
    question_ru: '',
    question_kg: '',
    options_ru: ['', '', '', ''],
    options_kg: ['', '', '', ''],
    correct_answer: '',
  });
  
  const [correctOptionIndex, setCorrectOptionIndex] = useState<number>(0);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (editingQuestion) {
      setFormData({
        level: editingQuestion.level,
        type: editingQuestion.type,
        question_ru: editingQuestion.question_ru,
        question_kg: editingQuestion.question_kg,
        options_ru: editingQuestion.options_ru,
        options_kg: editingQuestion.options_kg,
        correct_answer: editingQuestion.correct_answer,
      });
      
      const ruIndex = editingQuestion.options_ru.indexOf(editingQuestion.correct_answer);
      const kgIndex = editingQuestion.options_kg.indexOf(editingQuestion.correct_answer);
      setCorrectOptionIndex(ruIndex !== -1 ? ruIndex : kgIndex);
    } else {
      resetForm();
    }
  }, [editingQuestion]);

  const resetForm = () => {
    setFormData({
      level: 'easy',
      type: 'logic',
      question_ru: '',
      question_kg: '',
      options_ru: ['', '', '', ''],
      options_kg: ['', '', '', ''],
      correct_answer: '',
    });
    setCorrectOptionIndex(0);
    setErrors([]);
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleOptionChange = (lang: 'ru' | 'kg', index: number, value: string) => {
    const newOptions = [...formData[`options_${lang}` as keyof typeof formData] as string[]];
    newOptions[index] = value;
    
    setFormData({
      ...formData,
      [`options_${lang}`]: newOptions,
    });
  };

  const handleAddOption = (lang: 'ru' | 'kg') => {
    const currentOptions = formData[`options_${lang}` as keyof typeof formData] as string[];
    const newOptions = [...currentOptions, ''];
    setFormData({
      ...formData,
      [`options_${lang}`]: newOptions,
    });
  };

  const handleRemoveOption = (lang: 'ru' | 'kg', index: number) => {
    const currentOptions = formData[`options_${lang}` as keyof typeof formData] as string[];
    const newOptions = [...currentOptions];
    newOptions.splice(index, 1);
    
    setFormData({
      ...formData,
      [`options_${lang}`]: newOptions,
    });
    
    if (index === correctOptionIndex) {
      setCorrectOptionIndex(0);
    }
  };

  const handleSubmit = () => {
    const correctAnswer = (formData.options_ru[correctOptionIndex] || formData.options_kg[correctOptionIndex]) || '';
    
    onSubmit({
      ...formData,
      correct_answer: correctAnswer,
    });
    
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {editingQuestion ? 'Редактировать вопрос' : 'Добавить вопрос'}
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Уровень"
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
            multiline
            rows={2}
            value={formData.question_ru}
            onChange={(e) => handleFormChange('question_ru', e.target.value)}
            sx={{ mb: 3 }}
          />

          <Typography variant="subtitle1" gutterBottom>
            Вопрос на кыргызском языке
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={2}
            value={formData.question_kg}
            onChange={(e) => handleFormChange('question_kg', e.target.value)}
            sx={{ mb: 3 }}
          />

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Варианты ответов (русский)
                  </Typography>
                  <Button
                    startIcon={<Add />}
                    onClick={() => handleAddOption('ru')}
                    size="small"
                  >
                    Добавить
                  </Button>
                </Box>
                
                <FormControl component="fieldset" fullWidth>
                  <FormLabel>Выберите правильный ответ:</FormLabel>
                  <RadioGroup
                    value={correctOptionIndex}
                    onChange={(e) => setCorrectOptionIndex(parseInt(e.target.value))}
                  >
                    {formData.options_ru.map((option, index) => (
                      <Box 
                        key={index} 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          mb: 1,
                          p: 1,
                          border: '1px solid',
                          borderColor: correctOptionIndex === index ? 'primary.main' : 'grey.300',
                          borderRadius: 1,
                          bgcolor: correctOptionIndex === index ? 'primary.50' : 'transparent',
                        }}
                      >
                        <FormControlLabel
                          value={index}
                          control={<Radio />}
                          label=""
                          sx={{ m: 0, mr: 1 }}
                        />
                        <TextField
                          fullWidth
                          size="small"
                          value={option}
                          onChange={(e) => handleOptionChange('ru', index, e.target.value)}
                        />
                        {formData.options_ru.length > 2 && (
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveOption('ru', index)}
                            sx={{ ml: 1 }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        )}
                        {correctOptionIndex === index && (
                          <CheckCircle color="success" sx={{ ml: 1 }} />
                        )}
                      </Box>
                    ))}
                  </RadioGroup>
                </FormControl>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    Жооп варианттары (кыргызча)
                  </Typography>
                  <Button
                    startIcon={<Add />}
                    onClick={() => handleAddOption('kg')}
                    size="small"
                  >
                    Кошуу
                  </Button>
                </Box>
                
                {formData.options_kg.map((option, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      mb: 1,
                      p: 1,
                      border: '1px solid',
                      borderColor: 'grey.300',
                      borderRadius: 1,
                    }}
                  >
                    <Box sx={{ 
                      width: 24, 
                      height: 24, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      mr: 1,
                      color: correctOptionIndex === index ? 'success.main' : 'text.secondary'
                    }}>
                      {correctOptionIndex === index ? (
                        <CheckCircle fontSize="small" />
                      ) : (
                        <Cancel fontSize="small" />
                      )}
                    </Box>
                    <TextField
                      fullWidth
                      size="small"
                      value={option}
                      onChange={(e) => handleOptionChange('kg', index, e.target.value)}
                    />
                    {formData.options_kg.length > 2 && (
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveOption('kg', index)}
                        sx={{ ml: 1 }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>

          <Alert severity="info" icon={<CheckCircle />}>
            <Typography variant="subtitle2" gutterBottom>
              Правильный ответ:
            </Typography>
            <Typography>
              Русский: <strong>{formData.options_ru[correctOptionIndex] || 'Не указан'}</strong>
            </Typography>
            <Typography>
              Кыргызский: <strong>{formData.options_kg[correctOptionIndex] || 'Көрсөтүлгөн эмес'}</strong>
            </Typography>
          </Alert>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        {editingQuestion && onDelete && (
          <Button
            color="error"
            onClick={() => {
              if (window.confirm('Удалить этот вопрос?')) {
                onDelete(editingQuestion.id);
                onClose();
              }
            }}
            startIcon={<Delete />}
          >
            Удалить
          </Button>
        )}
        
        <Box sx={{ flex: 1 }} />
        
        <Button onClick={onClose} color="inherit">
          Отмена
        </Button>
        
        <Button
          variant="contained"
          onClick={handleSubmit}
          startIcon={<CheckCircle />}
        >
          {editingQuestion ? 'Сохранить' : 'Создать'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuestionDialog;