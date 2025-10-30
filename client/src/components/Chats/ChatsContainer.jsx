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
      data.MessageDate = `${new Date(data.MessageDate).getHours()}:${new Date(data.MessageDate).getMinutes()} `;
      setMessages((prev) => [data, ...prev]);
    });

    return () => {
      socketApi.current.off();
      socketApi.current.close();
    };
  }, []);

  const deleteMessage = (MessageId, MessageSenderLogin) => {
    if (MessageSenderLogin == currentUser.UserLogin) {
      const MessageDeleted = { MessageId, MessageSenderLogin };
      socketApi.current.emit("deleteGeneralMessage", MessageDeleted);
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
