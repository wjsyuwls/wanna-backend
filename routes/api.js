const express = require("express");
const router = express.Router();
require("dotenv").config();

const mysql = require("mysql2");
const db = mysql.createConnection({
  host: process.env.host,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database,
});

router.post("/isUser", (req, res) => {
  const email = req.body.email;
  db.query("select * from user where email = ?", [email], (err, result) => {
    if (err) {
      console.log(err);
      res.send("SQL ERROR");
    } else {
      if (result.length === 0) {
        res.send({ isUser: false });
      } else {
        res.send({ isUser: true, address: result[0].address });
      }
    }
  });
});

router.post("/register", (req, res) => {
  const email = req.body.email;
  const nickname = req.body.nickname;
  const address = req.body.address;

  db.query(
    "insert into user (email, nickname, address) values (?, ?, ?)",
    [email, nickname, address],
    (err, result) => {
      if (err) {
        console.log(err);
        res.send("SQL ERROR");
      } else {
        if (result) {
          res.send({ message: true });
        } else {
          res.send({ message: false });
        }
      }
    }
  );
});

module.exports = router;
