const Web3 = require('web3');
const config = require('../config/config');

const web3 = new Web3(`https://cronos-mainnet.infura.io/v3/${config.infuraProjectId}`);

const account = web3.eth.accounts.privateKeyToAccount(config.privateKey);
web3.eth.accounts.wallet.add(account);

module.exports = { web3, account };
