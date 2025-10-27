import { useState } from "react";
import AuthorizationFormPresentation from "./AuthorizationFormPresentation";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../App";
import { useContext } from "react";

export default function AuthorizationFormContainer() {
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useContext(UserContext);

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
        setCurrentUser(result.data);
        console.log(currentUser);

        navigate("/chats");
      })
      .catch((error) => {
        console.log(error);
        setErrorMessage(error.response.data);
      });
  };

  return <AuthorizationFormPresentation tryLogin={tryLogin} handleError={handleError} errorMessage={errorMessage} />;
}
