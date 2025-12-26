import React from "react";
import style from "./Сonference.module.scss";
import "./Conference.scss";

import CallUpIcon from "../../assets/icons/CallUp.svg";
import CallDownIcon from "../../assets/icons/CallDown.svg";

import MicrophoneDisabledIcon from "../../assets/icons/MicrophoneDisabled.svg";
import MicrophoneEnabledIcon from "../../assets/icons/MicrophoneEnabled.svg";

import CameraDisabledIcon from "../../assets/icons/CameraDisabled.svg";
import CameraEnabledIcon from "../../assets/icons/CameraEnabled.svg";

import UserIcon from "../../assets/icons/User.svg";

export default function СonferencePresentation({ ...props }) {
  return (
    <div className={style["wrapper-conference"]}>
      <div className={style["conference__grid"]}>
        <section className={style["conference__companion"]}>
          <h2 ref={props.indicatorNameFriendRef} id="conference__indicator-name_friend">
            {props.friendForCall ? props.friendForCall.UserName : ""}
          </h2>
          <div id="conference__indicator-friend" className={style["conference__video"]} ref={props.friendVideoIndicatorRef}>
            <video poster={UserIcon} ref={props.friendVideoPlayerRef}></video>
          </div>
        </section>

        {/* <div ref={props.myVoiceIndicatorRef} id="conference__indicator" className={style["conference__indicator"]}></div> */}

        <section className={style["conference__companion"]}>
          <h2 ref={props.indicatorNameMeRef} id="conference__indicator-name_me">
            {props.currentUser.UserName}
          </h2>
          <div className={style["conference__video"]}>
            <video poster={UserIcon} ref={props.myVideoIndicatorRef}></video>
          </div>
        </section>
      </div>

      <p ref={props.myFriendStatusRef} className={style["conference__status"]}></p>

      {props.iceServers.length ? (
      // {true ? (
        <nav className={style["conference__menu"]}>
          <div className={style["conference__menu_item"]}>
            <button
              title={props.isMicrophoneEnabled ? "Микрофон работает" : "Микрофон отключен"}
              onClick={() => {
                if (props.isMicrophoneEnabled) {
                  props.disableMicrophone();
                } else {
                  props.enableMicrophone();
                }
              }}
            >
              <img src={props.isMicrophoneEnabled ? MicrophoneEnabledIcon : MicrophoneDisabledIcon} alt="" />
            </button>
            {props.audioDevices.length ? (
              <select>
                {props.audioDevices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label}
                  </option>
                ))}
              </select>
            ) : (
              ""
            )}
          </div>

          <div className={style["conference__menu_item"]}>
            <button
              title={props.isVideoEnabled ? "Камера работает" : "Камера отключена"}
              onClick={() => {
                if (props.isVideoEnabled) {
                  props.disableCamera();
                } else {
                  props.enableCamera();
                }
              }}
            >
              <img src={props.isVideoEnabled ? CameraEnabledIcon : CameraDisabledIcon} alt="" />
            </button>
            {props.videoDevices.length ? (
              <select
                onChange={(e) => {
                  props.switchSource("video", e.target.value);
                }}
              >
                {props.videoDevices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label}
                  </option>
                ))}
              </select>
            ) : (
              ""
            )}
          </div>

          <div className={style["conference__menu_item"]}>
            <button
              title={props.isConnected ? "Отключиться" : "Подключиться к звонку"}
              onClick={() => {
                if (props.isConnected) {
                  props.finishConference();
                } else {
                  props.runConference();
                }
              }}
            >
              <img src={props.isConnected ? CallDownIcon : CallUpIcon} alt="" />
            </button>
          </div>
        </nav>
      ) : (
        <p className={style["conference__status"]}>Устанавливаем RTC-соединение... </p>
      )}
    </div>
  );
}
