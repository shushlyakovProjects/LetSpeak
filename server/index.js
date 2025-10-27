const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
require("dotenv").config();

const app = express();

app.use(bodyParser.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("<h1>Server is working...</h1>");
});

const registrationController = require("./controllers/registrationController");
app.use("/registration", registrationController);

const authorizationController = require("./controllers/authorizationController");
app.use("/authorization", authorizationController);

const http = require("http");
const socketIo = require("socket.io");
const { socketHandler } = require("./controllers/socketController");
const server = http.createServer(app);
const io = socketIo(server);
io.on("connection", (socket) => {
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
