import React from "react";
import style from "./Chats.module.scss";
import { useState } from "react";

export default function ChatsPresentation({
  logout,
  sendMessage,
  messages,
  currentUser,
  textareaValue,
  setTextareaValue,
  deleteMessage,
}) {
  return (
    <div className={style["wrapper"]}>
      <header>
        <h2>Общий чат</h2>
        <nav>
          <button onClick={logout}>Выход</button>
        </nav>
      </header>

      <div className={style["chat"]}>
        {!messages.length
          ? "Сообщений пока нет. Будь первым! :)"
          : messages.map((message) => (
              <div
                key={message.MessageId}
                className={
                  message.MessageSenderLogin == currentUser.UserLogin
                    ? `${style["chat__message"]} ${style["chat__myMessage"]}`
                    : `${style["chat__message"]} `
                }
              >
                {message.MessageSenderLogin != currentUser.UserLogin ? (
                  <p className={style["chat__message-user"]}>{message.MessageSenderName}</p>
                ) : (
                  ""
                )}
                <p className={style["chat__message-content"]}>{message.MessageContent}</p>
                <p className={style["chat__message-date"]}>{message.MessageDate}</p>
                {message.MessageSenderLogin == currentUser.UserLogin ? (
                  <button
                    className={style["chat__message-delete"]}
                    title="Удалить"
                    onClick={() => {
                      deleteMessage(message.MessageId, message.MessageSenderLogin);
                    }}
                  >
                    Х
                  </button>
                ) : (
                  ""
                )}
              </div>
            ))}
      </div>
      <div className={style["textarea"]}>
        <textarea
          value={textareaValue}
          placeholder="Сообщение..."
          onInput={(e) => {
            setTextareaValue(e.target.value);
          }}
        ></textarea>
        <button
          className={style["textarea__button"]}
          title="Отправить"
          onClick={() => {
            sendMessage();
            setTextareaValue("");
          }}
        >
          ▶
        </button>
      </div>
    </div>
  );
}
