var express = require('express');
var router = express.Router();
var token = require('../controllers/accessTokens')
var transcriptions = require('../controllers/transcriptions')
/* GET home page. */
router.post('/upload/:userId', token.validateParamToken, transcriptions.uploadFile);
router.post('/fetchLiveRecordingData/:userId', token.validateParamToken, transcriptions.fetchLiveRecordingData);
router.post('/fetchLiveRecordingData/:userId/:type', token.validateParamToken, transcriptions.fetchLiveRecordingData);

module.exports = router;
