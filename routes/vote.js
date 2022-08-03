const express = require("express");
const router = express.Router();

const mysql = require("mysql2");
const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "1234",
  database: "wanna",
});

module.exports = router;
