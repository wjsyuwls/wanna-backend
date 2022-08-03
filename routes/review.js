const express = require("express");
const router = express.Router();
const moment = require("moment");

const mysql = require("mysql2");
const db = mysql.createConnection({
  host: process.env.host,
  port: process.env.port,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database,
});

//klaytn contract 연결
var Caver = require("caver-js");
var cav = new Caver("https://api.baobab.klaytn.net:8651");
var product_contract = require("../build/vote.json");
var smartcontract = new cav.klay.Contract(
  product_contract.abi,
  "0xab416C42e60070a59E6060496A2Fd0Ae49198767"
);
var account = cav.klay.accounts.createWithAccountKey(
  process.env.address,
  process.env.privatekey
);
cav.klay.accounts.wallet.add(account);

// 1. 리뷰 등록
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

// 2. 투표하기
router.post("/vote", (req, res) => {
  const id = req.body.id;
  const _a_d = req.body._a_d;

  db.query("select * from review where id = ?", [id], (err, result) => {
    if (err) {
      console.log(err);
      res.send("SQL ERROR");
    } else {
      // moment로 시간비교
      // 마감 시간
      const end = moment(result[0]._date, "YYYY/MM/DD HH:mm:ss");
      // 투표한 시간
      const now = moment(
        moment().format("YYYY/MM/DD HH:mm:ss"),
        "YYYY/MM/DD HH:mm:ss"
      );
      // 시간 차이 구하기
      const gap = end.diff(now, "milliseconds");
      console.log(gap);

      // 만약 이미 투표한 address라면 return 해주어야함

      // 투표 가능
      if (gap > 0) {
        smartcontract.methods
          .add_voting(id, _a_d)
          .send({
            from: account.address,
            gas: 2000000,
          })
          .then((receipt) => {
            console.log(receipt);
            res.send({ message: "투표 완료" });
          });
      } else {
        res.send({ message: "투표가 종료되었습니다." });
      }
    }
  });
});

// 3. 투표 조회 함수로 빼야함
router.get("/view_voting", (req, res) => {
  smartcontract.methods
    .view_voting("1")
    .call()
    .then((receipt) => {
      console.log(receipt);
    });
});

module.exports = router;
