const express = require("express");
const router = express.Router();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const connectionDB = require("./dbController");


function generateAccessToken(login) {
  const payload = { login };
  return jwt.sign(payload, process.env.SECRET_ACCESS_KEY, { expiresIn: "24h" });
}

router.post("/", (req, res) => {
  if (req.cookies.ACCESS_TOKEN) {
    // ЕСЛИ ПОЛЬЗОВАТЕЛЬ АВТОРИЗОВАН
    const token = req.cookies.ACCESS_TOKEN;
    try {
      const decodeData = jwt.verify(token, process.env.SECRET_ACCESS_KEY);
      const { login } = decodeData;

      const findUserQuery = `SELECT * FROM users WHERE UserLogin = '${login}'`;
      connectionDB.query(findUserQuery, (err, currentUser) => {
        if (err) {
          res.status(401).send("Пользователь не найден в базе");
        } else {
          currentUser[0].UserPassword = "***";
          res.status(200).json(currentUser[0]);
        }
      });
    } catch (error) {
      res.cookie("ACCESS_TOKEN", "", { maxAge: -1 }).status(401).send("Токен устарел");
    }
  } else {
    // ЕСЛИ ПОЛЬЗОВАТЕЛЬ НЕ АВТОРИЗОВАН
    const { login, password } = req.body ? req.body : {};
    const checkQuery = `SELECT * FROM users WHERE UserLogin = '${login}'`;

    connectionDB.query(checkQuery, (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("База данных недоступна");
      } else {
        if (!result.length) {
          console.log("Пользователь не найден!");
          res.status(401).send("Логин или пароль неверный!");
        } else {
          const candidate = result[0];

          if (bcrypt.compareSync(password, candidate.UserPassword)) {
            const token = generateAccessToken(candidate.UserLogin);
            candidate.UserPassword = "***";
            res.cookie("ACCESS_TOKEN", token, { maxAge: 86400000 }).status(200).json(candidate);
          } else {
            res.status(401).send("Логин или пароль неверный!");
          }
        }
      }
    });
  }
});

module.exports = router;
