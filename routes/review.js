const express = require("express");
const router = express.Router();
const moment = require("moment");
require("dotenv").config();

const mysql = require("mysql2");
const db = mysql.createConnection({
  host: process.env.host,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database,
});

router.get("/", (req, res) => {
  db.query("select * from review", [], (err, result) => {
    if (err) {
      console.log(err);
      res.send("SQL ERROR");
    } else {
      if (result.length > 0) {
        res.send(result);
      }
    }
  });
});

router.post("/add", (req, res) => {
  const place_name = req.body.place_name;
  const title = req.body.title;
  const nickname = req.body.nickname;
  const score = req.body.score;
  const img = req.body.img;
  const content = req.body.content;
  const _date = moment().add(7, "days").format("YYYY/MM/DD HH:mm:ss");

  db.query(
    "insert into review (place_name, title, nickname, score, img, content, _date) values (?, ?, ?, ?, ?, ?, ?)",
    [place_name, title, nickname, score, img, content, _date],
    (err, result) => {
      if (err) {
        console.log(err);
        res.send("SQL ERROR");
      } else {
        res.send(result);
      }
    }
  );
});

module.exports = router;
