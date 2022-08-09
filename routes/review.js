const express = require("express");
const router = express.Router();
const moment = require("moment");
require("dotenv").config();
const multer = require("multer");

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

router.get("/", async (req, res) => {
  const mergeReviews = () => {
    return new Promise((resolve, reject) => {
      db.query("select * from review", [], async (err, result) => {
        if (err) {
          console.log(err);
          res.send("SQL ERROR");
          reject(err);
        } else {
          if (result.length > 0) {
            const data = await Promise.all(
              result.map(({ id }) => view_voting(id))
            );
            let reviews = [];
            data.map((review, i) =>
              reviews.push({
                ...result[i],
                Agree: review.Agree,
                Disagree: review.Disagree,
                Count: review.Count,
              })
            );
            resolve(reviews);
          } else {
            resolve([]);
          }
        }
      });
    });
  };
  const data = await mergeReviews();
  res.send(data);
});

//파일 업로드
let storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploadedFiles/");
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}__${file.originalname}`);
  },
});
var upload = multer({ dest: "uploadedFiles/" });
var uploadWithOriginalFilename = multer({ storage: storage });

//리뷰 추가+파일 업로드
router.post("/add", uploadWithOriginalFilename.single("img"), (req, res) => {
  const place_name = req.body.place_name;
  const title = req.body.title;
  const nickname = req.body.nickname;
  const address = req.body.address;
  const score = req.body.score;
  const img = req.file.path;
  const content = req.body.content;
  const _date = moment().format("YYYY/MM/DD HH:mm:ss");
  const deadline = moment().add(7, "days").format("YYYY/MM/DD HH:mm:ss");

  console.log("장소", place_name);
  console.log("제목", title);
  console.log("닉네임", nickname);
  console.log("점수", score);
  console.log("내용", content);
  console.log("등록일", _date);
  console.log("마감일", deadline);
  console.log("사진", img);

  console.log(img.split("/"));

  db.query(
    "insert into review (place_name, title, nickname, address, score, img, content, _date, deadline) values (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      place_name,
      title,
      nickname,
      address,
      score,
      img,
      //path.normalize("http://localhost:3001/" + img),
      content,
      _date,
      deadline,
    ],
    (err) => {
      if (err) {
        console.log(err);
        res.send("SQL ERROR");
      } else {
        console.log("데이터 삽입 성공!!");
      }
    }
  );
});

router.get("/verify/:place", async (req, res) => {
  const receipt = await view_place_review(req.params.place);

  const getReviews = (id) => {
    return new Promise((resolve, reject) => {
      db.query(
        "select * from review where id = ?",
        [id],
        async (err, result) => {
          if (err) {
            console.log(err);
            res.send("SQL ERROR");
            reject(error);
          } else {
            if (result.length > 0) {
              const sc_review = await view_review(id);
              // console.log(sc_review);
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
              resolve(review);
            }
          }
        }
      );
    });
  };

  const data = await Promise.all(receipt.map((id) => getReviews(id)));
  res.send(data);
});

module.exports = router;
