var express = require('express');
var router = express.Router();
var user = require('../controllers/users')
var token = require('../controllers/accessTokens')
var patient = require('../controllers/patient')


router.post('/add', patient.add);

router.get('/get/:patientId', patient.get);

router.get('/fetch_all', patient.fetchAll);

router.get('/user_patient/:userId', patient.userPatient);

router.delete('/delete/:patientId', patient.delete);

router.put('/update/:patientId', patient.update);

router.get('/patient_transcription/:patientId', patient.getTranscription);

module.exports = router;
