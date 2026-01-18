import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import { useTranslation } from "react-i18next";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { Download, Visibility, Print } from "@mui/icons-material";

interface Answer {
  question_id: number;
  question_text_ru: string;
  question_text_kg: string;
  given_answer: string;
  correct_answer: string;
}

interface Result {
  id: number;
  level: string;
  score: number;
  percentage: number;
  color_level: string;
  completed_at: string;
  user_id: number;
  full_name?: string;
  phone_number?: string;
  total_questions: number;
  answers?: Answer[];
}

interface HistoryItem extends Result {
  full_name: string;
  phone_number: string;
  total_questions: number;
  answers?: Answer[];
}

const ResultPage: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [results, setResults] = useState<Result[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedResult, setExpandedResult] = useState<number | null>(null);
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  const locale = i18n.language === "kg" ? "ky-KG" : "ru-RU";

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError("");

      // Личные результаты
      const myResultsResponse = await api.get(`/test/results/${user?.id}`);
      setResults(myResultsResponse.data);

      // Вся история (только для админа)
      if (user?.role === "admin") {
        try {
          const historyResponse = await api.get("/admin/history");
          setHistory(historyResponse.data);
        } catch (historyError) {
          console.log("History endpoint not available");
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch results");
      console.error("Failed to fetch results:", err);
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "weak":
        return "error";
      case "medium":
        return "warning";
      case "high":
        return "success";
      default:
        return "default";
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case "weak":
        return t("weak");
      case "medium":
        return t("medium");
      case "high":
        return t("high");
      default:
        return level;
    }
  };

  const toggleResultDetails = (id: number) => {
    setExpandedResult(expandedResult === id ? null : id);
  };

  if (loading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
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
          📊 {t("yourResults")}
        </Typography>

        {/* Latest Result Summary */}
        {latestResult && (
          <>
            <Card sx={{ mb: 4 }}>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6">{t("latestResultTitle")}</Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    {t("testLevel")}
                  </Typography>
                  <Typography variant="h5">
                    {latestResult.level === "easy"
                      ? t("easyLevel")
                      : t("mediumLevel")}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    {t("correctAnswers")}
                  </Typography>
                  <Typography variant="h5">
                    {latestResult.score} / {latestResult.total_questions}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    {t("percentage")}
                  </Typography>
                  <Typography variant="h5">
                    {latestResult.percentage}%
                  </Typography>
                </Grid>
              </Grid>

              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t("level")}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={latestResult.percentage}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    mb: 1,
                  }}
                  color={getLevelColor(latestResult.color_level) as any}
                />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 1,
                  }}
                >
                  <Chip
                    label={getLevelText(latestResult.color_level)}
                    color={getLevelColor(latestResult.color_level)}
                    sx={{ fontWeight: "bold" }}
                  />
                  <Typography variant="body2">
                    {new Date(latestResult.completed_at).toLocaleDateString(
                      locale,
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </Typography>
                  <IconButton
                    onClick={() => toggleResultDetails(latestResult.id)}
                    title={expandedResult === latestResult.id ? t('hideDetails') : t('showDetails')}
                    size="small"
                  >
                    <Visibility />
                  </IconButton>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {expandedResult === latestResult.id && latestResult.answers && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('detailedAnswers')}
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>№</TableCell>
                      <TableCell>{t('question')}</TableCell>
                      <TableCell>{t('givenAnswer')}</TableCell>
                      <TableCell>{t('correctAnswer')}</TableCell>
                      <TableCell>{t('status')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {latestResult.answers.map((answer, index) => (
                      <TableRow key={answer.question_id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {answer.question_text_ru}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                              {answer.question_text_kg}
                            </Typography>
                          </Box>
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
              </CardContent>
            </Card>
          )}
          </>
        )}

        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={tab} onChange={(e, v) => setTab(v)} variant="fullWidth">
            <Tab label={t("myResultsTab")} />
            {user?.role === "admin" && <Tab label={t("historyTab")} />}
          </Tabs>
        </Paper>

        {/* My Results Tab */}
        {tab === 0 && (
          <Box>
            {results.length === 0 ? (
              <Alert severity="info">{t("noResultsInfo")}</Alert>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t("dateTime")}</TableCell>
                      <TableCell>{t("levelLabel")}</TableCell>
                      <TableCell align="center">{t("score")}</TableCell>
                      <TableCell align="center">{t("percentage")}</TableCell>
                      <TableCell>{t("logicLevel")}</TableCell>
                      <TableCell>{t("actions")}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {results.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell>
                          {new Date(result.completed_at).toLocaleString(locale)}
                        </TableCell>
                        <TableCell>
                          {result.level === "easy"
                            ? t("easyLevel")
                            : t("mediumLevel")}
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="h6">
                            {result.score}/{result.total_questions}
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
        {tab === 1 && user?.role === "admin" && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              {t("historyTitle")}
            </Typography>

            {history.length === 0 ? (
              <Alert severity="info">{t("noHistory")}</Alert>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell>{t("student")}</TableCell>
                      <TableCell>Телефон</TableCell>
                      <TableCell>{t("testLevel")}</TableCell>
                      <TableCell>{t("dateTime")}</TableCell>
                      <TableCell align="center">{t("score")}</TableCell>
                      <TableCell align="center">{t("percentage")}</TableCell>
                      <TableCell>{t("logicLevel")}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {history.flatMap((item) => [
                      <TableRow key={`${item.id}-main`}>
                        <TableCell>
                          <IconButton
                            onClick={() => toggleResultDetails(item.id)}
                            title={expandedResult === item.id ? t('hideDetails') : t('showDetails')}
                          >
                            {expandedResult === item.id ? <Visibility /> : <Visibility />}
                          </IconButton>
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight="medium">
                            {item.full_name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {item.phone_number}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {item.level === "easy"
                            ? t("easyLevel")
                            : t("mediumLevel")}
                        </TableCell>
                        <TableCell>
                          {new Date(item.completed_at).toLocaleString(locale)}
                        </TableCell>
                        <TableCell align="center">
                          <Typography fontWeight="medium">
                            {item.score}/{item.total_questions}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography
                            fontWeight="medium"
                            color={
                              item.percentage >= 70
                                ? "success.main"
                                : item.percentage >= 40
                                  ? "warning.main"
                                  : "error.main"
                            }
                          >
                            {item.percentage}%
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Chip
                              label={getLevelText(item.color_level)}
                              color={getLevelColor(item.color_level)}
                              size="small"
                            />
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                bgcolor:
                                  item.color_level === "high"
                                    ? "success.main"
                                    : item.color_level === "medium"
                                      ? "warning.main"
                                      : "error.main",
                              }}
                            />
                          </Box>
                        </TableCell>
                      </TableRow>,
                      expandedResult === item.id && item.answers && (
                        <TableRow key={`${item.id}-expanded`}>
                          <TableCell colSpan={8} sx={{ backgroundColor: 'action.hover' }}>
                            <Box sx={{ py: 2 }}>
                              <Typography variant="subtitle2" gutterBottom>
                                {t('detailedAnswers')}
                              </Typography>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>{t('number')}</TableCell>
                                    <TableCell>{t('question')}</TableCell>
                                    <TableCell>{t('givenAnswer')}</TableCell>
                                    <TableCell>{t('correctAnswer')}</TableCell>
                                    <TableCell>{t('status')}</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {item.answers.map((answer, index) => (
                                    <TableRow key={answer.question_id}>
                                      <TableCell>{index + 1}</TableCell>
                                      <TableCell>
                                        <Box>
                                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                            {answer.question_text_ru}
                                          </Typography>
                                          <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                                            {answer.question_text_kg}
                                          </Typography>
                                        </Box>
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
                      )
                    ])}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            <Box
              sx={{
                mt: 3,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {t("totalRecords")}: {history.length}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default ResultPage;
