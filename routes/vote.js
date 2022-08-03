const express = require("express");
const router = express.Router();

const mysql = require("mysql2");
const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "1234",
  database: "wanna",
});

//klaytn contract 연결
var Caver = require("caver-js");
var cav = new Caver("https://api.baobab.klaytn.net:8651");
var product_contract = require("../build/vote.json");
var smartcontract = new cav.klay.Contract(
  product_contract.abi,
  "0xd9145CCE52D386f254917e481eB44e9943F39138"
);
var account = cav.klay.accounts.createWithAccountKey(
  process.env.address,
  process.env.privatekey
);
cav.klay.accounts.wallet.add(account);

module.exports = router;
