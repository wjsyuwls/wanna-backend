const express = require("express");
const app = express();
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }));

const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "12345678",
  database: "travelDapp",
});

app.post("/api/isUser", (req, res) => {
  const id = req.body.id;
  db.query("select * from user where id = ?", [id], (err, result) => {
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

app.post("/api/register", (req, res) => {
  const id = req.body.id;
  const name = req.body.name;
  const address = req.body.address;

  db.query(
    "insert into user (id, name, address) values (?, ?, ?)",
    [id, name, address],
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

app.post("/api/withdraw", (req, res) => {
  const id = req.body.id;

  db.query("delete from user where id = ?", [id], (err, result) => {
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

app.post("/api/getPlace", (req, res) => {
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

// 더미데이터 insert
app.post("/api/insert", (req, res) => {
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

const port = 3001;
app.listen(port, () => {
  console.log(`running on port ${port}`);
});
