import React, { useRef } from "react";
import ChatsPresentation from "./ChatsPresentation";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { useContext } from "react";
import { UserContext } from "../../App";
import { useState } from "react";

export default function ChatsContainer() {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useContext(UserContext);
  // const [textareaValue, setTextareaValue] = useState("");
  const [messages, setMessages] = useState([]);
  const textareaRef = useRef("");
  const chatRef = useRef(null);
  const socketApi = useRef(null);

  useEffect(() => {
    socketApi.current = io("");
    socketApi.current.emit("connectToSocket", currentUser.UserLogin);
    socketApi.current.emit("getGeneralChat");

    socketApi.current.on("deleteGeneralMessage", (MessageId) => {
      setMessages((prevMessages) => prevMessages.filter((message) => message.MessageId !== MessageId));
    });

    socketApi.current.on("loadGeneralMessage", (data) => {
      const date = new Date(data.MessageDate);
      const numberOfMonth = (date) => (date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1);
      const numberOfDay = (date) => (date.getDate() < 10 ? "0" + date.getDate() : date.getDate());
      if (numberOfDay(date) == numberOfDay(new Date()) && numberOfMonth(date) == numberOfMonth(new Date())) {
        data.MessageDate = `${date.getHours()}:${date.getMinutes()} `;
      } else {
        data.MessageDate = `${numberOfDay(date)}.${numberOfMonth(date)} ${date.getHours()}:${date.getMinutes()} `;
      }
      setMessages((prev) => [data, ...prev]);
    });

    return () => {
      socketApi.current.off();
      socketApi.current.close();
    };
  }, []);

  const deleteMessage = (MessageId, MessageSenderLogin, MessageElement) => {
    if (MessageSenderLogin == currentUser.UserLogin) {
      MessageElement.classList.add("deletingMessage");
      const MessageDeleted = { MessageId, MessageSenderLogin };
      setTimeout(() => {
        socketApi.current.emit("deleteGeneralMessage", MessageDeleted);
      }, 600);
    }
  };

  const sendMessage = (textareaValue) => {
    if (!textareaValue) return;
    const MessageContent = textareaValue;
    const MessageDate = new Date();
    const MessageSenderLogin = currentUser.UserLogin;
    const MessageSenderName = currentUser.UserName;
    const messageInfo = { MessageSenderLogin, MessageSenderName, MessageContent, MessageDate };
    console.log(chatRef);

    // chatRef.current.scrollTo({ top: -50, behavior: "smooth" });
    socketApi.current.emit("addGeneralMessage", messageInfo);
  };

  const logout = () => {
    document.cookie = "ACCESS_TOKEN=";
    setCurrentUser({});
    navigate("/auth");
  };

  return (
    <ChatsPresentation
      logout={logout}
      sendMessage={sendMessage}
      messages={messages}
      currentUser={currentUser}
      deleteMessage={deleteMessage}
      textareaRef={textareaRef}
      chatRef={chatRef}
    ></ChatsPresentation>
  );
}
