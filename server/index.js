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
app.use('/static', express.static('uploads'))

app.get("/*splat", (req, res) => {
  res.send("<h1>Server is working...</h1>");
  // res.sendFile(path.join(__dirname, "../client/dist/index.html"));
});

const registrationController = require("./controllers/registrationController");
app.use("/api/registration", registrationController);

const authorizationController = require("./controllers/authorizationController");
app.use("/api/authorization", authorizationController);

const http = require("http");
const socketIo = require("socket.io");
const { socketHandler } = require("./controllers/socketController");
const server = http.createServer(app);
const io = socketIo(server);
io.on("connect", (socket) => {
  socketHandler(socket, io);
});

const IS_PRODACTION = false;

if (IS_PRODACTION) {
  server.listen(process.env.SERVER_PORT, () => {
    console.log(`Server with Socket.io have been started on ${process.env.SOCKET_PORT}`);
  });
} else {
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
