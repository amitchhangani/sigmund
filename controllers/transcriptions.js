var mongoose = require('mongoose');
var path = require('path');
var Schema = mongoose.Schema;
var multer = require('multer');
var upload = multer({ dest: 'uploads/'});
var SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1');
var fs = require('fs');
request = require('request-json');
var client = request.createClient('http://localhost:3000');
var speech_to_text = new SpeechToTextV1({
	username: 'e7e41131-81b3-47be-8525-f4065fc5314e',
	password: 'q8D4DqkC3BOr'
});
var recommendation = require('./recommendations');

var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');

// Create the service wrapper
var toneAnalyzer = new ToneAnalyzerV3({
  // If unspecified here, the TONE_ANALYZER_USERNAME and TONE_ANALYZER_PASSWORD environment properties will be checked
  // After that, the SDK will fall back to the bluemix-provided VCAP_SERVICES environment property
  username: '73ab9669-5393-4ee4-a32c-c7de4cdec26d',
  password: 'jDuUGZAJi0sd',
  version_date: '2016-05-19'
});

const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
const nlu = new NaturalLanguageUnderstandingV1({
	username: '2415dec1-4d5d-4968-80b8-8ea909b1da4a',
  	password: 'ISSsONvpTnbq',
  	version_date: NaturalLanguageUnderstandingV1.VERSION_DATE_2016_01_23
});

var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })
var Utils = require('util');

/*var Transcription = mongoose.model('Transcription', new Schema({
	user: { type: Schema.Types.ObjectId, ref: 'Story' },
	tags:[],
	factor: Number,
	type: Number //0 Recommendations,1 Danger
}));
*/

exports.uploadFile = function (req, res, next) {
	
	var storage = multer.diskStorage({
		destination: function(req, file, callback) {

			callback(null, './uploads')
		},
		filename: function(req, file, callback) {
			callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
			res.status(200).jsonp({"msg":"success"});
		}
	})



	var upload = multer({
		storage: storage
	}).single('file')
	upload(req, res, function(err) {
		var params = {
			'model': 'en-US_NarrowbandModel',
			'content_type': req.file.mimetype,
			'interim_results': true,
			'max_alternatives': 3,
			'word_confidence': false,
			'speakerLabels': true,
			'formattedMessages': [],
			'timestamps': false,
			'speaker_labels': true,
			'keywords': ['colorado', 'tornado', 'tornadoes'],
			'keywords_threshold': 0.5
		};
		// Create the stream.
		var recognizeStream = speech_to_text.createRecognizeStream(params);
		// Pipe in the audio.
		fs.createReadStream(req.file.path).pipe(recognizeStream);
		// Pipe out the transcription to a file.
		recognizeStream.pipe(fs.createWriteStream('transcription.txt'));
		// Get strings instead of buffers from 'data' events.
		recognizeStream.setEncoding('utf8');
		// Listen for events.
		recognizeStream.on('results', function (event) {
			onEvent('Results:', event);
		});
		recognizeStream.on('data', function (event) {
			onEvent('Data:', event);
		});
		recognizeStream.on('error', function (event) {
			onEvent('Error:', event);
		});
		recognizeStream.on('close', function (event) {
			onEvent('Close:', event);
		});
		recognizeStream.on('speaker_labels', function (event) {
			onEvent('Speaker_Labels:', event);
		});
		var speaker=0;
		var transcript="";
		var oldTrans="";
		var toneCount=1;
		var oldTone={};
		var trs="";
		function onEvent(name, event) {

			//console.log('===****===\n\n',Utils.inspect(event,false,null),'\n\n===****===');
			var result = JSON.parse(JSON.stringify(event));
			//console.log("result",result.results);
			if(name=="Results:"){
				//var result=;
				if(result.results[result.results.length-1].final){
					transcript=result.results[result.results.length-1].alternatives[0].transcript;
				}
			}
			//console.log(result.speaker_labels);
			if(name=="Speaker_Labels:"){
				speaker=result.speaker_labels[result.speaker_labels.length-1].speaker;
				if(transcript!=oldTrans){
					trs+=" "+transcript;
					process.emit('watson',{speaker,transcript})
					if(speaker!=0){
						recommendation.fetchAll(trs);
						nlu.analyze({"features":{"sentiment":{}},"text":trs}, function(err, data){
							if(!err){
								process.emit('sentiment',data.sentiment);
							}
						})
						toneAnalyzer.tone({text:transcript}, function(err, data) {
						    if (err) {
						      return next(err);
						    }						    
						    if(oldTone.length){
						    	for(var i=0; i<oldTone.length; i++){
						    		oldTone[i].score=oldTone[i].score*toneCount;
						    		oldTone[i].score+=data.document_tone.tone_categories[0].tones[i].score;
						    		oldTone[i].score/=(toneCount+1)
						    	}
						    	process.emit('tone',oldTone);
						    }else{
						    	process.emit('tone',data.document_tone.tone_categories[0].tones)
						    	oldTone=data.document_tone.tone_categories[0].tones;	
						    }    
						    toneCount++;
						});
					}

				}
				//transcript="";
				oldTrans=transcript;
				speaker=0;
			}

			//console.log('===****===\n\n',Utils.inspect(datatToSend,false,null),'\n\n===****===');

		};

	})





	/*Recommendation.find({type:req.params.type}).exec(function(err,recommendations){
		if(err){
			res.status(404).jsonp({"msg":err});
		}else if(recommendations){
			res.status(200).jsonp({"data":recommendations,"msg":""});
		}else{
			res.status(404).jsonp({"msg":(req.params.type==1?"Recommendations":"Danger Harms")+" not found"});
		}
	});*/
}

exports.fetchLiveRecordingData = function (req,res){
	var trs = req.body.trs;
	var transcript = req.body.transcript;
	recommendation.fetchAll(trs);
	var oldTone={};
	nlu.analyze({"features":{"sentiment":{}},"text":trs}, function(err, data){
		if(!err){
			process.emit('sentiment',data.sentiment);
		}
	})
	toneAnalyzer.tone({text:transcript}, function(err, data) {
		var toneCount=1;
	    if (err) {
	      return next(err);
	    }						    
	    if(oldTone.length){
	    	for(var i=0; i<oldTone.length; i++){
	    		oldTone[i].score=oldTone[i].score*toneCount;
	    		oldTone[i].score+=data.document_tone.tone_categories[0].tones[i].score;
	    		oldTone[i].score/=(toneCount+1)
	    	}
	    	process.emit('tone',oldTone);
	    }else{
	    	process.emit('tone',data.document_tone.tone_categories[0].tones)
	    	oldTone=data.document_tone.tone_categories[0].tones;	
	    }    
	    toneCount++;
	});
	res.status(200).jsonp({"msg":"success"})
}
