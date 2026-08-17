import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import RoomSelection from "./pages/RoomSelection";
import RoomPage from "./pages/RoomPage";
import Calendar from "./pages/Calendar";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProblemDetail from "./pages/ProblemDetail";
import Discussions from "./pages/Discussion";
import SolutionDetail from "./pages/SolutionDetail";
import SolutionsList from "./pages/SolutionsList";
import Header from "./components/Header";
import UserProfile from './pages/UserProfile';
import FriendsProfile from "./pages/FriendsProfile";
import CodeEditorPage from "./pages/CodeEditorPage";
import RequireAuth from "./components/RequireAuth";

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          }
        />
        <Route
          path="/rooms"
          element={
            <RequireAuth>
              <RoomSelection />
            </RequireAuth>
          }
        />
        <Route
          path="/rooms/:roomId"
          element={
            <RequireAuth>
              <RoomPage />
            </RequireAuth>
          }
        />
        <Route
          path="/calendar"
          element={
            <RequireAuth>
              <Calendar />
            </RequireAuth>
          }
        />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/problem/:titleSlug"
          element={
            <RequireAuth>
              <ProblemDetail />
            </RequireAuth>
          }
        />
        <Route
          path="/discussions/:titleSlug"
          element={
            <RequireAuth>
              <Discussions />
            </RequireAuth>
          }
        />
        <Route
          path="/solution/:id"
          element={
            <RequireAuth>
              <SolutionDetail />
            </RequireAuth>
          }
        />
        <Route
          path="/solutions/:titleSlug"
          element={
            <RequireAuth>
              <SolutionsList />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <UserProfile />
            </RequireAuth>
          }
        />
        <Route
          path="/user/:id"
          element={
            <RequireAuth>
              <FriendsProfile />
            </RequireAuth>
          }
        />
        <Route
          path="/codeeditor"
          element={
            <RequireAuth>
              <CodeEditorPage />
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
