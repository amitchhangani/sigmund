var mongoose = require('mongoose');
var Schema = mongoose.Schema;
/* GET users listing. */
var Patient = mongoose.model('Patient', new Schema({ name: String, email: String}));
var Transcript = require('./../model/transcript');
var Transcript_data = require('./../model/transcript_data');

var user = require("./users");
var User = user.User;


// exports.addPatient = function(req, res, next) {
// 	var pt = new Patient({name : req.body.name, email : req.body.email});
// 	pt.save(function(err,data){
// 		if(err){
// 			res.status(401).jsonp({"msg":err})
// 		} else {
// 			if(data){
// 				res.status(200).jsonp({"data":data,"msg":"User Added"})
// 			}
// 		}
// 	})  
// }


	// Patient({name:"laxman", email:"laxmansingh@gmail.com"}).save();

exports.getAllPatients = function(req,res){

	data1 = [];
	User.find({}).exec(function(err,data){
		if(err){
			res.status(401).jsonp({msg: err})
		}else {
			if(data.length){
				var userArr = [];
				for(var a in data){
					userArr.push(data[a]._id);
				}
				Transcript.find({user_id: {$in : userArr}}).populate('patient_id').populate('user_id').exec(function(error,pData){
					if(!error) {
						for(var i in data){
								var userPatient = {user : {},patientCount : null}
							var countPatient = 0;
							for(var j in pData){
								if(data[i]._id.toString() == pData[j].user_id._id.toString() ){
									
									countPatient = countPatient+1;
								}
							}
							if(countPatient){
								userPatient.user = data[i];
								userPatient.patientCount = countPatient;
								data1.push(userPatient);
							}
						}
						res.status(200).jsonp({data: data1});
					}
				})
			}else {
				res.status(200).jsonp({msg: "No record found"})
			}
		}
	})
}


exports.userPatient = function(req,res){
	Transcript.find({user_id: req.params.userId}).populate('patient_id').exec(function(err,data){
		if(err){
			res.status(404).jsonp({msg: err})
		}else {
			if(data.length){
				res.status(200).jsonp({data : data});
			}else {
				res.status(404).jsonp({msg: "No record found"});
			}
		}
	})
}


exports.add = function(req, res, next) {
	console.log("here", req.body);

	if(req.body.name && req.body.email){
		Patient.findOne({email:req.body.email}).exec(function(err,patient){
			if(err){
				res.status(401).jsonp({"msg":err});
			}else{
				if(patient){
					res.status(401).jsonp({"msg":"Patient already exists!"});		
				}else{
					Patient({name:req.body.name, email:req.body.email}).save(function(err,user){
						if(err){
							res.status(401).jsonp({"msg":err});
						}else{
							res.status(200).jsonp({"data":user,"msg":""});	
						}
					})
				}
			}
		})				
	}else{
		res.status(401).jsonp({"msg":"Name and Email are required"});
	}    
}

exports.get = function(req, res, next) {
	Patient.findOne({_id:req.params.patientId}).exec(function(err,patient){
		if(err){
			res.status(401).jsonp({"msg":err});	
		}else if(patient){
			res.status(200).jsonp({"data":patient,"msg":""});
		}else{
			res.status(401).jsonp({"msg":"User doesnt exists"});	
		}
	})
}

exports.fetchAll = function(req, res, next) {
	Patient.find({}).exec(function(err,Patient){
		if(err){
			res.status(401).jsonp({"msg":err});	
		}else if(Patient){
			res.status(200).jsonp({"data":Patient,"msg":""});
		}else{
			res.status(401).jsonp({"msg":"User doesnt exists"});	
		}
	})
}

exports.update = function(req, res, next) {
	Patient.findOne({_id:req.params.patientId}).exec(function(err,patient){
		if(err){
			res.status(401).jsonp({"msg":err});	
		}else if(patient){
			patient.name = req.body.name;
			patient.email = req.body.email;
			patient.save(function(err, update){
				if(!err){
					if(update){
						console.log("data",patient)
						res.status(200).jsonp({"data":patient,"msg":""});
					}
				}
			});

		}else{
			res.status(401).jsonp({"msg":"Patient doesnt exists"});	
		}
	})
}

exports.delete = function(req, res, next) {
	console.log("req.",req.params.patientId);
	Patient.remove({_id:req.params.patientId}).exec(function(err,patient){
		if(err){
			res.status(401).jsonp({"msg":err});	
		}else if(patient){
			res.status(200).jsonp({"msg":"Patient deleted"});	
		}
	})
}

exports.getTranscription = function(req,res){
	console.log("heheheh",req.params.patientId);
	Transcript_data.find({ transcript_id : req.params.patientId}).exec(function(error,tData){
		if(error){
			res.status(404).jsonp({"msg":error});
		}else{
			if(tData) {
				res.status(200).jsonp({data : tData})
			} else {
				res.status(404).jsonp({"msg": "Patient data not available"});
			}
		}			
	})
}

// exports.getAllTranscription = function(req,res){
// 	Transcript.find({patient_id : req.params.patientId}).exec(function(err,data){
// 		if(err){
// 			res.status(404).jsonp({"msg":err});	
// 		}else {
// 			if(data) {
// 				//console.log("data",data.length)
// 				var uArr = [];
// 				for(var a in data){
// 					uArr.push(data[a]._id);
// 				}
// 			Transcript_data.find({ transcript_id : {$in : uArr}}).exec(function(error,tData){
// 				if(error){
// 					res.status(404).jsonp({"msg":error});
// 				}else{
// 					if(tData) {
// 						//console.log(tData.length);
// 						res.status(200).jsonp({data : tData})
// 					} else {
// 						res.status(404).jsonp({"msg": "Patient data not available"});
// 					}
// 				}			
// 			})
// 		}else {
// 			res.status(404).jsonp({"msg": "Patient data not available"});
// 		}
// 		}
// 	})
// }

exports.getAllTranscription = function(req,res){
	Transcript.find({patient_id : req.params.patientId}).exec(function(err,data){
		if(err){
			res.status(404).jsonp({"msg":err});	
		}else {
			if(data) {
				var uArr = [];
				transcriptArr = [];
				for(var a in data){
					uArr.push(data[a]._id);
				}
			Transcript_data.find({ transcript_id : {$in : uArr}}).exec(function(error,tData){
				if(error){
					res.status(404).jsonp({"msg":error});
				}else{
					if(tData) {
						for(var a in uArr){
								var tempArr = [];
							for(var b in tData){
								if( uArr[a].toString() === tData[b].transcript_id.toString() ){
									tempArr.push(tData[b]);
								}
							}
							// console.log("==================")
							// console.log("transcriptArr",tempArr);
							// console.log("==================")
							transcriptArr.push(tempArr);
						}
						res.status(200).jsonp({data : transcriptArr})
					} else {
						res.status(404).jsonp({"msg": "Patient data not available"});
					}
				}			
			})
		}else {
			res.status(404).jsonp({"msg": "Patient data not available"});
		}
		}
	})
}
