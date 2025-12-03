import React from "react";
import style from "./Сonference.module.scss";

export default function СonferencePresentation({ ...props }) {
  return (
    <div className={style["wrapper-conference"]}>
      <div className={style["conference__participants"]}>
        {props.participants.length
          ? props.participants.map((participant) => {
              return <article key={participant.UserLogin}>{participant.UserName}</article>;
            })
          : "Участников нет"}
      </div>

      <div className={style["conference__indicator"]} ref={props.myVoiceIndicatorRef}></div>
      <audio id="voicePlayer" ref={props.audioPlayerRef}></audio>
      <nav className={style["conference__menu"]}>
        <div>
          <p>Вы {props.isConnected ? "подключены" : "отключены"}</p>
          <button
            onClick={() => {
              if (props.isConnected) {
                props.finishConference();
              } else {
                props.startConference();
              }
            }}
          >
            {props.isConnected ? "Отключиться?" : "Подключиться?"}
          </button>
        </div>
        <div>
          <p>{props.isMicrophoneEnabled ? "Вас слышно!" : "Вас не слышно"}</p>
          <button
            onClick={() => {
              if (props.isMicrophoneEnabled) {
                props.disableMicrophone();
              } else {
                props.enableMicrophone();
              }
            }}
          >
            {props.isMicrophoneEnabled ? "Отключить?" : "Исправить?"}
          </button>
        </div>
      </nav>
    </div>
  );
}
