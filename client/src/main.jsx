import { createRoot } from "react-dom/client";
import "./index.scss";
import App from "./App.jsx";
import { Provider } from "react-redux";
import store from "./store/store.js";

import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Provider store={store}>
      <App />
    </Provider>
  </BrowserRouter>
);
