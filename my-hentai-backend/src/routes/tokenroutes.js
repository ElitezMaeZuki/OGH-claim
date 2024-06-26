const express = require('express');
const { claimTokens } = require('../src/controllers/tokenController');

const router = express.Router();

router.post('/claim', claimTokens);

module.exports = router;
