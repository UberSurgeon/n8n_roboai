// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

import { WizardProvider } from "./context/WizardContext"; // 🔑 import

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <WizardProvider> {/* <-- Wrap here */}
        <App />
      </WizardProvider>
    </BrowserRouter>
  </React.StrictMode>
);
