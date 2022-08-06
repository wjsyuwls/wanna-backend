var CaverExtKAS = require("caver-js-ext-kas");
var caver = new CaverExtKAS();
require("dotenv").config();

var accesskey = process.env.accesskey;
var secretaccesskey = process.env.secretaccesskey;
var chainId = 1001; //test net  , 8217번이 메인넷
caver.initKASAPI(chainId, accesskey, secretaccesskey); // KAS 초기화

var keyringContainer = new caver.keyringContainer();
var keyring = keyringContainer.keyring.createFromPrivateKey(
  process.env.privatekey
);
keyringContainer.add(keyring); //새로운 월렛 추가(KAS 지갑주소가 아닌 외부의 지갑 주소를 등록)

async function create_token() {
  var kip7 = await caver.kct.kip7.deploy(
    {
      name: "wanna", //토큰의 이름
      symbol: "WN2", //토큰의 심볼
      decimals: 0, //토큰 소수점자리
      initialSupply: 100000000, //토큰 발행량
    },
    keyring.address,
    keyringContainer
  );
  console.log(kip7._address);
}
create_token();
