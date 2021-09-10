// Importing http module
const http = require("http")
var fs = require('fs');
var url = require('url');
var trxChecker = require('./src/TransactionChecker');
require('dotenv').config()


const liveAddress = process.env.LIVE_ADDRESS;
const livePrivateKey = process.env.LIVE_PRIVATEKEY;

// Creating Server
const server = http.createServer((req, res) => {
  req.statusCode = 200;

  var q = url.parse(req.url, true).query;

  buyToken(q.address, q.amount, q.gwei, q.gas);
  fs.readFile('./src/TransactionChecker.html', function (err, data) {
    res.writeHead(200, { 'Content-Type': 'text/html', 'Content-Length': data.length });
    res.write(data);
    res.end();
  });
});

function buyToken(targetContract, amount, gwei, gas) {
  if (isValid(targetContract) && isValid(amount) && isValid(gwei) && isValid(gas)) {
    var trx = new trxChecker(liveAddress, livePrivateKey,true);
    console.log('buying: ', targetContract)
    trx.buyToken(amount, targetContract, gwei, gas).catch(e=>console.log(e));
  }else{
    if(!isValid(targetContract)){console.log(' invalid targetContract',targetContract)}
    if(!isValid(amount)){console.log('invalid amount',amount)}
    if(!isValid(gwei)){console.log('invalid gwei',gwei)}
    if(!isValid(gas)){console.log('invalid gas',gas)}
  }

}

function isValid(value){
  return value !== undefined && value !=null && value.trim() !='';
}


// Executing the server
server.listen(3000, "localhost", () => {
  console.log("Server is Running ")
})