import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "./contexts/AuthContext";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <AnimatePresence>
      <App />
    </AnimatePresence>
  </AuthProvider>
);
