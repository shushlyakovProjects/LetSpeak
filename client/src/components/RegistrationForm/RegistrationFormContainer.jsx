import { useContext, useEffect, useState } from "react";
import RegistrationFormPresentation from "./RegistrationFormPresentation";
import axios from "axios";
import { UserContext } from "../../App";
import { useNavigate } from "react-router-dom";

export default function RegistrationFormContainer() {
  const [errorMessage, setErrorMessage] = useState("");
  const { currentUser, setCurrentUser } = useContext(UserContext);
  const navigate = useNavigate();

  function handleError(errFields) {
    // console.log(errFields);
    for (const field in errFields) {
      setErrorMessage(errFields[field].message);
      break;
    }
  }

  function tryRegistration(data) {
    console.log("Registration...");
    console.log(data);
    setErrorMessage("");
    axios
      .post("/api/registration", data)
      .then((result) => {
        setCurrentUser(result.data);
      })
      .catch((error) => {
        console.log(error);
        setErrorMessage(error.response.data);
      });
  }

  useEffect(() => {
    console.log('Переадресация..');
    
    if (currentUser.hasOwnProperty("UserLogin")) {
      console.log('Переадресация!!!');
      navigate("/main");
    }
  }, [currentUser]);

  return (
    <RegistrationFormPresentation
      tryRegistration={tryRegistration}
      handleError={handleError}
      errorMessage={errorMessage}
    />
  );
}
