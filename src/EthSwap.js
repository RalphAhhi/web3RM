const UniSwapABI = require('./abi/uniswapRouterAbi.json');
const Web3 = require('web3');
var moment = require('moment')
const open = require('open')


module.exports = class TransactionChecker {
    WETHAddress = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
    TEST_WETH = '0xc778417E063141139Fce010982780140Aa0cD5Ab';
    WETH='';
    web3;
    account;
    uniswapChain = 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161';
    ropstenChain = 'https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161';
    swapContract;
    currentPrivateKey;

    constructor(address, privateKey, isLive) {
        this.account = address.toLowerCase();
        this.currentPrivateKey = privateKey;
        if(isLive){
            this.WETH = this.WETHAddress;
            this.web3 = new Web3(new Web3.providers.HttpProvider(this.uniswapChain))
            this.swapContract = new this.web3.eth.Contract(UniSwapABI.abi, UniSwapABI.address);
        }else{
            this.WETH = this.TEST_WETH;
            this.web3 = new Web3(new Web3.providers.HttpProvider(this.ropstenChain))
            this.swapContract = new this.web3.eth.Contract(UniSwapABI.abi, UniSwapABI.address);
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

    async buyToken(amount, targetTokenAddress, gwei, gasLimit) {

        let swapContract = await this.swapContract;
        console.log(this.WETH);
        var data = swapContract.methods.swapExactETHForTokensSupportingFeeOnTransferTokens(
            this.toHex('0')
            , [this.WETH,targetTokenAddress]
            , this.account
            , this.getAdvanceTime());

        const tx = {
            from: this.account,
            to: UniSwapABI.address,
            value: this.toWei(amount),
            gas: gasLimit,
            gasPrice: this.toGwei(gwei),
            data: data.encodeABI()
        };

        let signPromise = await this.web3.eth.accounts.signTransaction(tx, this.currentPrivateKey);
        this.web3.eth.sendSignedTransaction(signPromise.rawTransaction)
            .on('receipt',(res)=>{
                console.log(res.transactionHash);
                 open('https://etherscan.io/tx/'+res.transactionHash).then(()=>open('https://etherscan.io/tx/'+res.transactionHash, {app: 'google chrome'})) 
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


}