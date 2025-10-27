const express = require("express");
const router = express.Router();

// librires
const bcrypt = require("bcryptjs");
const connectionDB = require("./dbController");

router.post("/", (req, res) => {
  const { username, login, password } = req.body;
  const checkQuery = `SELECT * FROM users WHERE UserLogin = '${login}'`;

  connectionDB.query(checkQuery, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send('База данных недоступна')
    } else {
      if (result.length) {
        res.status(501).send("Данный логин уже занят!");
      } else {
        const salt = bcrypt.genSaltSync(5);
        const hashPassword = bcrypt.hashSync(password, salt);

        const registrationQuery = `INSERT INTO users (UserId, UserName, UserLogin, UserPassword) VALUES (NULL, '${username}','${login}','${hashPassword}')`;

        connectionDB.query(registrationQuery, (err, result) => {
          if (err) {
            res.status(500).send(err);
          } else {
            res.status(200).send("Регистрация прошла успешно!");
          }
        });
      }
    }
  });
});

module.exports = router;
