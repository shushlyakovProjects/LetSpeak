import React, { memo } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useRef } from "react";
import style from "../Chats.module.scss";

import PlayIcon from "../../../assets/icons/Send.svg";
import PauseIcon from "../../../assets/icons/Pause.svg";

export default memo(function MessageVoice({ urlServer, MessageVoiceContent, MessageId }) {
  const audioRef = useRef(null);
  const [duration, setDuration] = useState(null);
  const [currentValue, setCurrentValue] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  function setCurrentTime(currentValuePerc) {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = (duration / 100) * currentValuePerc;
      setCurrentValue(currentValuePerc);
    }
  }

  function formDate(timeInSec) {
    timeInSec = Math.floor(+timeInSec);
    let mins = Math.floor(timeInSec / 60);
    let sec = Math.floor(timeInSec % 60);
    sec = sec < 10 ? "0" + sec : sec;
    return `${mins == Infinity || mins != mins ? "0" : mins}:${sec == Infinity || sec != sec ? "0" : sec}`;
  }

  useEffect(() => {
    let timer;
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener("loadedmetadata", () => {
        setDuration(audio.duration.toFixed(2));
      });
      audio.addEventListener("play", (e) => {
        let messagesList = document.querySelectorAll("#messagesList audio");
        Array.from(messagesList).forEach((voiceMessage) => {
          if (voiceMessage.getAttribute("voice-id") != MessageId) {
            voiceMessage.pause();
          }
        });

        setIsPlaying(true);
        timer = setInterval(() => {
          const currentProgress = Math.round((audio.currentTime / audio.duration) * 100);
          setCurrentValue(currentProgress);
        }, 100);
      });
      audio.addEventListener("ended", () => {
        setIsPlaying(false);
        clearInterval(timer);
      });
      audio.addEventListener("pause", () => {
        setIsPlaying(false);
        clearInterval(timer);
      });
    }
  }, []);

  return (
    <>
      <nav className={style["voice_message"]}>
        {isPlaying ? (
          <button
            className={style["voice_message__pause"]}
            onClick={(e) => {
              e.target.closest("button").parentNode.nextSibling.pause();
            }}
          >
            <img src={PauseIcon} alt="Пауза" />
          </button>
        ) : (
          <button
            className={style["voice_message__play"]}
            onClick={(e) => {
              e.target.closest("button").parentNode.nextSibling.play();
            }}
          >
            <img src={PlayIcon} alt="Прослушать" />
          </button>
        )}

        <input
          className={style["voice_message__track"]}
          type="range"
          min="0"
          max="100"
          step="1"
          value={currentValue}
          onInput={(e) => {
            setCurrentTime(e.target.value, true);
          }}
          onMouseDown={(e) => {
            audioRef.current.pause();
          }}
          onTouchStart={() => {
            audioRef.current.pause();
          }}
          onMouseUp={(e) => {
            audioRef.current.play();
          }}
          onTouchEnd={() => {
            audioRef.current.play();
          }}
        />
        <span className={style["voice_message__duration"]}>
          {formDate((duration / 100) * currentValue)} / {formDate(duration)}
        </span>
      </nav>

      <audio voice-id={MessageId} src={urlServer + MessageVoiceContent} ref={audioRef} preload="metadata" />
    </>
  );
});
