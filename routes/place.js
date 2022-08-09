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

//모든 가게정보 조회(map에서 사용)
router.post("/get", (req, res) => {
  db.query("select * from place", [], (err, result) => {
    if (err) {
      console.log(err);
      req.send("SQL ERROR");
    } else {
      if (result.length > 0) {
        res.send(result);
      }
    }
  });
});

//해당 가게의 정보 조회(store info에서 사용)
router.post("/getStoreInfo", (req, res) => {
  let place_name = req.body.place_name;

  db.query(
    "select * from place where place_name = ?",
    [place_name],
    (err, result) => {
      if (err) {
        console.log(err);
        req.send("SQL ERROR");
      } else {
        if (result.length > 0) {
          res.send(result);
        }
      }
    }
  );
});

// trash data insert
router.post("/insert", (req, res) => {
  console.log(req.body);

  const address = req.body.address;
  const category_code = req.body.category_code;
  const category_name = req.body.category_name;
  const phone = req.body.phone;
  const place_name = req.body.place_name;
  const road_address = req.body.road_address;
  const x = req.body.x;
  const y = req.body.y;

  db.query(
    "insert into place (address, category_code, category_name, phone, place_name, road_address, x, y) values(?, ?, ?, ?, ?, ?, ?, ?)",
    [
      address,
      category_code,
      category_name,
      phone,
      place_name,
      road_address,
      x,
      y,
    ],
    (err, result) => {
      if (err) {
        console.log(err);
        res.send("SQL ERROR");
      } else {
        if (result) {
          console.log("OK");
        }
      }
    }
  );
});

module.exports = router;
