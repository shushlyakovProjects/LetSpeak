import { createSlice } from "@reduxjs/toolkit";

const USERS = [
  { id: 1, name: "Nikita", login: "amigo7772015", password: "1" },
  { id: 2, name: "Alex", login: "alex7772015", password: "2" },
];

const User = createSlice({
  name: "user",
  initialState: {
    authorizedUser: {
      id: 0,
      name: "",
      login: "",
      password: "",
    },
  },
  reducers: {
    login: (state, payload) => {
      const { login, password } = payload;
      let candidat = "";

      USERS.map((user) => {
        if (user.login == login) {
          candidat = user;
          return;
        }
      });

      if (candidat) {
        if (candidat.password == password) {
          console.log("Авторизация прошла успешно!");
          state.authorizedUser = candidat;
        } else {
          throw new Error("Неверный пароль");
        }
      } else {
        throw new Error("Пользователя с данным логином не найдено");
      }
    },
    logout: (state) => {
      console.log("Logout...");
      state.authorizedUser = {};
    },
  },
});

export default User.reducer;
