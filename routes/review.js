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

// connect klaytn contract
var Caver = require("caver-js");
var cav = new Caver("https://api.baobab.klaytn.net:8651");
var product_contract = require("../build/vote.json");
var smartcontract = new cav.klay.Contract(
  product_contract.abi,
  process.env.contract_account
);

// view vote scf
const view_voting = async (id) => {
  let Agree, Disagree, Count;
  await smartcontract.methods
    .view_voting(id)
    .call()
    .then((receipt) => {
      Agree = receipt["0"];
      Disagree = receipt["1"];
      Count = receipt["2"];
    });
  return { Agree, Disagree, Count };
};

async function view_place_review(place) {
  const receipt = await smartcontract.methods.view_place_review(place).call();
  return receipt;
}

async function view_review(id) {
  const receipt = smartcontract.methods.view_review(id).call();
  return receipt;
}

router.get("/", (req, res) => {
  db.query("select * from review", [], (err, result) => {
    if (err) {
      console.log(err);
      res.send("SQL ERROR");
    } else {
      if (result.length > 0) {
        let place = [];
        result.map((data) => {
          console.log(data);
          view_voting(data.id).then(({ Agree, Disagree, Count }) => {
            place.push({ ...data, Agree, Disagree, Count });
            console.log({ ...data, Agree, Disagree, Count });
          });
        });

        setTimeout(() => {
          console.log(place);
          res.send(place);
        }, 100);
      }
    }
  });
});

router.post("/add", (req, res) => {
  const place_name = req.body.place_name;
  const title = req.body.title;
  const nickname = req.body.nickname;
  const address = req.body.address;
  const score = req.body.score;
  const img = req.body.img;
  const content = req.body.content;
  const _date = moment().format("YYYY/MM/DD HH:mm:ss");
  const deadline = moment().add(7, "days").format("YYYY/MM/DD HH:mm:ss");

  db.query(
    "insert into review (place_name, title, nickname, address, score, img, content, _date, deadline) values (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      place_name,
      title,
      nickname,
      address,
      score,
      img,
      content,
      _date,
      deadline,
    ],
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

router.get("/verify/:place", async (req, res) => {
  const receipt = await view_place_review(req.params.place);
  let reviews = [];
  receipt.map(async (id) => {
    db.query("select * from review where id = ?", [id], async (err, result) => {
      if (err) {
        console.log(err);
        res.send("SQL ERROR");
      } else {
        if (result.length > 0) {
          const sc_review = await view_review(id);
          console.log(sc_review);
          const review = {
            id: result[0].id,
            title: sc_review["2"],
            nickname: result[0].nickname,
            content: sc_review["3"],
            img: sc_review["4"],
            score: sc_review["5"],
            like: result[0]._like,
            date: result[0]._date,
          };
          reviews.push(review);
        }
      }
    });
  });

  setTimeout(() => {
    res.send(reviews);
  }, 100);
});

module.exports = router;
