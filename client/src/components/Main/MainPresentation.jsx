import React from "react";
import style from "./Main.module.scss";
import "./Main.scss";
import ChatsContainer from "../Chats/ChatsContainer";
import СonferenceContainer from "../Сonference/СonferenceContainer";
import { Route, Routes, useLocation } from "react-router-dom";

export default function MainPresentation(props) {
  return (
    <div className="wrapper-main">
      <header className="header-main">
        <h2>
          <span
            className={useLocation().pathname == "/main/chat" ? "active" : ""}
            onClick={() => {
              props.navigate("/main/chat");
            }}
          >
            Общий чат
          </span>

          <span
            className={useLocation().pathname == "/main/conference" ? "active" : ""}
            onClick={() => {
              props.navigate("/main/conference");
            }}
          >
            Конференция
          </span>
        </h2>
        <nav>
          <p>{props.currentUser.UserLogin}</p>
          <button onClick={props.logout}>Сменить аккаунт</button>
        </nav>
      </header>

      <main className="content-main">
        <Routes>
          <Route path="/chat" element={<ChatsContainer {...props} />} />
          <Route path="/conference" element={<СonferenceContainer {...props} />} />
          <Route path="/" element={<h2>Привет! Потерял чего?</h2>} />
        </Routes>
      </main>
    </div>
  );
}
