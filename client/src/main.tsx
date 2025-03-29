import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { AnimatePresence } from "framer-motion";

createRoot(document.getElementById("root")!).render(
  <AnimatePresence>
    <App />
  </AnimatePresence>
);
