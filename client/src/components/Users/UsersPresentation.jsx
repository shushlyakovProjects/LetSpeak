import style from "./Users.module.scss";
import CameraIcon from "../../assets/icons/CameraClear.svg";

export default function UsersPresentation({ usersList, initCall, ...props }) {
  return (
    <div className={style["users"]}>
      {/* <h2>Пользователи</h2> */}
      <div className={style["users__list"]}>
        {usersList.length
          ? usersList.map((user) => {
              if (user.UserLogin == props.currentUser.UserLogin) return;
              return (
                <div key={user.UserLogin} className={style["users__item"]}>
                  <p>{user.UserName}</p>
                  <p>{user.UserLogin}</p>
                  <nav>
                    <button
                      onClick={(e) => {
                        console.log("Звонок!");
                        initCall(user);
                      }}
                    >
                      {true ? <img data-modif="nongray" src={CameraIcon} title="Позвонить" /> : ""}
                    </button>
                  </nav>
                </div>
              );
            })
          : "Загрузка..."}
      </div>
    </div>
  );
}
