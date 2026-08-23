import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

/* PWA: регистрация service worker (оффлайн-кэш сообщений) */
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {
      /* оффлайн-режим недоступен — Империя простит */
    });
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
