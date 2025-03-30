import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "./contexts/AuthContext";

const root = createRoot(document.getElementById("root")!);

root.render(
  <AuthProvider>
    <AnimatePresence mode="wait">
      <App />
    </AnimatePresence>
  </AuthProvider>
);
