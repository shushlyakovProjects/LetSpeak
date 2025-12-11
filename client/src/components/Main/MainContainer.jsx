import React, { useContext } from "react";
import MainPresentation from "./MainPresentation";
import { UserContext } from "../../App";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { useState } from "react";


export default function MainContainer({ createNotification }) {
  // const urlServer = "https://31.180.196.99:3000/static/";
  const urlServer = "http://localhost:3000/static/";
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useContext(UserContext);

  const [isConnected, setIsConnected] = useState(false);


  const socketApi = useRef(null);

  useEffect(() => {
    socketApi.current = io("");

    return () => {
      socketApi.current.off();
      socketApi.current.close();
    };
  }, []);

  useEffect(() => {
    if (socketApi.current && currentUser && !isConnected) {
      socketApi.current.emit("connectToSocket", { UserLogin: currentUser.UserLogin, UserName: currentUser.UserName });
      socketApi.current.on("connectToSocket", (UserName) => {
        createNotification("newClient", { UserName });
      });
      setIsConnected(true);
    }
  });

  const logout = () => {
    document.cookie = "ACCESS_TOKEN=";
    setCurrentUser({});
    navigate("/auth");
  };

  return (
    <MainPresentation
      logout={logout}
      navigate={navigate}
      currentUser={currentUser}
      createNotification={createNotification}
      socketApi={socketApi.current}
      urlServer={urlServer}
    />
  );
}
