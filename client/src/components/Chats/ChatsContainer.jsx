import React from "react";
import ChatsPresentation from "./ChatsPresentation";
import { useNavigate } from "react-router-dom";

export default function ChatsContainer() {
  const navigate = useNavigate();

  const logout = () => {
    document.cookie = 'ACCESS_TOKEN='
    navigate("/auth");
  };

  return <ChatsPresentation logout={logout}></ChatsPresentation>;
}
