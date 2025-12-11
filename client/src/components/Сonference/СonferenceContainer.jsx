import React, { useEffect, useRef, useState } from "react";
import СonferencePresentation from "./СonferencePresentation";
import { useLocation, useNavigate } from "react-router-dom";

export default function СonferenceContainer({ socketApi, currentUser, friendForCall, setFriendForCall }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [isConnected, setIsConnected] = useState(false);
  const [isMicrophoneEnabled, setIsMicrophoneEnabled] = useState(false);

  const [roomInfo, setRoomInfo] = useState(null);

  const [remoteStream, setRemoteStream] = useState(null);
  const [localStream, setLocalStream] = useState(null);

  const myVoiceIndicatorRef = useRef(null);
  const myFriendIndicatorRef = useRef(null);
  const audioPlayerRef = useRef(null);
  const analyserTimerRef = useRef(null);
  const pc = useRef(null);

  // ДОБАВИТЬ ИНДИКАТОР ПОДКЛЮЧЕНИЯ СОБЕСЕДНИКА

  const iceServers = [
    { urls: "stun:stun.l.google.com:19302" },
    // { urls: "turn:your.turn.server:3478", username: "user", credential: "password" },
  ];

  useEffect(() => {
    console.log("Rendering...");

    if (!friendForCall) {
      if (location.state && "friendForCall" in location.state) {
        setFriendForCall(location.state.friendForCall);
      } else {
        navigate("/main/");
      }
    }

    if (!socketApi || !friendForCall) return;

    socketApi.emit("JOIN_ROOM", { initiatorLogin: currentUser.UserLogin, friendLogin: friendForCall.UserLogin });
    socketApi.on("JOIN_ROOM", (roomInfo) => {
      setRoomInfo(roomInfo);
      if (roomInfo.find((user) => user.UserLogin == friendForCall.UserLogin)?.inCall) {
        myFriendIndicatorRef.current.title = "Подключен";
        myFriendIndicatorRef.current.classList.add("ready");
      }
    });

    // pc.current = new RTCPeerConnection(iceServers);

    socketApi.on("LEAVE_ROOM", userLeft);
    socketApi.on("LEAVE_CALL", userLeft);

    function userLeft(socketInfo) {
      console.log(socketInfo);

      myFriendIndicatorRef.current.title = "Не подключен";
      myFriendIndicatorRef.current.classList.remove("waiting");
      myFriendIndicatorRef.current.classList.remove("ready");
    }

    initializationRTC();

    // socketApi.on("ICE_CANDIDATE", async (candidate) => {
    //   try {
    //     console.log("ICE_CANDIDATE");
    //     myFriendIndicatorRef.current.classList.add("ready");
    //     const iceCandidate = new RTCIceCandidate(JSON.parse(candidate));
    //     await pc.current.addIceCandidate(iceCandidate);
    //   } catch (error) {
    //     console.warn(error);
    //   }
    // });

    // pc.current.addEventListener("icecandidate", (event) => {
    //   try {
    //     console.log("Кандидаты маршрута для Peer Connection получены!");
    //     if (event.candidate) {
    //       socketApi.emit("ICE_CANDIDATE", JSON.stringify(event.candidate));
    //     }
    //   } catch (error) {
    //     console.warn(error);
    //   }
    // });

    // pc.current.addEventListener("track", (event) => {
    //   if (event.streams && event.streams[0]) {
    //     console.log(event);

    //     myFriendIndicatorRef.current.classList.remove("waiting");
    //     myFriendIndicatorRef.current.classList.add("ready");
    //     myFriendIndicatorRef.current.title = "Подключен";

    //     setRemoteStream(event.streams[0]);

    //     audioPlayerRef.current = new Audio();
    //     audioPlayerRef.current.srcObject = event.streams[0];
    //     audioPlayerRef.current.muted = false;
    //     console.log("Пробую воспроизвести голос собеседника...");
    //     audioPlayerRef.current
    //       .play()
    //       .then(() => {
    //         document.addEventListener(
    //           "click",
    //           () => {
    //             audioPlayerRef.current.play().catch((e) => console.error("Все еще ошибка:", e));
    //           },
    //           { once: true }
    //         );
    //         console.log("Воспроизведение работает");
    //       })
    //       .catch((err) => {
    //         console.error("Воспроизведение не работает:", err);
    //       });
    //   }
    // });

    return () => {
      pc.current?.close();
      setFriendForCall(null);
      finishConference();
      socketApi.emit("LEAVE_ROOM", { UserLogin: currentUser.UserLogin });
    };
  }, [socketApi, friendForCall, pc]);

  const initializationRTC = () => {
    console.log("Первичная инициализация RTC-соединения...");

    pc.current = new RTCPeerConnection(iceServers);

    socketApi.on("ICE_CANDIDATE", async (candidate) => {
      try {
        console.log("ICE_CANDIDATE");
        myFriendIndicatorRef.current.classList.add("ready");
        const iceCandidate = new RTCIceCandidate(JSON.parse(candidate));
        await pc.current.addIceCandidate(iceCandidate);
      } catch (error) {
        console.warn(error);
      }
    });

    pc.current.addEventListener("icecandidate", icecandidateHandler);
    pc.current.addEventListener("track", trackHandler);
  };
  function icecandidateHandler(event) {
    try {
      console.log("Кандидаты маршрута для Peer Connection получены!");
      if (event.candidate) {
        socketApi.emit("ICE_CANDIDATE", JSON.stringify(event.candidate));
      }
    } catch (error) {
      console.warn(error);
    }
  }
  function trackHandler(event) {
    if (event.streams && event.streams[0]) {
      console.log(event);

      myFriendIndicatorRef.current.classList.remove("waiting");
      myFriendIndicatorRef.current.classList.add("ready");
      myFriendIndicatorRef.current.title = "Подключен";

      setRemoteStream(event.streams[0]);

      audioPlayerRef.current = new Audio();
      audioPlayerRef.current.srcObject = event.streams[0];
      audioPlayerRef.current.muted = false;
      console.log("Пробую воспроизвести голос собеседника...");
      audioPlayerRef.current
        .play()
        .then(() => {
          document.addEventListener(
            "click",
            () => {
              audioPlayerRef.current.play().catch((e) => console.error("Все еще ошибка:", e));
            },
            { once: true }
          );
          console.log("Воспроизведение работает");
        })
        .catch((err) => {
          console.error("Воспроизведение не работает:", err);
        });
    }
  }

  const startConference = async () => {
    try {
      if (!pc.current && !isConnected) {
        console.error("PeerConnection не инициализирован");
        initializationRTC();
      }

      console.log(pc.current.signalingState);

      // Нужен, если другой начинает общение
      socketApi.on("OFFER", async (offer) => {
        console.log("OFFER");
        offer = JSON.parse(offer);

        await pc.current.setRemoteDescription(new RTCSessionDescription(offer));

        const answer = await pc.current.createAnswer();

        await pc.current.setLocalDescription(answer);

        myFriendIndicatorRef.current.classList.remove("waiting");
        socketApi.emit("ANSWER", JSON.stringify(answer));
      });
      // Нужен, если я начинаю общение
      socketApi.on("ANSWER", async (answer) => {
        try {
          const desc = new RTCSessionDescription(JSON.parse(answer));
          await pc.current.setRemoteDescription(desc);
          myFriendIndicatorRef.current.classList.remove("waiting");
          console.log("Удалённое описание установлено!");
        } catch (err) {
          console.warn("Ошибка при установке удалённой SDP:", err);
        }
      });

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
        },
        video: false,
      });
      setLocalStream(stream);

      stream.getAudioTracks().forEach((track) => {
        track.enabled = false;
        pc.current.addTrack(track, stream);
      });

      const offer = await pc.current.createOffer({
        mandatory: {
          offerToReceiveAudio: true,
          offerToReceiveVideo: false,
        },
      });

      offer.friendLogin = friendForCall.UserLogin;
      offer.initiatorLogin = currentUser.UserLogin;

      await pc.current.setLocalDescription(offer);

      if (remoteStream) {
        console.log(remoteStream);

        remoteStream.getTracks()?.forEach((track) => track.play());
      }

      socketApi.emit("OFFER", JSON.stringify(offer));
      myFriendIndicatorRef.current.classList.add("waiting");
      setIsConnected(true);
    } catch (error) {
      console.log(error);
    }
  };

  const finishConference = async () => {
    console.log("Отключение конференции...");

    if (pc.current && remoteStream) {
      socketApi.off("ICE_CANDIDATE");
      pc.current.removeEventListener("icecandidate", icecandidateHandler);
      pc.current.removeEventListener("track", trackHandler);
      remoteStream.getTracks().forEach((track) => track.stop());
      console.log("Очистка...");
      pc.current.close();
      pc.current = null;
    }
    clearInterval(analyserTimerRef.current);
    setIsConnected(false);
    setRemoteStream(null);
    setLocalStream(null);
    disableMicrophone();

    myFriendIndicatorRef.current?.classList.remove("waiting");
    console.log("Конференция отключена");
    socketApi.emit("LEAVE_CALL");
  };

  const enableMicrophone = async () => {
    try {
      if (!pc.current || !isConnected) {
        console.warn("Необходимо подключиться к конференции...");
        return;
      }
      console.log("Микрофон включается...");
      myVoiceIndicatorRef.current.classList.add("loader_1");

      const senders = pc.current.getSenders();
      const audioSenders = senders.filter((sender) => sender.track && sender.track.kind === "audio");

      audioSenders.forEach((sender) => {
        if (sender.track) {
          sender.track.enabled = true;
          console.log("Аудио трек включен");
        }
      });

      let audioCtx = null;
      let analyser = null;
      let frequencyArray = [];

      try {
        audioCtx = new window.AudioContext();
        const sourceNode = audioCtx.createMediaStreamSource(localStream);
        analyser = audioCtx.createAnalyser();

        console.log(localStream);

        analyser.minDecibels = -100;
        analyser.maxDecibels = 0;
        analyser.smoothingTimeConstant = 0;

        sourceNode.connect(analyser);
        frequencyArray = new Uint8Array(analyser.frequencyBinCount);
        setIsMicrophoneEnabled(true);

        analyserTimerRef.current = setInterval(() => {
          analyser.getByteFrequencyData(frequencyArray);
          let totalVolume = 0;
          analyser.getByteFrequencyData(frequencyArray);
          for (let i = 0; i < frequencyArray.length; i++) {
            totalVolume += frequencyArray[i];
          }
          const currentVolume = (totalVolume / frequencyArray.length / 10) * 0.5 + 0.6;
          myVoiceIndicatorRef.current.style.cssText = `box-shadow: 0 0 ${10 * currentVolume}px yellow`;
        }, 100);
      } catch (error) {
        console.log(error);
        console.warn("Возможны сбои анализатора голоса в данной версии браузера.");
      }
    } catch (error) {
      clearInterval(analyserTimerRef.current);
      setIsMicrophoneEnabled(false);
      console.log(error);
    }
  };

  const disableMicrophone = () => {
    try {
      console.log("Микрофон отключается...");
      

      if (!pc.current || !isConnected) return;

      const senders = pc.current.getSenders();
      const audioSenders = senders.filter((sender) => sender.track && sender.track.kind === "audio");

      audioSenders.forEach((sender) => {
        if (sender.track) {
          sender.track.enabled = false;
          console.log("Аудио трек отключен");
        }
      });

      myVoiceIndicatorRef.current?.classList.remove("loader_1");
      myVoiceIndicatorRef.current.style.cssText = `box-shadow: none;`;
      clearInterval(analyserTimerRef.current);
      setIsMicrophoneEnabled(false);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <СonferencePresentation
      startConference={startConference}
      finishConference={finishConference}
      disableMicrophone={disableMicrophone}
      enableMicrophone={enableMicrophone}
      friendForCall={friendForCall}
      myVoiceIndicatorRef={myVoiceIndicatorRef}
      myFriendIndicatorRef={myFriendIndicatorRef}
      isConnected={isConnected}
      isMicrophoneEnabled={isMicrophoneEnabled}
      remoteStream={remoteStream}
    ></СonferencePresentation>
  );
}
