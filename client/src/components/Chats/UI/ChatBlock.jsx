import style from "../Chats.module.scss";
import ImageBlock from "./ImageBlock";
import { useState } from "react";

export default function ChatBlock({ currentUser, messages, deleteMessage, chatRef, setSelectedMessage, urlServer }) {
  const [urlImage, setUrlImage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [startCord, setStartCord] = useState({});

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
              onTouchStart={(e) => {
                setStartCord({ x: e.touches[0].clientX, y: e.touches[0].clientY });
                setIsDragging(true);
              }}
              onTouchMove={(e) => {
                if (!isDragging) return;
                let currentX = e.touches[0].clientX;
                let currentY = e.touches[0].clientY;

                let deltaX = startCord.x - currentX;
                let deltaY = startCord.y - currentY;

                if (Math.abs(deltaY) > 6) return;

                if (deltaX > 0) {
                  e.target.closest("[data-id]").style.cssText = `transform: translateX(${-deltaX}px)`;
                  if (Math.abs(deltaX) > 70) {
                    setSelectedMessage(message);
                    e.target.closest("[data-id]").style.cssText = `transform: translateX(0)`;
                  }
                }
              }}
              onTouchEnd={(e) => {
                e.target.closest("[data-id]").style.cssText = `transform: translateX(0)`;
                setIsDragging(false);
              }}
            >
              {message.MessageSenderLogin != currentUser.UserLogin ? (
                <p className={style["chat__message-user"]}>{message.MessageSenderName}</p>
              ) : (
                ""
              )}
              {message.MessageImage ? (
                <img
                  onDragStart={(e) => {
                    e.preventDefault();
                  }}
                  className={style["chat__message-image"]}
                  src={urlServer + message.MessageImage}
                  alt="Тут было изображение. Но оно в отпуске..."
                  onClick={() => {
                    setUrlImage(urlServer + message.MessageImage);
                  }}
                />
              ) : (
                ""
              )}
              <p className={style["chat__message-content"]}>{message.MessageContent}</p>

              <p className={style["chat__message-date"]}>{message.MessageDate}</p>

              {(() => {
                const answeredMessage = messages.find((value) => value.MessageId == message.MessageAnswerOn);
                if (answeredMessage) {
                  return (
                    <div
                      className={style["chat__message-answer"]}
                      onClick={(e) => {
                        const answeredMessageBlock = Array.from(chatRef.current.children).find(
                          (message) => message.getAttribute("data-id") == answeredMessage.MessageId
                        );
                        answeredMessageBlock.scrollIntoView({ block: "center", behavior: "smooth" });
                        answeredMessageBlock.style.cssText = `box-shadow: 0 0 10px yellow;`;
                        setTimeout(() => {
                          answeredMessageBlock.style.cssText = ``;
                        }, 1000);
                      }}
                    >
                      <h3>Ответ для {answeredMessage.MessageSenderName}</h3>
                      {answeredMessage.MessageContent ? (
                        <p>
                          <span>></span> {answeredMessage.MessageContent}
                        </p>
                      ) : (
                        ""
                      )}

                      {answeredMessage.MessageImage ? (
                        <img src={urlServer + answeredMessage.MessageImage} alt="" />
                      ) : (
                        ""
                      )}
                    </div>
                  );
                } else {
                  return "";
                }
              })()}

              <nav className={style["chat__message-menu"]}>
                <button
                  className={style["chat__message-menu-toAnswer"]}
                  title="Ответить"
                  onClick={(e) => {
                    setSelectedMessage(message);
                  }}
                >
                  ←
                </button>
                {message.MessageSenderLogin == currentUser.UserLogin ? (
                  <button
                    className={style["chat__message-menu-toDelete"]}
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
              </nav>
            </div>
          ))}

      {urlImage && <ImageBlock urlImage={urlImage} setUrlImage={setUrlImage}></ImageBlock>}
    </div>
  );
}
