const bodyParser = require("body-parser");
const express = require("express");

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("<h1>Server is working...</h1>");
});

const users = [
  { id: 1, username: "Nikita", login: "amigo7772015", password: "123" },
  { id: 2, username: "Alex", login: "alex", password: "123" },
];

app.post("/registration", (req, res) => {
  const { username, login, password } = req.body;
  const userFromDb = users.find((item) => item.login == login);

  if (userFromDb) {
    console.log("Данный логин уже занят!");
    res.status(501).send("Данный логин уже занят!");
  } else {
    console.log("Регистрация нового пользователя!");
    res.status(200).send("Регистрация прошла успешно!");
  }
});

app.post("/authorization", (req, res) => {
  const { login, password } = req.body;
  const userFromDb = users.find((item) => item.login == login);

  if (userFromDb) {
    console.log("Пользователь найден!");
    const currentUser = users.find((item) => item.login == login && item.password == password);
    
    
    if (currentUser) {
      console.log("Авторизация прошла успешно!");
      currentUser.password = ''
      res.status(200).send(currentUser);
    } else {
      console.log("Пароль неверный!");
      res.status(401).send("Логин или пароль неверный!");
    }
  } else {
    console.log("Пользователь не найден!");
    res.status(401).send("Логин или пароль неверный!");
  }
});

app.listen(PORT, (err) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log(`Server has been started on ${PORT}...`);
});
