import React from "react";
import style from "../Chats.module.scss";

export default function ChatBlock({ currentUser, messages, deleteMessage, chatRef }) {
  return (
    <div className={style["chat"]} ref={chatRef}>
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
                  onClick={(e) => {
                    deleteMessage(message.MessageId, message.MessageSenderLogin, e.target.closest("div"));
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
  );
}
