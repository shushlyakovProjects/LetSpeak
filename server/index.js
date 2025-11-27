const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();

// app.use(express.json({ limit: '50mb' }));
// app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(express.static(path.join(__dirname, "../client/dist")));
app.use(bodyParser.json());
app.use(cookieParser());
app.use("/static", express.static("uploads"));
app.use("/static", express.static("uploads/images"));
app.use("/static", express.static("uploads/voices"));

app.get("/*splat", (req, res) => {
  // res.send("<h1>Server is working...</h1>");
  res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

const registrationController = require("./controllers/registrationController");
app.use("/api/registration", registrationController);

const authorizationController = require("./controllers/authorizationController");
app.use("/api/authorization", authorizationController);

const { socketHandler } = require("./controllers/socketController");
const socketIo = require("socket.io");



//  ========= Server Mode ==========

const IS_PRODACTION = true;

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
