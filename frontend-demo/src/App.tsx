import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TriggerPage from "./pages/Trigger_Page";
import Agent_Action from "./pages/Agent_Action";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/trigger-page" element={<TriggerPage />} />
      <Route path="/agent-action" element={<Agent_Action />} />
      {/* Default route */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}
