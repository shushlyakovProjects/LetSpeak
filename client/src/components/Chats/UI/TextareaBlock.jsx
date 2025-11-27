import React from "react";
import style from "../Chats.module.scss";

import EmojiIcon from "../../../assets/icons/Emoji.svg";
import SendIcon from "../../../assets/icons/Send.svg";
import AddIcon from "../../../assets/icons/Add.svg";
import MicrophoneIcon from "../../../assets/icons/Microphone.svg";
import MicrophoneStopIcon from "../../../assets/icons/Stop.svg";

export default function TextareaBlock({
  urlServer,
  whoIsTyping,
  sendIsTyping,
  sendMessage,
  textareaRef,
  addEmoji,
  emojiPack,
  emojiRef,
  chatRef,
  inputFileRef,
  isLoadImage,
  setIsLoadImage,
  setFileFromBuffer,
  selectedMessage,
  setSelectedMessage,

  recordingVoiceMessage,
  buttonVoiceMessageRef,
  isRecordingVoiceMessage,
  sendRecordingVoiceMessage,
  voiceTimerValue,
}) {
  return (
    <div
      className={style["textarea"]}
      onMouseLeave={() => {
        emojiRef.current.style.display = "none";
      }}
    >
      <section className={style["textarea__top"]}>
        {selectedMessage ? (
          <div className={style["selectedMessage"]}>
            <>
              <h3>Ответ для {selectedMessage.MessageSenderName}</h3>
              {selectedMessage.MessageContent ? (
                <p>
                  <span>{">"}</span> {selectedMessage.MessageContent}
                </p>
              ) : (
                ""
              )}

              {selectedMessage.MessageVoiceContent ? (
                <p>
                  <span>♪</span> Голосовое сообщение
                </p>
              ) : (
                ""
              )}

              {selectedMessage.MessageImage ? <img src={urlServer + selectedMessage.MessageImage} alt="" /> : ""}

              <button
                onClick={() => {
                  setSelectedMessage(null);
                }}
              >
                X
              </button>
            </>
          </div>
        ) : (
          ""
        )}

        <p className={style["whoIsTyping"]}>{whoIsTyping ? whoIsTyping : ""}</p>
        <p className={style["nameOfFile"]}>{isLoadImage ? isLoadImage : ""}</p>
      </section>

      <section className={style["textarea__bottom"]}>
        {isRecordingVoiceMessage ? (
          <div className={style["textarea__filler"]}>
            Идет запись... ({Math.floor(voiceTimerValue / 60)}:
            {voiceTimerValue % 60 < 10 ? "0" + (voiceTimerValue % 60) : voiceTimerValue % 60})
          </div>
        ) : (
          <textarea
            className={style["textarea__field"]}
            ref={textareaRef}
            placeholder="Сообщение..."
            onPaste={(e) => {
              if (e.clipboardData && e.clipboardData.types.includes("Files")) {
                const fileFromBuffer = e.clipboardData.files[0];
                if (fileFromBuffer.type.startsWith("image/")) {
                  setFileFromBuffer(fileFromBuffer);
                  setIsLoadImage(fileFromBuffer.name);
                }
              }
            }}
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
        )}

        <nav className={style["textarea__nav"]}>
          <button
            className={style["textarea__button"]}
            ref={buttonVoiceMessageRef}
            onClick={(e) => {
              recordingVoiceMessage();
            }}
          >
            {isRecordingVoiceMessage ? (
              <img data-modif="nongray" src={MicrophoneStopIcon} title="Отмена записи" />
            ) : (
              <img src={MicrophoneIcon} title="Голосовое сообщение" />
            )}
          </button>
          <button
            className={style["textarea__button"]}
            title="Прикрепить файл"
            onClick={() => {
              if (isLoadImage) {
                setFileFromBuffer(null);
                setIsLoadImage(false);
              } else {
                document.getElementById("textarea-inputFile").click();
              }
            }}
          >
            {isLoadImage ? (
              <div className={style["textarea__fileStatus"]} title="Файл готов, отменить?"></div>
            ) : (
              <img src={AddIcon} alt="" />
            )}
          </button>
          <input
            onChange={(e) => {
              if (e.target.files.length) {
                setIsLoadImage(e.target.files[0].name);
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
            <img src={EmojiIcon} alt="" />
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
              if (isRecordingVoiceMessage) {
                sendRecordingVoiceMessage();
              } else {
                sendMessage();
              }
            }}
          >
            <img data-modif={isRecordingVoiceMessage ? "nongray" : ""} src={SendIcon} alt="" />
          </button>
        </nav>
      </section>
    </div>
  );
}
