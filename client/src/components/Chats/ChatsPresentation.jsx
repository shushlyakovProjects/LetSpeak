import React from "react";
import style from "./Chats.module.scss";
import { useState } from "react";

export default function ChatsPresentation({ logout, sendMessage, messages, currentUser }) {
  const [textareaValue, setTextareaValue] = useState("");
  
  
  return (
    <div className={style["wrapper"]}>
      <header>
        <h2>Общий чат</h2>
        <nav>
          <button onClick={logout}>Выход</button>
        </nav>
      </header>

      <div className={style["chat"]}>
        {!messages ? 'Сообщений пока нет. Будь первым! :)' : messages.map((message) => (
          <div
            key={message.MessageId}
            className={
              message.MessageSender == currentUser.UserName
                ? `${style["chat__message"]} ${style["chat__myMessage"]}`
                : `${style["chat__message"]} `
            }
          >
            {/* ДОБАВИТЬ ПРОВЕРКУ ПО LOGIN, А НЕ ПО ИМЕНИ */}
            {message.MessageSender != currentUser.UserName ? (
              <p className={style["chat__message-user"]}>{message.MessageSender}</p>
            ) : (
              ""
            )}
            <p className={style["chat__message-content"]}>{message.MessageContent}</p>
            <p className={style["chat__message-date"]}>{message.MessageDate}</p>
          </div>
        ))}
      </div>
      <div className={style["textarea"]}>
        <textarea
          placeholder="Сообщение..."
          onInput={(e) => {
            setTextareaValue(e.target.value);
          }}
        ></textarea>
        <button
          className={style["textarea__button"]}
          title="Отправить"
          onClick={() => {
            sendMessage(textareaValue);
            setTextareaValue("");
          }}
        >
          ▶
        </button>
      </div>
    </div>
  );
}
