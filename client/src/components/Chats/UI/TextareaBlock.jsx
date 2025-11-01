import React from "react";
import style from "../Chats.module.scss";

export default function TextareaBlock({ sendMessage, textareaRef, addEmoji, emojiPack, emojiRef }) {
  return (
    <div
      className={style["textarea"]}
      onMouseLeave={() => {
        emojiRef.current.style.display = "none";
      }}
    >
      <textarea
        className={style["textarea__field"]}
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
      <nav className={style["textarea__nav"]}>
        <button
          className={style["textarea__button"]}
          onMouseMove={() => {
            emojiRef.current.style.display = "block";
          }}
        >
          ☺
        </button>
        <div
          className={style["textarea__nav_emoji"]}
          ref={emojiRef}
          onMouseLeave={() => {
            emojiRef.current.style.display = "none";
          }}
        >
          <div className={style["textarea__nav_emoji-body"]}>
            {Object.keys(emojiPack).map((key, index) => {
              return (
                <div key={index} className={style["textarea__nav_emoji-section"]}>
                  <p>{key}</p>
                  <ul className={style["textarea__nav_emoji-list"]}>
                    {emojiPack[key].map((emoji, index) => {
                      return (
                        <li
                          key={index}
                          onClick={() => {
                            addEmoji(emoji);
                          }}
                        >
                          {emoji}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
        <button
          className={style["textarea__button"]}
          title="Отправить"
          onClick={() => {
            sendMessage(textareaRef.current.value);
            textareaRef.current.value = "";
            chatRef.current.scrollTo(0, 0);
          }}
        >
          ►
        </button>
      </nav>
    </div>
  );
}
