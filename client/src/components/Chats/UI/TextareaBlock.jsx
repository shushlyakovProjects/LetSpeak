import React from "react";
import style from "../Chats.module.scss";

export default function TextareaBlock({
  whoIsTyping,
  sendIsTyping,
  sendMessage,
  textareaRef,
  addEmoji,
  emojiPack,
  emojiRef,
  chatRef,
  sendVoiceMessage,
  inputFileRef,
  isLoadImage,
  setIsLoadImage,
}) {
  return (
    <div
      className={style["textarea"]}
      onMouseLeave={() => {
        emojiRef.current.style.display = "none";
      }}
    >
      {whoIsTyping ? <p className={style["whoIsTyping"]}>{whoIsTyping}</p> : ""}

      <textarea
        className={style["textarea__field"]}
        ref={textareaRef}
        placeholder="Сообщение..."
        onKeyDown={(e) => {
          sendIsTyping();
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
          style={{ transform: "scale(0.8)", paddingBottom: "6px", width: "34px" }}
          className={style["textarea__button"]}
          title="Голосовое сообщение"
          onClick={() => {
            sendVoiceMessage();
          }}
        >
          🎙️
        </button>
        <button
          className={style["textarea__button"]}
          title="Прикрепить файл"
          onClick={() => {
            document.getElementById("textarea-inputFile").click();
          }}
        >
          {isLoadImage ? <div className="loader_1" title="Файл готов"></div> : "+"}
        </button>
        <input
          onChange={(e) => {
            if (e.target.files.length) {
              setIsLoadImage(true);
            } else {
              setIsLoadImage(false);
            }
          }}
          accept="image/*"
          type="file"
          ref={inputFileRef}
          id="textarea-inputFile"
          style={{ display: "none" }}
        />
        <button
          title="Эмодзи"
          style={{ paddingBottom: "6px" }}
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
          ▷
        </button>
      </nav>
    </div>
  );
}
