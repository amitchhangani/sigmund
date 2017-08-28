var express = require('express');
var router = express.Router();
var token = require('../controllers/accessTokens')
var transcriptions = require('../controllers/transcriptions')
/* GET home page. */
router.post('/upload', transcriptions.uploadFile);

module.exports = router;
