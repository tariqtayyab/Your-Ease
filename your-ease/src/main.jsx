// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { CartProvider } from "./context/CartContext";
import ErrorBoundary from "./components/ErrorBoundary";

// setTimeout(() => {
//   import('./index.css');
// }, 0);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <CartProvider>
        <ErrorBoundary>
           <App />
        </ErrorBoundary>
      </CartProvider>
    </BrowserRouter>
  </React.StrictMode>
);
