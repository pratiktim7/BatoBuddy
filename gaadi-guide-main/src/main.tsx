import "./index.css";
import App from "./App.tsx";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext.tsx";

// Add a loading animation for better UX
const rootElement = document.getElementById("root");
if (rootElement) {
  // Show loading screen
  rootElement.innerHTML = `
    <div class="min-h-screen bg-background flex items-center justify-center">
      <div class="text-center">
        <div class="text-6xl mb-4 animate-bounce-gentle">🚌</div>
        <div class="flex items-center gap-2 text-2xl font-bold text-text mb-2">
          <span>Bato</span>
          <span class="text-accent">Buddy</span>
        </div>
        <p class="text-offText animate-pulse">Starting your journey...</p>
      </div>
    </div>
  `;
}

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <ToastProvider>
      <App />
    </ToastProvider>
  </BrowserRouter>
);
