import axios from "axios";
import { useEffect, useState } from "react";
import UsersPresentation from "./UsersPresentation";
import { useNavigate } from "react-router-dom";

export default function UsersContainer({...props}) {
  const [usersList, setUsersList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('getUsers');
    
    axios
      .get("/api/getUsers")
      .then((result) => {
        setUsersList(result.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const initCall = (friendForCall) =>{
    props.setFriendForCall(friendForCall)
    // navigate(`/main/conference/?${friendForCall.UserLogin}`);
    navigate(`/main/conference`, {state: {friendForCall}});
  }

  return <UsersPresentation {...props} usersList={usersList} initCall={initCall}/>;
}
