import React, { useRef } from "react";
import ChatsPresentation from "./ChatsPresentation";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { useContext } from "react";
import { UserContext } from "../../App";
import { useState } from "react";
import notificationSound from "../../assets/sounds/notification_sound.mp3";

export default function ChatsContainer() {
  const emojiPack = {
    Эмоции: ["🤪", "😂", "🤗", "😁", "🫠", "😨", "😏"],
    Жесты: ["🤚", "👋", "👌", "🤌", "✌️", "💪"],
    Другое: ["❤️", "🤖", "🙈", "👀", "💩"],
  };
  const urlServer = "http://192.168.0.10:3000/static/";

  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useContext(UserContext);

  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [whoIsTyping, setWhoIsTyping] = useState("");
  const [isLoadImage, setIsLoadImage] = useState(false);
  const [fileFromBuffer, setFileFromBuffer] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const textareaRef = useRef("");
  const chatRef = useRef(null);
  const socketApi = useRef(null);
  const emojiRef = useRef(null);
  const inputFileRef = useRef(null);

  useEffect(() => {
    socketApi.current = io("");
    socketApi.current.emit("connectToSocket", { UserLogin: currentUser.UserLogin, UserName: currentUser.UserName });
    socketApi.current.emit("getGeneralChat");

    socketApi.current.on("connectToSocket", (UserName) => {
      const id = `notification_${Math.round(Math.random() * 1000)}`;
      document.body.insertAdjacentHTML(
        "beforeend",
        `<article id="${id}" class="notification">${UserName} <br /> присоединился</article>`
      );

      setTimeout(() => {
        document.getElementById(id).remove();
      }, 3000);
    });

    socketApi.current.on("deleteGeneralMessage", (MessageId) => {
      let messages = document.getElementById("messagesList").children;
      Array.from(messages).forEach((element) => {
        if (element.getAttribute("data-id") == MessageId) {
          element.classList.add("deletingMessage");
          setTimeout(() => {
            setMessages((prevMessages) => prevMessages.filter((message) => message.MessageId !== MessageId));
          }, 800);
        }
      });
    });

    socketApi.current.on("whoIsTyping", (UserName) => {
      const listWritting = new Set(whoIsTyping);
      listWritting.add(UserName);

      const names = [...listWritting].join(", ");
      let result = "";
      if (listWritting.size > 2) {
        result = `${names} и ещё ${listWritting.size} печатают...`;
      } else if (listWritting.size == 2) {
        result = `${names} печатают...`;
      } else if (listWritting.size == 1) {
        result = `${names} печатает...`;
      } else {
        result = "";
      }
      setWhoIsTyping(result);

      if (result) {
        setTimeout(() => {
          setWhoIsTyping("");
        }, 3000);
      }
    });

    socketApi.current.on("loadGeneralChat", (data) => {
      data.MessageDate = formatDate(new Date(data.MessageDate));
      setMessages((prev) => [data, ...prev]);
    });

    socketApi.current.on("loadGeneralMessage", async (data) => {
      data.MessageDate = formatDate(new Date(data.MessageDate));

      if (data.MessageSenderLogin != currentUser.UserLogin) {
        const audio = new Audio();
        audio.src = notificationSound;
        try {
          await audio.play();
          navigator.vibrate(1000);
        } catch (error) {}
      }

      setMessages((prev) => [data, ...prev]);
    });

    return () => {
      socketApi.current.off();
      socketApi.current.close();
    };
  }, []);

  const formatDate = (date) => {
    const numberOfMonth = (date) => (date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1);
    const numberOfDay = (date) => (date.getDate() < 10 ? "0" + date.getDate() : date.getDate());
    const numberOfHour = (date) => (date.getHours() < 10 ? "0" + date.getHours() : date.getHours());
    const numberOfMinute = (date) => (date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes());
    if (numberOfDay(date) == numberOfDay(new Date()) && numberOfMonth(date) == numberOfMonth(new Date())) {
      return `${numberOfHour(date)}:${numberOfMinute(date)} `;
    } else {
      return `${numberOfDay(date)}.${numberOfMonth(date)} ${numberOfHour(date)}:${numberOfMinute(date)} `;
    }
  };

  const addEmoji = (emoji) => {
    const textarea = textareaRef.current;

    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;

    const infoBefore = textarea.value.substring(0, startPos);
    const infoAfter = textarea.value.substring(endPos);

    textarea.value = infoBefore + emoji + infoAfter;
    textarea.setSelectionRange(startPos + emoji.length, startPos + emoji.length);
    textarea.focus();
  };

  const deleteMessage = (MessageId, MessageSenderLogin, MessageImage, MessageElement) => {
    if (MessageSenderLogin == currentUser.UserLogin) {
      const MessageDeleted = { MessageId, MessageSenderLogin, MessageImage };
      socketApi.current.emit("deleteGeneralMessage", MessageDeleted);
    }
  };

  const sendMessage = (textareaValue) => {
    const imageFromInput = (inputFileRef.current.files[0] || fileFromBuffer) ?? null;
    console.log(selectedMessage);

    if (!textareaValue && !imageFromInput && !selectedMessage) return;
    const MessageContent = textareaValue;
    const MessageDate = new Date();
    const MessageSenderLogin = currentUser.UserLogin;
    const MessageSenderName = currentUser.UserName;
    const MessageAnswerOn = selectedMessage ? selectedMessage.MessageId : null;
    let MessageImage = null;

    if (imageFromInput) {
      (async () => {
        MessageImage = await resizeImage(imageFromInput, 1600, 1200);
        const messageInfo = {
          MessageSenderLogin,
          MessageSenderName,
          MessageContent,
          MessageImage,
          MessageDate,
          MessageAnswerOn,
        };
        socketApi.current.emit("addGeneralMessage", messageInfo);
        setIsLoadImage(false);
      })();
    } else {
      const messageInfo = {
        MessageSenderLogin,
        MessageSenderName,
        MessageContent,
        MessageImage,
        MessageDate,
        MessageAnswerOn,
      };
      socketApi.current.emit("addGeneralMessage", messageInfo);
    }

    chatRef.current.scrollTo(0, 0);
    inputFileRef.current.value = "";
    setFileFromBuffer(null);
    setSelectedMessage(null);
  };

  async function resizeImage(imageFromInput, MAX_WIDTH, MAX_HEIGHT) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(imageFromInput);

      reader.onload = async (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (BlobImage) => {
              resolve(BlobImage);
            },
            "image/jpeg",
            0.8
          );
        };
      };
    });
  }

  const logout = () => {
    document.cookie = "ACCESS_TOKEN=";
    setCurrentUser({});
    navigate("/auth");
  };

  const sendIsTyping = () => {
    // console.log("Typing", currentUser.UserName);
    if (!isTyping) {
      setIsTyping(true);
      socketApi.current.emit("whoIsTyping", currentUser.UserName);
      setTimeout(() => {
        setIsTyping(false);
        setWhoIsTyping("");
      }, 3000);
    }
  };

  // const sendFinishTyping = () => {
  // socketApi.current.emit("whoIsTyping", currentUser.UserName);
  // };

  const sendVoiceMessage = () => {
    console.log("Запись...");
  };

  return (
    <ChatsPresentation
      urlServer={urlServer}
      logout={logout}
      sendMessage={sendMessage}
      messages={messages}
      currentUser={currentUser}
      deleteMessage={deleteMessage}
      textareaRef={textareaRef}
      chatRef={chatRef}
      emojiRef={emojiRef}
      inputFileRef={inputFileRef}
      addEmoji={addEmoji}
      emojiPack={emojiPack}
      sendIsTyping={sendIsTyping}
      whoIsTyping={whoIsTyping}
      sendVoiceMessage={sendVoiceMessage}
      isLoadImage={isLoadImage}
      setIsLoadImage={setIsLoadImage}
      setFileFromBuffer={setFileFromBuffer}
      selectedMessage={selectedMessage}
      setSelectedMessage={setSelectedMessage}
    ></ChatsPresentation>
  );
}
