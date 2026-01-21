import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TriggerPage from "./pages/Trigger_Page";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/trigger-page" element={<TriggerPage />} />
      {/* Default route */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}
