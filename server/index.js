const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const path = require("path");
const connectionDB = require("./controllers/dbController");
const jwt = require("jsonwebtoken");
const axios = require("axios");

connectionDB.connect((err) => {
  if (err) {
    console.error("Error with database!");
  } else {
    console.log("Database is available!");
  }
});

require("dotenv").config();

const app = express();

app.use(express.static(path.join(__dirname, "../client/dist")));
app.use(bodyParser.json());
app.use(cookieParser());
app.use("/static", express.static("uploads"));
app.use("/static", express.static("uploads/images"));
app.use("/static", express.static("uploads/voices"));

const { socketHandler } = require("./controllers/socketController");
const socketIo = require("socket.io");

const registrationController = require("./controllers/registrationController");
const authorizationController = require("./controllers/authorizationController");

app.use("/api/registration", registrationController);
app.use("/api/authorization", authorizationController);

const checkAuth = (req, res, next) => {
  // Получаем токен из заголовка Authorization
  const token = req.cookies.ACCESS_TOKEN;

  if (!token) {
    return res.status(401).json({ error: "Токен не предоставлен" });
  }

  try {
    const decodeData = jwt.verify(token, process.env.SECRET_ACCESS_KEY);
    const { login } = decodeData;

    const findUserQuery = `SELECT * FROM users WHERE UserLogin = '${login}'`;
    connectionDB.query(findUserQuery, (err, currentUser) => {
      if (err || currentUser.length == 0) {
        res.cookie("ACCESS_TOKEN", "", { maxAge: -1 }).status(401).send("Пользователь не найден в базе");
      } else {
        next();
      }
    });
  } catch (error) {
    console.log(error);

    res.cookie("ACCESS_TOKEN", "", { maxAge: -1 }).status(403).send("Токен устарел");
  }
};

app.get("/api/getUsers", checkAuth, (req, res) => {
  console.log("Получение пользователей...");

  const checkQuery = `SELECT * FROM users`;
  let usersList = [];

  try {
    connectionDB.query(checkQuery, (err, result) => {
      result.forEach((user) => {
        const newObj = {
          UserName: user.UserName,
          UserLogin: user.UserLogin,
        };

        usersList.push(newObj);
      });
      res.send(usersList);
    });
  } catch (error) {
    console.log("DB ERROR:", error);
  }
});

app.get("/api/getRTCconfig", checkAuth, async (req, res) => {
  console.log("Получение конфигурации RTC...");

  axios
    .put(
      "https://global.xirsys.net/_turn/LetSpeak",
      {
        format: "urls",
        ttl: 86400,
      },
      {
        auth: {
          username: process.env.TURN_USERNAME,
          password: process.env.TURN_CREDENTIAL,
        },
        timeout: 30000,
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
    .then((result) => {
      if (result.data.s == "ok") {
        res.status(200).json(result.data.v.iceServers);
      } else {
        throw new Error("Статус не ok");
      }
    })
    .catch((error) => {
      console.log(error);
      res.send(error);
    });
});

app.get("/*splat", (req, res) => {
  // res.send("<h1>Server ids working...</h1>");
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

//  ========= Server Mode ==========

const IS_PRODACTION = false;

//  ========= Server Mode ==========

IS_PRODACTION ? startProdaction() : startDevlopment();

function startProdaction() {
  console.log("--- Server mode: prodaction ---");

  const fs = require("fs");
  const options = {
    key: fs.readFileSync("./https/key.pem"),
    cert: fs.readFileSync("./https/cert.pem"),
  };
  const https = require("https");
  const server = https.createServer(options, app);
  const io = socketIo(server);

  io.on("connect", (socket) => {
    socketHandler(socket, io);
  });

  server.listen(process.env.SERVER_PORT, () => {
    console.log(`Server with Socket.io have been started on ${process.env.SERVER_PORT}`);
  });
}

function startDevlopment() {
  console.log("--- Server mode: development ---");

  const http = require("http");

  const server = http.createServer(app);
  const io = socketIo(server);
  io.on("connect", (socket) => {
    socketHandler(socket, io);
  });

  server.listen(process.env.SOCKET_PORT, () => {
    console.log(`Socket.io has been started on ${process.env.SOCKET_PORT}`);
  });
  app.listen(process.env.SERVER_PORT, (err) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log(`Server has been started on ${process.env.SERVER_PORT}...`);
  });
}
