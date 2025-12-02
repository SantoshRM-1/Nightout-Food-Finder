import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log("[Nightout] App booting");
const rootEl = document.getElementById("root");
if (!rootEl) {
  console.error("[Nightout] Root element not found");
} else {
  createRoot(rootEl).render(<App />);
}
