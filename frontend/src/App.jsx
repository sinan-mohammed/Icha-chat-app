import Navbar from "./components/Navbar";

import HomePage from "./pages/HomePage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SettingsPage from "./pages/SettingPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore.js";
import { useThemeStore } from "./store/useThemeStore.js";
import { useEffect } from "react";

import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { theme } = useThemeStore();

  // 🔐 Check auth ONCE when app loads
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // ⏳ Wait until auth check finishes
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <div data-theme={theme}>
      {/* 🔥 Navbar ONLY for logged-in users */}
      {authUser && <Navbar />}

      <Routes>
        {/* 🔐 PROTECTED ROUTES */}
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" />}
        />

        <Route
          path="/settings"
          element={authUser ? <SettingsPage /> : <Navigate to="/login" />}
        />

        <Route
          path="/profile"
          element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
        />

        {/* 🔓 PUBLIC ROUTES */}
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />

        <Route
          path="/signup"
          element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
        />

        {/* ❌ CATCH ALL */}
        <Route path="*" element={<Navigate to={authUser ? "/" : "/login"} />} />
      </Routes>

      <Toaster />
    </div>
  );
};

export default App;
