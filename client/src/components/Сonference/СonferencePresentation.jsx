import React from "react";
import style from "./Сonference.module.scss";
import "./Conference.scss"

export default function СonferencePresentation({ ...props }) {
  return (
    <div className={style["wrapper-conference"]}>
      <div className={style["conference__friend"]}>
        <p>Ваш собеседник:</p>
        <h2 ref={props.myFriendIndicatorRef} title="Не подключен">{props.friendForCall ? props.friendForCall.UserName : ''}</h2>
      </div>

      <div className={style["conference__indicator"]} ref={props.myVoiceIndicatorRef}></div>

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
          <p>{props.isMicrophoneEnabled ? "Микрофон включен!" : "Микрофон выключен"}</p>
          <button
            onClick={() => {
              if (props.isMicrophoneEnabled) {
                props.disableMicrophone();
              } else {
                props.enableMicrophone();
              }
            }}
          >
            {props.isMicrophoneEnabled ? "Выключить?" : "Включить?"}
          </button>
        </div>
      </nav>
    </div>
  );
}
