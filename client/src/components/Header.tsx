import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Select,
  MenuItem,
  FormControl,
  SelectChangeEvent,
  Avatar,
  Menu,
  MenuItem as MuiMenuItem,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import {
  Logout,
  Person,
  BarChart,
  School,
  AdminPanelSettings,
  Assignment,
} from "@mui/icons-material";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleLanguageChange = (event: SelectChangeEvent) => {
    const lang = event.target.value;
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
  };

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
    navigate("/");
  };

  const handleNavigation = (path: string) => {
    handleClose();
    navigate(path);
  };

  return (
    <AppBar position="static" sx={{ mb: 4 }}>
      <Toolbar>
        {/* Logo / Title */}
        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
          onClick={() => navigate("/")}
        >
          <School />
          Окурмен Тест
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Language Selector */}
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <Select
              value={i18n.language}
              onChange={handleLanguageChange}
              sx={{
                color: "white",
                bgcolor: "rgba(255,255,255,0.1)",
                "& .MuiSelect-icon": { color: "white" },
                "& .MuiOutlinedInput-notchedOutline": { border: "none" },
              }}
            >
              <MenuItem value="ru">Русский</MenuItem>
              <MenuItem value="kg">Кыргызча</MenuItem>
            </Select>
          </FormControl>

          {user ? (
            <>
              {/* User Profile Icon */}
              <IconButton
                onClick={handleProfileClick}
                size="small"
                sx={{ ml: 2 }}
                aria-controls={open ? "account-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: user.role === "admin" ? "#d32f2f" : "#1976d2",
                    fontSize: "1rem",
                    fontWeight: "bold",
                    border: "1px solid white",
                  }}
                >
                  {user.full_name.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>

              {/* Profile Dropdown Menu */}
              <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                PaperProps={{
                  elevation: 3,
                  sx: {
                    width: 250,
                    overflow: "visible",
                    mt: 1.5,
                  },
                }}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              >
                {/* User Info */}
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {user.full_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.email}
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        px: 1,
                        py: 0.5,
                        bgcolor:
                          user.role === "admin"
                            ? "error.light"
                            : "primary.light",
                        color:
                          user.role === "admin"
                            ? "error.contrastText"
                            : "primary.contrastText",
                        borderRadius: 1,
                        fontWeight: "bold",
                      }}
                    >
                      {user.role === "admin" ? "Администратор" : "Студент"}
                    </Typography>
                  </Box>
                </Box>

                <Divider />

                {/* Student Menu Items */}
                {user.role === "student" && (
                  <>
                    <MuiMenuItem
                      onClick={() => handleNavigation("/test/select")}
                    >
                      <ListItemIcon>
                        <Assignment fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Пройти тест</ListItemText>
                    </MuiMenuItem>

                    <MuiMenuItem onClick={() => handleNavigation("/results")}>
                      <ListItemIcon>
                        <BarChart fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Мои результаты</ListItemText>
                    </MuiMenuItem>

                    <Divider />
                  </>
                )}

                {/* Admin Menu Items */}
                {user.role === "admin" && (
                  <>
                    <MuiMenuItem
                      onClick={() => handleNavigation("/admin?tab=dashboard")}
                    >
                      {" "}
                      <ListItemIcon>
                        <AdminPanelSettings fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Админ панель</ListItemText>
                    </MuiMenuItem>
                    <Divider />
                  </>
                )}

                {/* Logout */}
                <MuiMenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <Logout fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Выйти</ListItemText>
                </MuiMenuItem>
              </Menu>
            </>
          ) : (
            <>
              {/* Guest Menu */}
              <Button
                color="inherit"
                onClick={() => navigate("/login")}
                sx={{ display: { xs: "none", sm: "block" } }}
              >
                Войти
              </Button>
              <Button
                color="inherit"
                onClick={() => navigate("/register")}
                sx={{ display: { xs: "none", sm: "block" } }}
              >
                Регистрация
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;