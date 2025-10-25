import { useState } from "react";
import RegistrationFormPresentation from "./RegistrationFormPresentation";
import axios from "axios";

export default function RegistrationFormContainer() {
  const [errorMessage, setErrorMessage] = useState("");

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
        console.log(result);
      })
      .catch((error) => {
        console.log(error);
        setErrorMessage(error.response.data);
      });
  }

  return (
    <RegistrationFormPresentation
      tryRegistration={tryRegistration}
      handleError={handleError}
      errorMessage={errorMessage}
    />
  );
}
