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
  const [textareaValue, setTextareaValue] = useState("");
  const [messages, setMessages] = useState([]);
  const socketApi = io("");

  useEffect(() => {
    socketApi.emit("getGeneralChat");

    socketApi.on("deleteGeneralMessage", (MessageId) => {
      // console.log(`Удален: ${MessageId}`);
      setMessages((prevMessages) => prevMessages.filter((message) => message.MessageId !== MessageId));
    });

    socketApi.on("loadGeneralMessage", (data) => {
      // console.log(messages);
      data.MessageDate = `${new Date(data.MessageDate).getHours()}:${new Date(data.MessageDate).getMinutes()} `;
      setMessages((prev) => [data, ...prev]);
    });
  }, []);


  const deleteMessage = (MessageId, MessageSenderLogin) => {
    if (MessageSenderLogin == currentUser.UserLogin) {
      const MessageDeleted = { MessageId, MessageSenderLogin };
      socketApi.emit("deleteGeneralMessage", MessageDeleted);
    }
  };

  const sendMessage = () => {
    if (!textareaValue) return;
    const MessageContent = textareaValue;
    const MessageDate = new Date();
    const MessageSenderLogin = currentUser.UserLogin;
    const MessageSenderName = currentUser.UserName;

    const messageInfo = { MessageSenderLogin, MessageSenderName, MessageContent, MessageDate };
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
      textareaValue={textareaValue}
      setTextareaValue={setTextareaValue}
      deleteMessage={deleteMessage}
    ></ChatsPresentation>
  );
}
