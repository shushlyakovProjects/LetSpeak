const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
require('dotenv').config();


const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("<h1>Server is working...</h1>");
});

const registrationController = require("./controllers/registrationController");
app.use("/registration", registrationController);

const authorizationController = require("./controllers/authorizationController");
app.use("/authorization", authorizationController);

app.listen(PORT, (err) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log(`Server has been started on ${PORT}...`);
});
