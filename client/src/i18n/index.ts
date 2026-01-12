import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ru: {
    translation: {
      welcome: "Добро пожаловать",
      login: "Войти",
      register: "Регистрация",
      logout: "Выйти",
      easyLevel: "Лёгкий уровень",
      mediumLevel: "Средний уровень",
      startTest: "Начать тест",
      questions: "15 вопросов",
      time: "20 минут",
      selectLevel: "Выберите уровень",
      adminPanel: "Админ панель",
      manageQuestions: "Управление вопросами",
      viewResults: "Просмотр результатов",
      addQuestion: "Добавить вопрос",
      description: "Проверьте свои логические способности",
    }
  },
  kg: {
    translation: {
      welcome: "Кош келиңиз",
      login: "Кирүү",
      register: "Катталуу",
      logout: "Чыгуу",
      easyLevel: "Жеңил деңгээл",
      mediumLevel: "Орто деңгээл",
      startTest: "Тестти баштоо",
      questions: "15 суроо",
      time: "20 мүнөт",
      selectLevel: "Деңгээлди тандаңыз",
      adminPanel: "Админ панели",
      manageQuestions: "Суроолорду башкаруу",
      viewResults: "Натыйжаларды көрүү",
      addQuestion: "Суроо кошуу",
      description: "Логикалык жөндөмдүүлүгүңүздү текшериңиз",
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'ru',
    fallbackLng: 'ru',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
