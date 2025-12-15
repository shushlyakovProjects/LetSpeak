import { useEffect, useRef, useState } from "react";
import СonferencePresentation from "./СonferencePresentation";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

export default function СonferenceContainer({ socketApi, currentUser, friendForCall, setFriendForCall }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [isConnected, setIsConnected] = useState(false);
  const [isMicrophoneEnabled, setIsMicrophoneEnabled] = useState(false);

  const [roomInfo, setRoomInfo] = useState(null);

  const [remoteStream, setRemoteStream] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [iceServers, setIceServers] = useState([]);

  const myVoiceIndicatorRef = useRef(null);
  const myFriendIndicatorRef = useRef(null);
  const myFriendStatusRef = useRef(null);

  const analyserMyTimerRef = useRef(null);
  const analyserFriendsTimerRef = useRef(null);

  const pc = useRef(null);

  const publicIceServers = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun.stunprotocol.org:3478" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
    { urls: "stun:stun.qq.com:3478" },
    { urls: "stun:stun.miwifi.com:3478" },
  ];

  useEffect(() => {
    // console.log("Rendering...");

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
      changeStatusIndicators(roomInfo);
    });
    socketApi.on("LEAVE_ROOM", changeStatusIndicators);
    socketApi.on("LEAVE_CALL", changeStatusIndicators);
    socketApi.on("JOIN_CALL", changeStatusIndicators);

    initializationRTC();

    return () => {
      pc.current?.close();
      setFriendForCall(null);
      finishConference();
      socketApi.emit("LEAVE_ROOM", { UserLogin: currentUser.UserLogin });
    };
  }, [socketApi, friendForCall, pc]);

  async function getWebRTCConfig() {
    return axios
      .get("/api/getRTCconfig")
      .then((result) => {
        console.log("TURN конфигурация получена...");
        return [...publicIceServers, result.data];
      })
      .catch((error) => {
        console.warn("Не удалось получить TURN конфигурацию");
        return [...publicIceServers];
      });
  }

  const initializationRTC = async () => {
    console.log("Первичная инициализация RTC-соединения...");

    let ice = null;
    if (!iceServers.length) {
      ice = await getWebRTCConfig();
      setIceServers(ice);
    } else {
      ice = iceServers;
    }

    pc.current = new RTCPeerConnection({ iceServers: ice });

    socketApi.on("ICE_CANDIDATE", async (candidate) => {
      try {
        candidate = JSON.parse(candidate);
        console.log("ICE_CANDIDATE");
        const iceCandidate = new RTCIceCandidate(candidate);
        await pc.current.addIceCandidate(iceCandidate);
      } catch (error) {
        console.warn(error);
      }
    });

    pc.current.addEventListener("icecandidateerror", (event) => {
      console.error("ICE кандидат ошибка:", event.errorCode, event.errorText);
    });

    pc.current.addEventListener("icecandidate", icecandidateHandler);
    pc.current.addEventListener("track", trackHandler);
  };
  function icecandidateHandler(event) {
    try {
      console.log("Кандидаты маршрута для Peer Connection получены!");
      if (event.candidate) {
        // console.log("Кандидат:", event.candidate.type, event.candidate.protocol, event.candidate.address);
        socketApi.emit("ICE_CANDIDATE", JSON.stringify(event.candidate));
      }
    } catch (error) {
      console.warn(error);
    }
  }
  function trackHandler(event) {
    if (event.streams && event.streams[0]) {
      console.log(event);

      // status

      setRemoteStream(event.streams[0]);
      analizeVolumeVoice(event.streams[0], "friend");

      const audioPlayer = new Audio();
      audioPlayer.srcObject = event.streams[0];
      audioPlayer.muted = false;
      console.log("Пробую воспроизвести голос собеседника...");
      audioPlayer
        .play()
        .then(() => {
          document.addEventListener(
            "click",
            () => {
              audioPlayer.play().catch((e) => console.error("Все еще ошибка:", e));
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

      // Нужен, если другой начинает общение
      socketApi.on("OFFER", async (offer) => {
        console.log("OFFER");
        offer = JSON.parse(offer);

        try {
          await pc.current.setRemoteDescription(new RTCSessionDescription(offer));

          const answer = await pc.current.createAnswer();

          await pc.current.setLocalDescription(answer);

          socketApi.emit("ANSWER", JSON.stringify(answer));
        } catch (error) {
          console.warn(error);
        }
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
        remoteStream.getTracks()?.forEach((track) => track.play());
      }

      socketApi.emit("OFFER", JSON.stringify(offer));
      socketApi.emit("JOIN_CALL");
      setIsConnected(true);
    } catch (error) {
      console.log(error);
      changeStatusIndicators(roomInfo);
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

    // status
    clearInterval(analyserMyTimerRef.current);
    clearInterval(analyserFriendsTimerRef.current);
    setIsConnected(false);
    setRemoteStream(null);
    setLocalStream(null);
    disableMicrophone();

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
      // status

      const senders = pc.current.getSenders();
      const audioSenders = senders.filter((sender) => sender.track && sender.track.kind === "audio");

      audioSenders.forEach((sender) => {
        if (sender.track) {
          sender.track.enabled = true;
          console.log("Аудио трек включен");
        }
      });

      analizeVolumeVoice(localStream, "me");
      setIsMicrophoneEnabled(true);
    } catch (error) {
      clearInterval(analyserMyTimerRef.current);
      setIsMicrophoneEnabled(false);
      console.log(error);
    }
  };

  const analizeVolumeVoice = (stream, whoIsTalk) => {
    let audioCtx = null;
    let analyser = null;
    let frequencyArray = [];
    try {
      audioCtx = new window.AudioContext();
      const sourceNode = audioCtx.createMediaStreamSource(stream);
      analyser = audioCtx.createAnalyser();

      analyser.minDecibels = -100;
      analyser.maxDecibels = 10;
      analyser.smoothingTimeConstant = 0;

      sourceNode.connect(analyser);
      frequencyArray = new Uint8Array(analyser.frequencyBinCount);

      if (whoIsTalk == "me") {
        analyserMyTimerRef.current = setInterval(timerHandler, 100);
      }
      if (whoIsTalk == "friend") {
        analyserFriendsTimerRef.current = setInterval(timerHandler, 100);
      }

      function timerHandler() {
        analyser.getByteFrequencyData(frequencyArray);
        let totalVolume = 0;
        analyser.getByteFrequencyData(frequencyArray);
        for (let i = 0; i < frequencyArray.length; i++) {
          totalVolume += frequencyArray[i];
        }
        const currentVolume = (totalVolume / frequencyArray.length / 10) * 0.8 + 0.6;

        if (whoIsTalk == "me") {
          myVoiceIndicatorRef.current.style.cssText = `box-shadow: 0 0 ${10 * currentVolume}px yellow`;
        }
        if (whoIsTalk == "friend") {
          myFriendIndicatorRef.current.style.cssText = `box-shadow: 0 0 ${10 * currentVolume}px yellow`;
        }
      }
    } catch (error) {
      console.log(error);
      console.warn("Возможны сбои анализатора голоса в данной версии браузера.");
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

      clearInterval(analyserMyTimerRef.current);
      setIsMicrophoneEnabled(false);
      myVoiceIndicatorRef.current.style.cssText = `box-shadow: none;`;
    } catch (error) {
      console.log(error);
    }
  };

  const changeStatusIndicators = (roomInfo) => {
    // iAmWaiting - ожидаю ответа собеседника
    // itIsWaiting - собеседник ждет меня
    // bothAreReady - оба готовы

    try {
      if (!myVoiceIndicatorRef.current || !myFriendIndicatorRef.current) {
        throw new Error("Индикаторы размонтированы");
      }

      const me = roomInfo.find((user) => user?.UserLogin == currentUser.UserLogin)?.inCall;
      const friend = roomInfo.find((user) => user?.UserLogin == friendForCall.UserLogin)?.inCall;

      if (!me && !friend) {
        console.log("Никого нет в звонке");
        clearInterval(analyserFriendsTimerRef.current);
        myFriendStatusRef.current.innerText = "";
        myVoiceIndicatorRef.current.style.cssText = `box-shadow: none;`;
        myFriendIndicatorRef.current.style.cssText = `box-shadow: none;`;
        myFriendIndicatorRef.current.classList.remove("iAmWaiting", "itIsWaiting", "bothAreReady");
        myVoiceIndicatorRef.current.classList.remove("iAmWaiting");
      }

      if (me && !friend) {
        console.log("Я в звонке, собеседник - нет");
        clearInterval(analyserFriendsTimerRef.current);
        myFriendStatusRef.current.innerText = "Ожидаем ответа...";
        myFriendIndicatorRef.current.style.cssText = `box-shadow: none;`;
        myFriendIndicatorRef.current.classList.remove("itIsWaiting", "bothAreReady");
        myFriendIndicatorRef.current.classList.add("iAmWaiting");
        myVoiceIndicatorRef.current.classList.add("iAmWaiting");
      }

      if (!me && friend) {
        console.log("Собеседник в звонке, я - нет");
        myFriendStatusRef.current.innerText = "Вам звонит";
        myFriendIndicatorRef.current.style.cssText = `box-shadow: none;`;
        myFriendIndicatorRef.current.classList.remove("iAmWaiting", "bothAreReady");
        myFriendIndicatorRef.current.classList.add("itIsWaiting");
        myVoiceIndicatorRef.current.classList.remove("iAmWaiting");
      }

      if (me && friend) {
        console.log("Оба в звонке");
        myFriendStatusRef.current.innerText = "Ваш собеседник:";
        myFriendIndicatorRef.current.classList.remove("iAmWaiting", "itIsWaiting");
        myFriendIndicatorRef.current.classList.add("bothAreReady");
        myVoiceIndicatorRef.current.classList.add("iAmWaiting");
      }
    } catch (error) {
      console.warn(error);
    }
  };

  return (
    <СonferencePresentation
      iceServers={iceServers}
      startConference={startConference}
      finishConference={finishConference}
      disableMicrophone={disableMicrophone}
      enableMicrophone={enableMicrophone}
      friendForCall={friendForCall}
      myVoiceIndicatorRef={myVoiceIndicatorRef}
      myFriendIndicatorRef={myFriendIndicatorRef}
      myFriendStatusRef={myFriendStatusRef}
      isConnected={isConnected}
      isMicrophoneEnabled={isMicrophoneEnabled}
      remoteStream={remoteStream}
    ></СonferencePresentation>
  );
}
