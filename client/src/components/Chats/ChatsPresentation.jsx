import style from "./Chats.module.scss";

import { TransitionGroup, CSSTransition } from "react-transition-group";

export default function ChatsPresentation({
  logout,
  sendMessage,
  messages,
  currentUser,
  chatRef,
  deleteMessage,
  textareaRef,
}) {
  return (
    <div className={style["wrapper"]}>
      <header>
        <h2>Общий чат</h2>
        <nav>
          <p>Вошли как {currentUser.UserLogin}</p>
          <button onClick={logout}>Сменить аккаунт</button>
        </nav>
      </header>

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
      <div className={style["textarea"]}>
        <textarea
          ref={textareaRef}
          placeholder="Сообщение..."
          onKeyDown={(e) => {
            if (e.code == "Enter") {
              if (!e.shiftKey) {
                e.preventDefault();
                sendMessage(textareaRef.current.value);
                textareaRef.current.value = "";
              }
            }
          }}
        ></textarea>
        <button
          className={style["textarea__button"]}
          title="Отправить"
          onClick={() => {
            sendMessage(textareaRef.current.value);
            textareaRef.current.value = "";
            chatRef.current.scrollTo(0,0)
          }}
        >
          ▶
        </button>
      </div>
    </div>
  );
}
