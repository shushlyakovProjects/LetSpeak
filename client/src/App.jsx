import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import AuthorizationFormContainer from "./components/AuthorizationForm/AuthorizationFormContainer";
import RegistrationFormContainer from "./components/RegistrationForm/RegistrationFormContainer";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ChatsContainer from "./components/Chats/ChatsContainer";

export default function App() {
  const user = useSelector((state) => state.user.authorizedUser);
  const dispathUser = useDispatch();

  // useEffect(() => {
  //   console.log(user);
  // });

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/reg" element={<RegistrationFormContainer />} />
          <Route path="/auth" element={<AuthorizationFormContainer />} />
          <Route path="/chats" element={<ChatsContainer />} />
        </Routes>
      </BrowserRouter>

      {/* <div>
        {user.id ? (
          <div>
            <h2>
              {user.id} - {user.name} ({user.login})
            </h2>
          </div>
        ) : (
          <p>Не авторизован</p>
        )}
      </div> */}

      {/* <button onClick={() => dispathUser({ type: "user/login", login: "amigo7772015", password: "1" })}>
        Login...
      </button>
      <button onClick={() => dispathUser({ type: "user/logout" })}>Logout...</button> */}
    </>
  );
}
