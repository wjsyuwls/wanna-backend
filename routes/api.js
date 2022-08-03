const express = require("express");
const router = express.Router();

const mysql = require("mysql2");
const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "1234",
  database: "wanna",
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

router.post("/withdraw", (req, res) => {
  const email = req.body.email;

  db.query("delete from user where email = ?", [email], (err, result) => {
    if (err) {
      console.log(err);
      res.send("SQL ERROR");
    } else {
      if (result.length === 0) {
        res.send({ message: false });
      } else {
        res.send({ message: true });
      }
    }
  });
});

module.exports = router;
