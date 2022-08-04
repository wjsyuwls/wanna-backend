const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

const mysql = require("mysql2");
const db = mysql.createConnection({
  host: process.env.host,
  port: process.env.port,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database,
});

const api = require("./routes/api");
app.use("/api", api);

const place = require("./routes/place.js");
app.use("/api/place", place);

const review = require("./routes/review.js");
app.use("/api/review", review);

const port = 3001;
app.listen(port, () => {
  console.log(`running on port ${port}`);
});

app.get("/api/getReview", (req, res) => {
  db.query("select * from review", [], (err, result) => {
    if (err) {
      console.log(err);
      res.send("SQL ERROR");
    } else {
      console.log(result);
      if (result.length > 0) {
        res.send(result);
      }
    }
  });
});
