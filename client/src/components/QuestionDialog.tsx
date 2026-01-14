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
} from '@mui/material';
import {
  CheckCircle,
  Delete,
  Add,
  RadioButtonUnchecked,
} from '@mui/icons-material';

interface QuestionDialogProps {
  open: boolean;
  onClose: () => void;
  editingQuestion: any;
  onSubmit: (data: any) => void;
  onDelete?: (id: number) => void;
}

/** 🔥 BACKEND МАППИНГ */
const LEVEL_MAP: Record<string, string> = {
  easy: 'weak',
  medium: 'medium',
};

const TYPE_MAP: Record<string, string> = {
  logic: 'single',
  motivational: 'text',
};

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

  const [correctOptionIndex, setCorrectOptionIndex] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (!editingQuestion) {
      resetForm();
      return;
    }

    setFormData({
      level: editingQuestion.level === 'weak' ? 'easy' : editingQuestion.level,
      type: editingQuestion.type === 'single' ? 'logic' : 'motivational',
      question_ru: editingQuestion.question_ru || '',
      question_kg: editingQuestion.question_kg || '',
      options_ru: editingQuestion.options_ru?.length
        ? editingQuestion.options_ru
        : ['', '', '', ''],
      options_kg: editingQuestion.options_kg?.length
        ? editingQuestion.options_kg
        : ['', '', '', ''],
      correct_answer: editingQuestion.correct_answer || '',
    });

    if (editingQuestion.options_ru?.length) {
      const idx = editingQuestion.options_ru.indexOf(
        editingQuestion.correct_answer
      );
      setCorrectOptionIndex(idx >= 0 ? idx : 0);
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

  const validateForm = () => {
    const errs: string[] = [];

    if (!formData.question_ru.trim()) errs.push('Вопрос на русском обязателен');
    if (!formData.question_kg.trim()) errs.push('Вопрос на кыргызском обязателен');

    if (formData.type === 'logic') {
      formData.options_ru.forEach((o, i) => {
        if (!o.trim()) errs.push(`Вариант ${i + 1} (RU) обязателен`);
      });
      formData.options_kg.forEach((o, i) => {
        if (!o.trim()) errs.push(`Вариант ${i + 1} (KG) обязателен`);
      });
    } else {
      if (!formData.correct_answer.trim()) {
        errs.push('Ожидаемый ответ обязателен');
      }
    }

    setErrors(errs);
    return errs.length === 0;
  };

const handleSubmit = () => {
  if (!validateForm()) return;

  const submitData = {
    level: formData.level,          // 🔥 MAP ЖОК
    type: formData.type,            // 🔥 MAP ЖОК
    question_ru: formData.question_ru.trim(),
    question_kg: formData.question_kg.trim(),
    options_ru: formData.type === 'logic' ? formData.options_ru : [],
    options_kg: formData.type === 'logic' ? formData.options_kg : [],
    correct_answer:
      formData.type === 'logic'
        ? formData.options_ru[correctOptionIndex]
        : formData.correct_answer.trim(),
  };

  console.log('SEND:', submitData); // 👈 ОБЯЗАТЕЛЬНО

  onSubmit(submitData);
};


  const handleOptionChange = (
    lang: 'ru' | 'kg',
    index: number,
    value: string
  ) => {
    const key = `options_${lang}` as 'options_ru' | 'options_kg';
    const arr = [...formData[key]];
    arr[index] = value;
    setFormData({ ...formData, [key]: arr });
  };

  const handleAddOption = (lang: 'ru' | 'kg') => {
    const key = `options_${lang}` as 'options_ru' | 'options_kg';
    setFormData({ ...formData, [key]: [...formData[key], ''] });
  };

  const handleRemoveOption = (lang: 'ru' | 'kg', index: number) => {
    const key = `options_${lang}` as 'options_ru' | 'options_kg';
    const arr = [...formData[key]];
    arr.splice(index, 1);
    setFormData({ ...formData, [key]: arr });
    if (index === correctOptionIndex) setCorrectOptionIndex(0);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {editingQuestion ? 'Редактировать вопрос' : 'Создать вопрос'}
      </DialogTitle>

      <DialogContent dividers>
        {errors.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.map((e, i) => (
              <div key={i}>• {e}</div>
            ))}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={6}>
            <TextField
              select
              fullWidth
              label="Уровень"
              value={formData.level}
              onChange={(e) =>
                setFormData({ ...formData, level: e.target.value })
              }
            >
              <MenuItem value="easy">Легкий</MenuItem>
              <MenuItem value="medium">Средний</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={6}>
            <TextField
              select
              fullWidth
              label="Тип"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
            >
              <MenuItem value="logic">Логический</MenuItem>
              <MenuItem value="motivational">Текстовый</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        {editingQuestion && onDelete && (
          <Button
            color="error"
            onClick={() => onDelete(editingQuestion.id)}
            startIcon={<Delete />}
          >
            Удалить
          </Button>
        )}
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose}>Отмена</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuestionDialog;