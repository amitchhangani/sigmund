var express = require('express');
var router = express.Router();
var user = require('../controllers/users')
var token = require('../controllers/accessTokens')



router.post('/login', user.login, token.getToken);

router.post('/register', user.register);

router.get('/getMe', token.getUser);

router.get('/:userId', user.fetch);

module.exports = router;
