import React, { useEffect, useRef } from "react";
// import { useDispatch, useSelector } from "react-redux";
import AuthorizationFormContainer from "./components/AuthorizationForm/AuthorizationFormContainer";
import RegistrationFormContainer from "./components/RegistrationForm/RegistrationFormContainer";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import ChatsContainer from "./components/Chats/ChatsContainer";
import axios from "axios";
import { createContext } from "react";
import { useState } from "react";

export const UserContext = createContext();

export default function App() {
  // const user = useSelector((state) => state.user.authorizedUser);
  // const dispathUser = useDispatch();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState("");

  const tryLogin = () => {
    console.log("Checking authorization...");
    axios
      .post("/api/authorization")
      .then((result) => {
        console.log(result);
        setCurrentUser(result.data);
        navigate("/chats");
      })
      .catch((error) => {
        console.log(error);
        navigate("/auth");
      });
  };

  const createNotification = (type, object) => {
    const id = `notification_${Math.round(Math.random() * 1000)}`;
    let notificationContent = ``;

    switch (type) {
      case "newClient":
        notificationContent = `${object.UserName} <br /> присоединился`;
        break;
      case "permissionDenied":
        notificationContent = `Отказано в доступе :(`;
        break;
      default:
        break;
    }
    document.body.insertAdjacentHTML(
      "beforeend",
      `<article id="${id}" class="notification">${notificationContent}`
    );

    setTimeout(() => {
      document.getElementById(id).remove();
    }, 3000);
  };

  useEffect(() => {
    navigate("/auth");
    tryLogin();
  }, []);

  return (
    <>
      <UserContext value={{ currentUser, setCurrentUser }}>
        <Routes>
          <Route path="/reg" element={<RegistrationFormContainer />} />
          <Route path="/auth" element={<AuthorizationFormContainer />} />
          <Route path="/chats" element={<ChatsContainer createNotification={createNotification} />} />
          <Route path="/" element={<ChatsContainer createNotification={createNotification} />} />
        </Routes>
      </UserContext>
    </>
  );
}
