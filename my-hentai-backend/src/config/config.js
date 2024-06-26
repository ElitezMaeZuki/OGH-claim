require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  infuraProjectId: process.env.INFURA_PROJECT_ID,
  privateKey: process.env.PRIVATE_KEY,
  tokenAddress: process.env.TOKEN_ADDRESS,
  recaptchaSecretKey: process.env.RECAPTCHA_SECRET_KEY,
};
