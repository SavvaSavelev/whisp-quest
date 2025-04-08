// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { DiaryPage } from "./pages/DiaryPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DiaryPage />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
