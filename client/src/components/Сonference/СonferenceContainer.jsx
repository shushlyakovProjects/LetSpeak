import React, { useEffect, useRef, useState } from "react";
import СonferencePresentation from "./СonferencePresentation";

export default function СonferenceContainer({ socketApi, currentUser }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isMicrophoneEnabled, setIsMicrophoneEnabled] = useState(false);
  const [participants, setParticipants] = useState([]);

  const timerRef = useRef();
  const audioPlayerRef = useRef(null);
  const myVoiceIndicatorRef = useRef(null);
  const mediaSourceRef = useRef(null);
  const urlBinRef = useRef(null);

  useEffect(() => {
    console.log("РЕНДЕР КОМПОНЕНТА");
    if (socketApi == null) return;

    socketApi.emit("showParticipantConference");
    socketApi.on("showParticipantConference", (ConferenceParticipants) => {
      setParticipants(ConferenceParticipants);
    });

    socketApi.on("addParticipantConference", (ConferenceParticipants) => {
      setParticipants(ConferenceParticipants);
    });

    socketApi.on("leaveParticipantConference", (ConferenceParticipants) => {
      setParticipants(ConferenceParticipants);
    });

    return () => {
      finishConference();
    };
  }, [socketApi]);

  const startConference = async () => {
    if (socketApi == null) return;
    if (!isConnected) {
      console.log("Попытка подключения к конференции...");
      myVoiceIndicatorRef.current.classList.add("loader_1");

      socketApi.emit("addParticipantConference", { UserName: currentUser.UserName, UserLogin: currentUser.UserLogin });

      mediaSourceRef.current = new MediaSource();
      urlBinRef.current = URL.createObjectURL(mediaSourceRef.current);
      audioPlayerRef.current.src = urlBinRef.current;

      mediaSourceRef.current.addEventListener("sourceopen", () => {
        console.log("MediaSource готов");
        setIsConnected(true);

        let sourceBuffer;
        if (mediaSourceRef.current.readyState === "open") {
          try {
            sourceBuffer = mediaSourceRef.current.addSourceBuffer('audio/webm; codecs="opus"');

            audioPlayerRef.current.play().catch((error) => {
              console.log(error);
            });

            socketApi.on("streamConference", (data) => {
              console.log("Новые данные");
              sourceBuffer.appendBuffer(data);
            });
          } catch (error) {
            socketApi.emit("leaveParticipantConference", currentUser.UserName);
            console.error("Ошибка:", error.message);
            finishConference();
          }
        }
      });
    }
  };

  const finishConference = () => {
    try {
      if (mediaSourceRef.current) {
        console.log("Завершение конференции. Очистка...");
        socketApi.off("streamConference");

        myVoiceIndicatorRef.current.classList.remove("loader_1");
        clearInterval(timerRef.current);
        setIsConnected(false);
        setIsMicrophoneEnabled(false);

        audioPlayerRef.current.pause();
        audioPlayerRef.current.load();
        audioPlayerRef.current.removeAttribute("src");

        mediaSourceRef.current.removeEventListener("sourceopen", () => {});
        mediaSourceRef.current = null;

        URL.revokeObjectURL(urlBinRef.current);
        urlBinRef.current = null;
        socketApi.emit("leaveParticipantConference", {
          UserName: currentUser.UserName,
          UserLogin: currentUser.UserLogin,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const enableMicrophone = async () => {
    try {
      if (!isMicrophoneEnabled) {
        startConference();
        setIsConnected(true);
        setIsMicrophoneEnabled(true);
        console.log("Начало конференции");

        let stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

        let audioCtx = null;
        let analyser = null;
        let frequencyArray = [];
        try {
          audioCtx = new window.AudioContext();
          const sourceNode = audioCtx.createMediaStreamSource(stream);
          analyser = audioCtx.createAnalyser();

          analyser.minDecibels = -90;
          analyser.maxDecibels = -10;
          analyser.smoothingTimeConstant = 0;

          sourceNode.connect(analyser);
          frequencyArray = new Uint8Array(analyser.frequencyBinCount);
          // myVoiceIndicatorRef.current.classList.remove("loader_1");
        } catch (error) {
          console.warn("Анализатор голоса не доступен в данной версии браузерера.");
        }

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            if (audioCtx && analyser) {
              let totalVolume = 0;
              analyser.getByteFrequencyData(frequencyArray);
              for (let i = 0; i < frequencyArray.length; i++) {
                totalVolume += frequencyArray[i];
              }

              const currentVolume = (totalVolume / frequencyArray.length / 10) * 0.4 + 1;
              
              myVoiceIndicatorRef.current.style.cssText = `box-shadow: 0 0 ${10*currentVolume}px yellow`;
            }

            socketApi.emit("streamConference", event.data); // Отправляем аудиоданнные на сервер
          }
        };

        mediaRecorder.start();

        timerRef.current = setInterval(() => {
          mediaRecorder.requestData(); // Запрашиваем готовые данные
        }, 50);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Вычислить среднеквадратичное значение массива
  // function calculateRMS(arr) {
  //   let sum = arr.reduce((acc, val) => acc + val * val, 0);
  //   return Math.sqrt(sum / arr.length);
  // }

  const disableMicrophone = () => {
    if (isMicrophoneEnabled) {
      setIsMicrophoneEnabled(false);
      clearInterval(timerRef.current);
      myVoiceIndicatorRef.current.style.cssText = "";
      console.log("Микрофон отключен");
      // audioPlayerRef.current.pause().catch(console.error);
    }
  };

  return (
    <СonferencePresentation
      startConference={startConference}
      finishConference={finishConference}
      disableMicrophone={disableMicrophone}
      enableMicrophone={enableMicrophone}
      audioPlayerRef={audioPlayerRef}
      myVoiceIndicatorRef={myVoiceIndicatorRef}
      isConnected={isConnected}
      isMicrophoneEnabled={isMicrophoneEnabled}
      participants={participants}
    ></СonferencePresentation>
  );
}
