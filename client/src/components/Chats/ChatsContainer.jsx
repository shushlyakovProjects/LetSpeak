import React from "react";
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
  const [messages, setMessages] = useState([]);
  const socketApi = io("");

  useEffect(() => {
    socketApi.emit("getGeneralChat");

    socketApi.on("loadGeneralMessage", (data) => {
      setMessages((prev) => [data, ...prev]);
    });
  }, []);

  const sendMessage = (data) => {
    if (!data) return;
    const MessageContent = data;
    const MessageDate = new Date();
    const MessageSender = currentUser.UserName;

    const messageInfo = { MessageSender, MessageContent, MessageDate };
    socketApi.emit("addGeneralMessage", messageInfo);
  };

  const logout = () => {
    document.cookie = "ACCESS_TOKEN=";
    navigate("/auth");
  };

  return (
    <ChatsPresentation
      logout={logout}
      sendMessage={sendMessage}
      messages={messages}
      currentUser={currentUser}
    ></ChatsPresentation>
  );
}
