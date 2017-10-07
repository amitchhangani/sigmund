var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User;
var multer = require('multer');
var path = require('path');
var upload = multer({
	dest: 'public/uploads/therapist'
});
/* GET users listing. */
exports.User = User = mongoose.model('User', new Schema({ name: String, email: String, image : String, password: String, socketId:[] }));


exports.login = function(req, res, next) {
	if(req.body.email && req.body.password){
		User.findOne({email:req.body.email,password:req.body.password}).exec(function(err,user){
			console.log("lllllloooooooogggggggo",user);
			if(err){
				res.status(401).jsonp({"msg":err});	
			}else if(user){
				req.user=user;
				next();
			}else{
				res.status(401).jsonp({"msg":"Email and password do not match"});	
			}
		})		
	}else{
		res.status(401).jsonp({"msg":"Email and password are required"});
	}    
}

exports.register = function(req, res, next) {
	if(req.body.email && req.body.password && req.body.name){
		User.findOne({email:req.body.email}).exec(function(err,user){
			if(err){
				res.status(401).jsonp({"msg":err});
			}else{
				if(user){
					res.status(401).jsonp({"msg":"Email already exists!"});		
				}else{
					User({name:req.body.name, email:req.body.email, password:req.body.password, image : req.body.image}).save(function(err,user){
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
		res.status(401).jsonp({"msg":"Name, Email and password are required"});
	}    
}

exports.fetch = function(req, res, next) {
	User.findOne({_id:req.params.userId}).exec(function(err,user){
		if(err){
			res.status(401).jsonp({"msg":err});	
		}else if(user){
			res.status(200).jsonp({"data":user,"msg":""});
		}else{
			res.status(401).jsonp({"msg":"User doesnt exists"});	
		}
	})
}

exports.fetchAll = function(req, res, next) {
	User.find({}).exec(function(err,user){
		if(err){
			res.status(401).jsonp({"msg":err});	
		}else if(user){
			res.status(200).jsonp({"data":user,"msg":""});
		}else{
			res.status(401).jsonp({"msg":"User doesnt exists"});	
		}
	})
}

exports.update = function(user,socketId){
	User.findOne({_id:user._id}).exec(function(err, user){
		if(!err){
			if(user.socketId){
				if(typeof user.socketId == 'object'){
					user.socketId.push(socketId);
				} else if(typeof user.socketId == 'string'){
					delete user.socketId;
					user.socketId=[];
					user.socketId.push(socketId);							
				} else {				
					user.socketId=[];
					user.socketId.push(socketId);							
				}	
			} else {				
				user.socketId=[];
				user.socketId.push(socketId);							
			}
			user.save();
		}
	})
}

exports.updateUser = function(req,res){
	User.findOne({_id:req.params.userId}).exec(function(err, user){
		if(!err){
			user.email = req.body.email;
			user.password = req.body.password;
			user.name = req.body.name;
			user.image = req.body.image;
			user.save(function(err,data){
				if(err){
					res.status(404).jsonp({msg:err});
				}else {
					if(data){
						res.status(200).jsonp({msg:data});
					}
				}
			});
		}
	})
}

exports.delete = function(req,res){
	User.remove({_id:req.params.userId}).exec(function(err, user){
		if(!err){
			res.send({msg: user});
		}
	})
}


exports.uploadFile = function(req, res) {
	var file_path;
	var mime_type;
	var storage = multer.diskStorage({
		destination: function(req, file, callback) {
			callback(null, './public/uploads/therapist')
		},
		filename: function(req, file, callback) {
			var file_name = file.fieldname + '-' + Date.now() + path.extname(file.originalname);
			callback(null, file_name)
			  res.status(200).jsonp({
					"msg": "success",
					"file_name":file_name
				});
		}
	})
	var upload = multer({
		storage: storage
	}).single('file')
	upload(req, res, function(err) {
	})
}