import React, { useState } from "react";
import style from "./Main.module.scss";
import "./Main.scss";
import ChatsContainer from "../Chats/ChatsContainer";
import СonferenceContainer from "../Сonference/СonferenceContainer";
import { Route, Routes, useLocation } from "react-router-dom";
import UsersContainer from "../Users/UsersContainer";

export default function MainPresentation(props) {
  const [friendForCall, setFriendForCall] = useState(null);
  const url = useLocation().pathname;

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
            className={url == "/main" || url == "/main/" ? "active" : ""}
            onClick={() => {
              props.navigate("/main");
            }}
          >
            Пользователи
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
          <Route
            path="/conference"
            element={
              <СonferenceContainer {...props} friendForCall={friendForCall} setFriendForCall={setFriendForCall} />
            }
          />
          <Route path="/" element={<UsersContainer {...props} setFriendForCall={setFriendForCall} />} />
          {/* <Route path="/" element={<h3>Привет! Потерял чего? Сверху кнопки</h3>} /> */}
        </Routes>
      </main>
    </div>
  );
}
