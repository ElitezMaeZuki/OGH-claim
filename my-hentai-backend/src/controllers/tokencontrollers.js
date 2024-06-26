const config = require('../../utils/config/config');
const { web3, account } = require('../../utils/web3');
const tokenABI = require('../path/to/your/tokenABI.json'); // Adjust the path as necessary
const axios = require('axios');

const tokenContract = new web3.eth.Contract(tokenABI, config.tokenAddress);

const claimTokens = async (req, res) => {
  const { address, recaptchaToken } = req.body;

  // Verify reCAPTCHA
  const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${config.recaptchaSecretKey}&response=${recaptchaToken}`;
  const response = await axios.post(verifyUrl);
  if (!response.data.success) {
    return res.status(400).json({ error: 'reCAPTCHA verification failed' });
  }

  // Send tokens
  try {
    const tx = tokenContract.methods.transfer(address, web3.utils.toWei('696', 'ether'));
    const gas = await tx.estimateGas({ from: account.address });
    const gasPrice = await web3.eth.getGasPrice();
    const data = tx.encodeABI();

    const txData = {
      from: account.address,
      to: config.tokenAddress,
      data,
      gas,
      gasPrice,
    };

    const receipt = await web3.eth.sendTransaction(txData);
    res.json({ success: true, receipt });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { claimTokens };
