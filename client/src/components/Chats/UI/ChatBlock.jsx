import React from "react";
import style from "../Chats.module.scss";

export default function ChatBlock({ currentUser, messages, deleteMessage, chatRef }) {
  return (
    <div className={style["chat"]} ref={chatRef} id="messagesList">
      {!messages.length
        ? "Сообщений пока нет. Будь первым! :)"
        : messages.map((message) => (
            <div
              data-id={message.MessageId}
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
              {message.MessageImage ? (
                <img
                  className={style["chat__message-image"]}
                  src={"http://localhost:3000/static/" + message.MessageImage}
                  alt="Тут было изображение. Но оно в отпуске..."
                />
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
                    deleteMessage(
                      message.MessageId,
                      message.MessageSenderLogin,
                      message.MessageImage,
                      e.target.closest("div")
                    );
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
