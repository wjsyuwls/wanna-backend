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

// setting klaytn
// var CaverExtKAS = require("caver-js-ext-kas");
// var caver = new CaverExtKAS();

// var keyringContainer = new caver.keyringContainer();
// var keyring = keyringContainer.keyring.createFromPrivateKey(
//   process.env.privatekey
// );
// keyringContainer.add(keyring);

// var accesskey = process.env.accesskey;
// var secretaccesskey = process.env.secretaccesskey;
// var chainId = 1001; //test net  , 8217 -> main net
// caver.initKASAPI(chainId, accesskey, secretaccesskey); // KAS reset
// var kip7 = new caver.kct.kip7(process.env.ki7_address);
// kip7.setWallet(keyringContainer); // in kip7 wallet setting
// finish setting klaytn

// connect klaytn contract
var Caver = require("caver-js");
var cav = new Caver("https://api.baobab.klaytn.net:8651");
var product_contract = require("../build/vote.json");
var smartcontract = new cav.klay.Contract(
  product_contract.abi,
  process.env.contract_account
);

// connect token contract
var token_contract = require("../build/token.json");
var tokencontract = new cav.klay.Contract(
  token_contract.abi,
  "0xf0Adb6176637f063e673b44090a3e120389E9A7C"
);

// wanna master account
var master_account = cav.klay.accounts.createWithAccountKey(
  process.env.address,
  process.env.privatekey
);
cav.klay.accounts.wallet.add(master_account);

// send token f
async function token_trans(address) {
  const receipt = await tokencontract.methods
    .transferFrom(address, master_account.address, 10)
    .send({
      from: master_account.address,
      gas: 2000000,
    });
  return receipt;
}

// send reward f
async function reward_trans(address, amount) {
  const receipt = await tokencontract.methods
    .transferFrom(master_account.address, address, amount)
    .send({
      from: master_account.address,
      gas: 2000000,
    });
  return receipt;
}

// get balance f
async function balanceOf(address) {
  const receipt = await tokencontract.methods.balance(address).call();
  return receipt;
}

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

// user token > 10
router.get("/balance/:account", function (req, res) {
  const address = req.params.account;
  balanceOf(address).then((balance) => {
    if (balance >= 10) {
      res.send({ enough: true, message: "enough token", balance: balance });
    } else {
      res.send({ enough: false, message: "lack token", balance: balance });
    }
  });
});

// vote deadline, user vote repeated filter
router.get("/check/:id/:account", (req, res) => {
  const id = req.params.id;
  const account = req.params.account;

  db.query("select * from review where id = ?", [id], (err, result) => {
    if (err) {
      console.log(err);
      res.send("SQL ERROR");
    } else {
      // deadline
      const end = moment(result[0].deadline, "YYYY/MM/DD HH:mm:ss");
      // vote time
      const now = moment(
        moment().format("YYYY/MM/DD HH:mm:ss"),
        "YYYY/MM/DD HH:mm:ss"
      );

      const gap = end.diff(now, "milliseconds");
      console.log(gap);

      // vote end not yet
      if (gap > 0) {
        view_voting(id).then(({ Agree, Disagree }) => {
          const addersses = [...Agree, ...Disagree];
          if (addersses.some((d) => d.toLowerCase() === account)) {
            return res.send({
              existed: true,
              message: "already vote",
            });
          } else {
            return res.send({
              existed: false,
              message: "not yet vote",
            });
          }
        });
      } else {
        // end vote
        res.send({ end: true, message: "end vote" });
      }
    }
  });
});

// user send 10 token to master
router.post("/transfer", (req, res) => {
  const address = req.body.address;
  console.log(address);

  token_trans(address).then((result) => {
    console.log(result);
    res.send(result);
  });
});

// test
router.post("/transTest", async (req, res) => {
  const address = req.body.address;
  console.log(address);

  await tokencontract.methods
    .transferFrom(master_account.address, address, 10)
    .send({
      from: master_account.address,
      gas: 2000000,
    })
    .then(async (receipt) => {
      await balanceOf(address).then((balance) => {
        res.send(balance);
      });
    });
});

// vote
router.post("/", (req, res) => {
  const id = req.body.id;
  const _a_d = req.body._a_d;
  const address = req.body.address;

  smartcontract.methods
    .add_voting(id, _a_d, address)
    .send({
      from: master_account.address, // master pay gas
      gas: 2000000,
    })
    .then((receipt) => {
      res.send(receipt);
    });
});

// progress
router.get("/progress/:id", (req, res) => {
  view_voting(req.params.id).then(({ Agree, Disagree, Count }) => {
    res.send({ Agree: Agree, Disagree: Disagree, Count: Count });
  });
});

// pay reward
router.get("/reward/:id", async (req, res) => {
  const votingResult = await view_voting(req.params.id);
  const { Agree, Disagree, Count } = votingResult;

  if (Agree.length > Disagree.length) {
    const amount = (Count * 10) / Agree.length;
    const chanining = await tokencontract.methods.transferFromMulti(
      master_account.address,
      [...Agree],
      amount
    );
    await chanining.send({
      from: master_account.address,
      gas: 2000000,
    });

    res.send({ verify: true });
  } else {
    const amount = (Count * 10) / Disagree.length;
    const chanining = await tokencontract.methods.transferFromMulti(
      master_account.address,
      [...Disagree],
      amount
    );
    await chanining.send({
      from: master_account.address,
      gas: 2000000,
    });

    res.send({ verify: false });
  }
});

// review verify success
router.post("/verify", async (req, res) => {
  const id = req.body.id;
  const writer = req.body.writer;
  const place = req.body.place;
  const title = req.body.title;
  const content = req.body.content;
  const img = req.body.img;
  const score = req.body.score;

  await smartcontract.methods
    .add_review(id, writer, place, title, content, img, score)
    .send({
      from: master_account.address, // master pay gas
      gas: 2000000,
    })
    .then(() => [
      db.query(
        "update review set verify = 1 where id = ?",
        [id],
        (err, result) => {
          if (err) {
            console.log(err);
            res.send("SQL ERROR");
          } else {
            if (result) {
              res.send("verify success");
            }
          }
        }
      ),
    ])
    .catch(() => res.sendStatus(500));
});

module.exports = router;
