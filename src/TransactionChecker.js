const PancakeABI = require('./abi/pancakeRouterAbi.json');
const TestPancakeABI = require('./abi/testPancakeRouterAbi.json');
const Web3 = require('web3');
var getJSON = require('get-json')
var moment = require('moment')
const open = require('open')

const TestWBNBAddress = '0xae13d989dac2f0debff460ac112a837c89baa7cd'
const testPrivateKey = '8daf0a408043730a6eed9f3cc48de3a1e0a3c2f330d7f6352593b8e1d947a184'

const apikey = 'CPJQKFY8Z7XK87FXZQCAWBRYIVA5BBW694';

module.exports = class TransactionChecker {
    testAddress = '0xD5775d2c72BCfB42ee1641F68c85F6f6163f3Fc4';    
    WBNBAddress = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
    web3;
    account;
    smartChain = 'https://bsc-dataseed.binance.org/';
    testChain = 'https://data-seed-prebsc-1-s1.binance.org:8545/';
    pancakeContract;
    currentPrivateKey;

    constructor(address, privateKey, isLive) {
        this.account = address.toLowerCase();
        this.currentPrivateKey = privateKey;
        if (isLive) {
            this.web3 = new Web3(new Web3.providers.HttpProvider(this.smartChain))
            this.pancakeContract = new this.web3.eth.Contract(PancakeABI.abi, PancakeABI.address);
        } else {
            this.WBNBAddress = this.TestWBNBAddress;
            this.web3 = new Web3(new Web3.providers.HttpProvider(this.testChain))
            this.pancakeContract = new this.web3.eth.Contract(TestPancakeABI.abi, TestPancakeABI.address);
        }
    }


    async getBNBBalance() {
        let balance = await this.web3.eth.getBalance(this.account);
        balance = this.web3.utils.fromWei(balance, 'ether');
        return balance;
    }

    toWei(value) {
        return this.web3.utils.toWei(value, 'ether');
    }

    toBN(value) {
        return this.web3.utils.toBN(value);
    }

    toHex(value) {
        return this.web3.utils.toHex(value);
    }

    fromWei(value) {
        return this.web3.utils.fromWei(value, 'ether');
    }

    async checkBlock() {
        let block = await this.web3.eth.getBlock('latest');
        console.log('searching block ' + block.number);
        for (let trxHash of block.transactions) {
            let trx = await this.web3.eth.getTransaction(trxHash);
            if (trx.to.toLowerCase() == ctrAddress) {
                console.log(trx);
            }
        }
        console.log(block.transactions[0]);
    }

    async checkPancakeMethod() {
        let pancke = await this.pancakeContract;
        console.log(pancke.methods.swapExactETHForTokensSupportingFeeOnTransferTokens())
    }

    async sendTransaction(to, amount) {
        let signedTrx = await this.web3.eth.accounts.signTransaction({
            to: to,
            value: this.toWei(amount),
            gas: 2000000
        }, this.currentPrivateKey)

        this.web3.eth.sendSignedTransaction(signedTrx.rawTransaction)
            .on('receipt', console.log);

    }


    async buyToken(amount, targetTokenAddress, gwei, gasLimit) {

        let pancakeRouter = await this.pancakeContract;

        var data = pancakeRouter.methods.swapExactETHForTokensSupportingFeeOnTransferTokens(
            this.toHex('0')
            , [WBNBAddress, targetTokenAddress]
            , this.account
            , this.getAdvanceTime());

        const tx = {
            from: this.account,
            to: PancakeABI.address,
            value: this.toWei(amount),
            gas: gasLimit,
            gasPrice: this.toGwei(gwei),
            data: data.encodeABI()
        };

        let signPromise = await this.web3.eth.accounts.signTransaction(tx, this.currentPrivateKey);
        this.web3.eth.sendSignedTransaction(signPromise.rawTransaction)
            .on('receipt',(res)=>{
                console.log(res.transactionHash);
                 open('https://bscscan.com/tx/'+res.transactionHash).then(()=>open('https://bscscan.com/tx/'+res.transactionHash, {app: 'google chrome'})) 
            }).on('error',(res)=>{
                var init = res.toString().search('transactionHash');
                var last = init + 88;
                console.log(res.toString().substring(init,last));
            });
    }

    toGwei(value) {
        //1,000,000,000
        return value * 1000000000;
    }

    getAdvanceTime() {
        return moment().add(15, 'minutes').valueOf();
    }

    hexToASCII(value) {
        return this.web3.utils.hexToASCII(value);
    }

    hexToNumber(value) {
        return this.web3.utils.hexToNumber(value);
    }


    async getContractAbi(targetContract) {
        var result;
        let url = 'https://api.bscscan.com/api?module=contract&action=getabi&address=' + targetContract + '&apikey=' + apikey;
        let json = await getJSON(url);
        var contractAbi = JSON.parse(json.result);
        var myContract = new this.web3.eth.Contract(contractAbi, ctrAddress);
        return myContract;
    }

}
// var trx = require('./TransactionChecker.js')

// let trxChecker = new trx(liveAddress, livePrivateKey, true);
// trxChecker.buyToken('.001','0x0e8d5504bf54d9e44260f8d153ecd5412130cabb', '20', '226593');
// trxChecker.getBNBBalance();
// let trxChecker = new TransactionChecker(testAddress,testPrivateKey,false);


// trxChecker.sendTransaction('0x63C01074aBEA1a4a3B5b08568324e7e20fE9E728','.1');



//const ctrAddress = '0x0e8d5504bf54d9e44260f8d153ecd5412130cabb'; // uncl