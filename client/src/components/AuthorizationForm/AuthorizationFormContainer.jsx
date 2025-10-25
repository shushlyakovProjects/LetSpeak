import { useState } from "react";
import AuthorizationFormPresentation from "./AuthorizationFormPresentation";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AuthorizationFormContainer() {
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();


  // ДОРАБОТАТЬ АВТОРИЗАЦИЮ. НУЖНО ПРИСЫЛАТЬ JWT И ФИКСИРОВАТЬ В COOKIES

  function handleError(errFields) {
    // console.log(errFields);
    for (const field in errFields) {
      setErrorMessage(errFields[field].message);
      break;
    }
  }

  const tryLogin = (data) => {
    console.log("Authorization...");
    console.log(data);
    setErrorMessage("");
    axios
      .post("/api/authorization", data)
      .then((result) => {
        console.log(result);
        navigate('/chats')
      })
      .catch((error) => {
        console.log(error);
        setErrorMessage(error.response.data);
      });
  };

  return <AuthorizationFormPresentation tryLogin={tryLogin} handleError={handleError} errorMessage={errorMessage} />;
}
