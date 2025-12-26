import { useEffect, useRef, useState } from "react";
import СonferencePresentation from "./СonferencePresentation";
import { data, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

export default function СonferenceContainer({
  createNotification,
  socketApi,
  currentUser,
  friendForCall,
  setFriendForCall,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const [isConnected, setIsConnected] = useState(false);
  const [iceServers, setIceServers] = useState([]);
  const [roomInfo, setRoomInfo] = useState(null);

  const remoteStream = useRef(null);

  const [isMicrophoneEnabled, setIsMicrophoneEnabled] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);

  const [preferredVideoDeviceID, setPreferredVideoDeviceID] = useState();
  const [videoDevices, setVideoDevices] = useState([]);
  const [audioDevices, setAudioDevices] = useState([]);

  const isConferenceReadyRef = useRef(false);

  const localAudioStreamRef = useRef(null);
  const localVideoStreamRef = useRef(null);

  const myVideoIndicatorRef = useRef(null);
  const friendVideoIndicatorRef = useRef(null);
  const friendVideoPlayerRef = useRef(null);
  const myFriendStatusRef = useRef(null);
  const microphoneStatusForFriendRef = useRef(null);

  const analyserMyTimerRef = useRef(null);
  const analyserFriendsTimerRef = useRef(null);

  const indicatorNameFriendRef = useRef(null);
  const indicatorNameMeRef = useRef(null);

  const pc = useRef(null);
  const dc = useRef(null);

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

    navigator.mediaDevices.enumerateDevices().then((devices) => {
      setVideoDevices(devices.filter((device) => device.kind === "videoinput"));
      setAudioDevices(devices.filter((device) => device.kind === "audioinput"));
    });

    socketApi.emit("JOIN_ROOM", { initiatorLogin: currentUser.UserLogin, friendLogin: friendForCall.UserLogin });

    socketApi.on("JOIN_ROOM", (roomInfo) => {
      setRoomInfo(roomInfo);
      changeStatusIndicators(roomInfo);
    });
    socketApi.on("LEAVE_ROOM", (roomInfo) => {
      console.log("🚷 Собеседник покинул комнату");
      friendVideoPlayerRef.current.srcObject = null;
      changeStatusIndicators(roomInfo);
    });
    socketApi.on("LEAVE_CALL", (roomInfo) => {
      // friendDisconneted();
      changeStatusIndicators(roomInfo);
    });
    socketApi.on("JOIN_CALL", async (roomInfo) => {
      console.log("JOIN_CALL");
      console.log("Друг снова пришел. Мы были в звонке?", isConferenceReadyRef.current);

      if (isConferenceReadyRef.current) await runConference();
      changeStatusIndicators(roomInfo);
    });

    initializationRTC();

    return () => {
      finishConference();
      socketApi.emit("LEAVE_CALL");
      socketApi.emit("LEAVE_ROOM", { UserLogin: currentUser.UserLogin });
    };
  }, [socketApi, friendForCall, pc]);

  useEffect(() => {
    microphoneStatusForFriendRef.current = isMicrophoneEnabled;
  }, [isMicrophoneEnabled]);

  async function getWebRTCConfig() {
    // return [...publicIceServers];
    return axios
      .get("/api/getRTCconfig")
      .then((result) => {
        console.log("🛜 TURN конфигурация получена!");
        return [...publicIceServers, result.data];
      })
      .catch((error) => {
        console.warn("🛜 Не удалось получить TURN конфигурацию");
        return [...publicIceServers];
      });
  }

  // ИНИЦИАЛИЗАЦИЯ RTC СОЕДИНЕНИЯ
  const initializationRTC = async () => {
    console.log("🛰️ Первичная инициализация RTC-соединения...");

    let ice = [];
    if (!iceServers.length) {
      ice = await getWebRTCConfig();
      setIceServers(ice);
    } else {
      ice = iceServers;
    }

    pc.current = new RTCPeerConnection({ iceServers: ice });
    await initializationDataChannel();

    socketApi.on("ICE_CANDIDATE", async (candidate) => {
      try {
        candidate = JSON.parse(candidate);
        // console.log("ICE_CANDIDATE");
        const iceCandidate = new RTCIceCandidate(candidate);
        await pc.current.addIceCandidate(iceCandidate);
      } catch (error) {
        console.warn(error);
      }
    });

    // pc.current.addEventListener("icecandidateerror", (event) => {
    //   console.warn("ICE кандидат ошибка:", event.errorCode, event.errorText);
    // });

    pc.current.oniceconnectionstatechange = () => {
      const state = pc.current.iceConnectionState;
      console.log("🌐 ICE состояние:", state);
      switch (state) {
        case "disconnected":
          if (pc.current) removeRTC();
          break;

        default:
          break;
      }
    };

    // * При отключении от звонка, не всегда отключается микрофон
    // * При подключении не всегда определяется статус микрофона
    // * При подключении к активному звонку, не появляется видео

    pc.current.addEventListener("icecandidate", icecandidateHandler);
    pc.current.addEventListener("track", trackHandler);
  };
  function icecandidateHandler(event) {
    try {
      // console.log("Кандидаты маршрута для Peer Connection получены!");
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
      console.log(event.streams);

      remoteStream.current = event.streams[0];
      analizeVolumeVoice(event.streams[0], "friend");

      const audioPlayer = new Audio();
      audioPlayer.srcObject = event.streams[0];
      audioPlayer.muted = false;
      console.log("🎙️ Пробую воспроизвести голос собеседника...");
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
          console.log("🎙️ Воспроизведение работает");
        })
        .catch((err) => {
          console.error("Воспроизведение не работает:", err);
        });

      console.log("🎥 Пробую воспроизвести видео собеседника...");
      friendVideoPlayerRef.current.srcObject = event.streams[0];
      friendVideoPlayerRef.current.play();
    }
  }
  function removeRTC() {
    console.log("Друг отключился, чистим соединение");
    socketApi.off("OFFER");
    socketApi.off("ANSWER");
    socketApi.off("ICE_CANDIDATE");
    clearInterval(analyserFriendsTimerRef.current);
    if (dc.current) {
      dc.current.close();
      dc.current = null;
      console.warn("❌ DataChanel ЗАКРЫТ");
    }
    if (pc.current) {
      pc.current.close();
      pc.current = null;
      console.warn("❌ PeerConnection ЗАКРЫТ");
    }
  }
  async function initializationDataChannel() {
    dc.current = await pc.current.createDataChannel("metaChat");

    dc.current.onmessage = async (event) => {
      const { type } = JSON.parse(event.data);

      console.log(`📡 DataChannel: metaChat. Message type: ${type}`);

      isConferenceReadyRef.current = true;

      switch (type) {
        case "offer":
          console.log("Offer для обновления потока*");
          const { offer } = JSON.parse(event.data);
          const offerDesc = new RTCSessionDescription(offer);

          console.log("PC: ", pc.current.signalingState);

          await pc.current.setRemoteDescription(offerDesc);

          const newAnsw = await pc.current.createAnswer();
          await pc.current.setLocalDescription(newAnsw);
          dc.current.send(
            JSON.stringify({
              type: "answer",
              answer: newAnsw,
            })
          );
          await pc.current.setRemoteDescription(offerDesc);
          break;
        case "answer":
          console.log("Answer для обновления потока*");
          const { answer } = JSON.parse(event.data);
          await pc.current.setRemoteDescription(new RTCSessionDescription(answer));
          break;
        case "disableCamera":
          console.log("Собеседник отключил камеру*");
          friendVideoPlayerRef.current.srcObject = null;
          break;
        case "enableCamera":
          console.log("Собеседник включил камеру*");
          friendVideoPlayerRef.current.srcObject = remoteStream.current;
          friendVideoPlayerRef.current.play();
          break;
        case "friendIsMuted":
          indicatorNameFriendRef.current.classList.add("muted");
          break;
        case "friendIsUnmuted":
          indicatorNameFriendRef.current.classList.remove("muted");
          break;
        case "friendIsLeft":
          removeRTC();
          break;
        default:
          console.warn("📡 DataChannel: metaChat. Пришло неизвестное сообщение");
          break;
      }
    };

    pc.current.ondatachannel = (event) => {
      const dataChannel = event.channel;
      dc.current = event.channel;
      console.log("📡 Получен DataChannel:", dataChannel.label);

      dataChannel.onopen = async () => {
        console.log("✅ DataChannel открыт на стороне получателя");

        // Проверка аудиопотока, если есть - добавляем в RTC
        if (localVideoStreamRef.current) {
          localVideoStreamRef.current.getVideoTracks().forEach((track) => {
            pc.current.addTrack(track, localVideoStreamRef.current);
            console.log("🎞️ Видео-трек подключен успешно!");
          });
          await renegotiation();
        }

        if (microphoneStatusForFriendRef.current) {
          dc.current.send(
            JSON.stringify({
              type: "friendIsUnmuted",
              name: currentUser.UserLogin,
              isMicrophoneEnabled: microphoneStatusForFriendRef.current,
            })
          );
        } else {
          dc.current.send(
            JSON.stringify({
              type: "friendIsMuted",
              name: currentUser.UserLogin,
              isMicrophoneEnabled: microphoneStatusForFriendRef.current,
            })
          );
        }
      };
    };

    console.log(`📡 DataChannel: metaChat. State: ${dc.current.readyState}`);
  }

  // ОБНОВЛЕНИЕ RTC СОЕДИНЕНИЯ
  const renegotiation = async () => {
    if (!pc.current) return;

    try {
      console.log("🔄 Начинаем renegotiation...");

      console.log("PC: ", pc.current.signalingState);

      // 1. Создаем новый offer
      const offer = await pc.current.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
        iceRestart: true,
      });
      console.log("🔄 Новый offer создан");

      // 2. Устанавливаем как локальное описание
      await pc.current.setLocalDescription(offer);
      console.log("🔄 Локальное описание установлено");

      // 3. Отправляем offer собеседнику через signaling
      if (dc.current?.readyState === "open") {
        dc.current.send(
          JSON.stringify({
            type: "offer",
            offer: pc.current.localDescription,
          })
        );
        console.log("🔄 Offer отправлен собеседнику");
      } else {
        throw new Error("🔄 DataChannel закрыт");
      }
    } catch (error) {
      console.error("🔄 Ошибка renegotiation:", error);
    }
  };

  const runConference = async () => {
    try {
      if (!pc.current) {
        if (!isConferenceReadyRef.current) {
          console.warn("❌ PeerConnection не инициализирован");
        } else {
          console.warn("🔄 PeerConnection инициализируется повторно");
        }
        await initializationRTC();
      }

      console.log("1️⃣ Запуск конференции");

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
          console.log("Удалённое описание установлено!");
        } catch (err) {
          console.warn("Ошибка при установке удалённой SDP:", err);
        }
      });

      if (localAudioStreamRef.current) {
        localAudioStreamRef.current.getAudioTracks().forEach((track) => {
          pc.current.addTrack(track, localAudioStreamRef.current);
        });
      } else {
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 1,
          },
        });
        audioStream.getAudioTracks().forEach((track) => {
          track.enabled = false;
          pc.current.addTrack(track, audioStream);
        });
        localAudioStreamRef.current = audioStream;
      }

      const offer = await pc.current.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
        iceRestart: true,
      });

      offer.friendLogin = friendForCall.UserLogin;
      offer.initiatorLogin = currentUser.UserLogin;

      await pc.current.setLocalDescription(offer);

      socketApi.emit("OFFER", JSON.stringify(offer));

      if (!isConferenceReadyRef.current) {
        console.log("Я присоединяюсь к звонку");
        socketApi.emit("JOIN_CALL");
        setIsConnected(true);
      }
    } catch (error) {
      console.log(error);
      finishConference();
      changeStatusIndicators(roomInfo);
    }
  };

  // ЗАВЕРШЕНИЕ КОНФЕРЕНЦИИ
  const finishConference = async () => {
    console.log("0️⃣ Завершение конференции...");

    try {
      if (isVideoEnabled) await disableCamera();
      if (isMicrophoneEnabled) disableMicrophone();
      if (dc.current && dc.current.readyState == "open") {
        dc.current.send(JSON.stringify({ type: "friendIsLeft" }));
      }

      isConferenceReadyRef.current = false;

      socketApi.off("OFFER");
      socketApi.off("ANSWER");
      socketApi.off("ICE_CANDIDATE");

      clearInterval(analyserMyTimerRef.current);
      clearInterval(analyserFriendsTimerRef.current);

      if (friendVideoPlayerRef.current) {
        friendVideoPlayerRef.current.pause();
        friendVideoPlayerRef.current.srcObject = null;
        friendVideoPlayerRef.current.load();
      }

      if (remoteStream.current) {
        remoteStream.current.getTracks().forEach((track) => {
          track.stop();
          track.enabled = false;
        });

        document.querySelectorAll("audio, video").forEach((element) => {
          if (element.srcObject === remoteStream.current) {
            element.srcObject = null;
            element.pause();
          }
        });

        remoteStream.current = null;
      }

      if (dc.current) {
        dc.current.close();
        dc.current = null;
        console.warn("❌ DataChanel ЗАКРЫТ");
      }

      if (pc.current) {
        pc.current.close();
        pc.current = null;
        console.warn("❌ PeerConnection ЗАКРЫТ");
      }

      if (localAudioStreamRef.current) {
        localAudioStreamRef.current.getTracks().forEach((track) => track.stop());
        localAudioStreamRef.current = null;
      }

      localVideoStreamRef.current = null;

      indicatorNameFriendRef.current.classList.remove("muted");
      indicatorNameMeRef.current.classList.remove("muted");

      setIsConnected(false);
      console.warn("🅾️ Конференция отключена");
      socketApi.emit("LEAVE_CALL");
    } catch (error) {
      console.log("Ошибка при завершении конференции", error);
    }
  };

  const enableMicrophone = async () => {
    try {
      if (!isConnected) {
        console.warn("❕Необходимо подключиться к конференции...");
        createNotification("warning", { text: "Необходимо подключиться" });
        throw new Error("❕Необходимо подключиться к конференции...");
      }
      console.log("🎙️ Микрофон включается...");

      const senders = pc.current.getSenders();
      const audioSenders = senders.filter((sender) => sender.track && sender.track.kind === "audio");

      audioSenders.forEach((sender) => {
        if (sender.track) {
          sender.track.enabled = true;
          console.log("🎙️ Аудио трек включен");
        }
      });

      analizeVolumeVoice(localAudioStreamRef.current, "me");
      setIsMicrophoneEnabled(true);
      indicatorNameMeRef.current.classList.remove("muted");

      if (dc.current && dc.current.readyState == "open") {
        dc.current.send(JSON.stringify({ type: "friendIsUnmuted" }));
      }
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

      const sourceNode = audioCtx?.createMediaStreamSource(stream);
      analyser = audioCtx.createAnalyser();

      analyser.minDecibels = -80;
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

        const currentVolume = (totalVolume / frequencyArray.length / 10) * 0.8 + 0.5;

        if (whoIsTalk == "me") {
          myVideoIndicatorRef.current.style.cssText = `box-shadow: 0 0 ${5 * currentVolume}px yellow`;
        }
        if (whoIsTalk == "friend") {
          friendVideoIndicatorRef.current.style.cssText = `box-shadow: 0 0 ${5 * currentVolume}px yellow`;
        }
      }
    } catch (error) {
      console.log(error);
      console.warn("Возможны сбои анализатора голоса в данной версии браузера.");
    }
  };

  const disableMicrophone = () => {
    try {
      console.log("🎙️ Микрофон отключается...");

      if (!pc.current || !isConnected) return;

      clearInterval(analyserMyTimerRef.current);
      setIsMicrophoneEnabled(false);
      indicatorNameMeRef.current.classList.add("muted");
      myVideoIndicatorRef.current.style.cssText = `box-shadow: none;`;
      localAudioStreamRef.current = null;

      const senders = pc.current.getSenders();
      const audioSenders = senders.filter((sender) => sender.track && sender.track.kind === "audio");

      audioSenders.forEach((sender) => {
        if (sender.track) {
          sender.track.enabled = false;
          console.log("🎙️ Аудио трек отключен");
        }
      });

      if (dc.current && dc.current.readyState == "open") {
        dc.current.send(JSON.stringify({ type: "friendIsMuted" }));
      }
    } catch (error) {
      console.log("Ошибка при отключении микрофона", error);
    }
  };

  const enableCamera = async (newDeviceId) => {
    console.log("🎞️ Включение камеры...");

    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: newDeviceId ? newDeviceId : preferredVideoDeviceID },
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
      });

      const newVideoTrack = videoStream.getVideoTracks()[0];
      if (!newVideoTrack) {
        throw new Error("🎞️ Не удалось получить видео-трек из нового потока");
      }

      if (pc.current) {
        const videoSender = pc.current.getSenders().find((s) => s.track?.kind === "video");
        const oldVideoTrack = videoSender?.track;

        if (videoSender) {
          await videoSender.replaceTrack(newVideoTrack);
          console.log("🎞️ Видео-трек заменен успешно!");
          oldVideoTrack.stop();

          videoStream
            .getTracks()
            .filter((track) => track !== newVideoTrack)
            .forEach((track) => track.stop());
        } else {
          videoStream.getVideoTracks().forEach((track) => {
            pc.current.addTrack(track, videoStream);
            console.log("🎞️ Видео-трек подключен успешно!");
          });
        }
      } else {
        console.warn("PeerConnection отсутсвует. Камера переподключена локально...");
      }

      myVideoIndicatorRef.current.srcObject = videoStream;
      myVideoIndicatorRef.current.play();
      localVideoStreamRef.current = videoStream;
      setIsVideoEnabled(true);

      console.log(dc.current);

      if (!dc.current || dc.current.readyState != "open") {
        await initializationDataChannel();
      }

      dc.current.send(JSON.stringify({ type: "enableCamera" }));
      await renegotiation();
    } catch (error) {
      console.error("Ошибка при включении камеры", error);
    }
  };

  const disableCamera = async () => {
    try {
      console.log("🎞️ Камера отключается...");

      if (!isVideoEnabled) {
        throw new Error("Камера уже отключена...");
      }

      if (localVideoStreamRef.current) {
        localVideoStreamRef.current.getVideoTracks().forEach((track) => {
          track.stop();
          track.enabled = false;
        });
      }

      const videoSender = pc.current.getSenders().find((s) => s.track?.kind === "video");

      if (videoSender ?? pc.current) {
        await videoSender.replaceTrack(null);
        console.log("🎞️ Видео-трек заменен (null) успешно!");
      }

      if (!dc.current || dc.current.readyState != "open") {
        await initializationDataChannel();
      }

      dc.current.send(JSON.stringify({ type: "disableCamera" }));
      await renegotiation();
    } catch (error) {
      console.log("Ошибка при отключении камеры", error);
    } finally {
      setIsVideoEnabled(false);
      myVideoIndicatorRef.current.srcObject = null;
      myVideoIndicatorRef.current.pause();
      localVideoStreamRef.current = null;
    }
  };

  const switchSource = async (type, newDeviceId) => {
    console.log(`Смена потока типа ${type}`);

    // ДОДЕЛАТЬ СМЕНУ ИСТОЧНИКА ЗВУКА

    if (type == "video") {
      enableCamera(newDeviceId);
      setPreferredVideoDeviceID(newDeviceId);
    }
  };

  const changeStatusIndicators = (roomInfo) => {
    // iAmWaiting - ожидаю ответа собеседника
    // itIsWaiting - собеседник ждет меня

    console.log("💡 Обновление индикаторов");

    try {
      if (!myVideoIndicatorRef.current || !friendVideoPlayerRef.current) {
        throw new Error("💡 Индикаторы размонтированы");
      }

      let me, friend;

      if (roomInfo != null) {
        me = roomInfo.find((user) => user?.UserLogin == currentUser.UserLogin)?.inCall;
        friend = roomInfo.find((user) => user?.UserLogin == friendForCall.UserLogin)?.inCall;
      } else {
        me = false;
        friend = false;
      }

      if (!me && !friend) {
        console.log("💡 Никого нет в звонке");
        clearInterval(analyserFriendsTimerRef.current);
        myFriendStatusRef.current.innerText = "*Тишина, сверчки*";
        myVideoIndicatorRef.current.style.cssText = `box-shadow: none;`;
        friendVideoIndicatorRef.current.style.cssText = `box-shadow: none;`;
        friendVideoIndicatorRef.current.classList.remove("iAmWaiting", "itIsWaiting");
        indicatorNameFriendRef.current.classList.remove("ready");
        indicatorNameMeRef.current.classList.remove("ready");
        friendVideoPlayerRef.current.srcObject = null;
      }

      if (me && !friend) {
        console.log("💡 Я в звонке, собеседник - нет");
        clearInterval(analyserFriendsTimerRef.current);
        myFriendStatusRef.current.innerText = "Ожидаем ответа...";
        friendVideoIndicatorRef.current.style.cssText = `box-shadow: none;`;
        friendVideoIndicatorRef.current.classList.remove("itIsWaiting");
        friendVideoIndicatorRef.current.classList.add("iAmWaiting");
        indicatorNameFriendRef.current.classList.remove("ready");
        indicatorNameMeRef.current.classList.add("ready");
        indicatorNameFriendRef.current.classList.remove("muted");
        friendVideoPlayerRef.current.srcObject = null;
      }

      if (!me && friend) {
        console.log("💡 Собеседник в звонке, я - нет");
        myFriendStatusRef.current.innerText = "Вам звонят!";
        friendVideoIndicatorRef.current.style.cssText = `box-shadow: none;`;
        friendVideoIndicatorRef.current.classList.remove("iAmWaiting");
        friendVideoIndicatorRef.current.classList.add("itIsWaiting");
        indicatorNameFriendRef.current.classList.add("ready");
        indicatorNameMeRef.current.classList.remove("ready");
      }

      if (me && friend) {
        console.log("💡 Оба в звонке");
        myFriendStatusRef.current.innerText = "Соединение установлено!";
        friendVideoIndicatorRef.current.classList.remove("iAmWaiting", "itIsWaiting");
        indicatorNameFriendRef.current.classList.add("ready");
        indicatorNameMeRef.current.classList.add("ready");
        indicatorNameFriendRef.current.classList.remove("muted");
      }
    } catch (error) {
      console.warn(error);
    }
  };

  return (
    <СonferencePresentation
      currentUser={currentUser}
      iceServers={iceServers}
      friendForCall={friendForCall}
      myFriendStatusRef={myFriendStatusRef}
      isConnected={isConnected}
      remoteStream={remoteStream.current}
      //
      runConference={runConference}
      finishConference={finishConference}
      //
      isMicrophoneEnabled={isMicrophoneEnabled}
      disableMicrophone={disableMicrophone}
      enableMicrophone={enableMicrophone}
      //
      isVideoEnabled={isVideoEnabled}
      enableCamera={enableCamera}
      disableCamera={disableCamera}
      //
      myVideoIndicatorRef={myVideoIndicatorRef}
      //
      friendVideoIndicatorRef={friendVideoIndicatorRef}
      friendVideoPlayerRef={friendVideoPlayerRef}
      //
      videoDevices={videoDevices}
      audioDevices={audioDevices}
      switchSource={switchSource}
      //
      indicatorNameFriendRef={indicatorNameFriendRef}
      indicatorNameMeRef={indicatorNameMeRef}
    ></СonferencePresentation>
  );
}
