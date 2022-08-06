const express = require("express");
const router = express.Router();

const mysql = require("mysql2");
const db = mysql.createConnection({
  host: process.env.host,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database,
});

// get user
router.get("/getInfo/:email", (req, res) => {
  const email = req.params.email;
  db.query("select * from user WHERE email = ?", [email], (err, result) => {
    if (err) {
      console.log(err);
      res.send("SQL ERROR");
    } else {
      // console.log(result);
      if (result.length > 0) {
        res.send(result[0]);
      }
    }
  });
});

// update user nickname
router.post("/update/nickname", (req, res) => {
  const email = req.body.email;
  const nickname = req.body.nickname;
  console.log(email);
  console.log(nickname);
  db.query(
    `UPDATE user SET nickname = ? WHERE email = ?`,
    [nickname, email],
    (err, result) => {
      if (err) {
        console.log(err);
        res.send("SQL ERROR");
      } else {
        console.log(result);
        if (result) {
          res.send(result);
        }
      }
    }
  );
});

// update user address
router.post("/update/address", (req, res) => {
  const email = req.body.email;
  const address = req.body.address;
  db.query(
    `UPDATE user SET address = ? WHERE email = ?`,
    [address, email],
    (err, result) => {
      if (err) {
        console.log(err);
        res.send("SQL ERROR");
      } else {
        console.log(result);
        if (result) {
          res.send(result);
        }
      }
    }
  );
});

// delete user
router.post("/withdraw", (req, res) => {
  const email = req.body.email;

  db.query("delete from user where email = ?", [email], (err, result) => {
    if (err) {
      console.log(err);
      res.send("SQL ERROR");
    } else {
      if (result.length === 0) {
        res.send({ withdraw: false });
      } else {
        res.send({ withdraw: true });
      }
    }
  });
});

module.exports = router;
