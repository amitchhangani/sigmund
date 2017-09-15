var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User;
/* GET users listing. */
exports.User = User = mongoose.model('User', new Schema({ name: String, email: String, password: String, socketId:{type:String, default:""} }));


exports.login = function(req, res, next) {
	if(req.body.email && req.body.password){
		User.findOne({email:req.body.email,password:req.body.password}).exec(function(err,user){
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
					User({name:req.body.name, email:req.body.email, password:req.body.password}).save(function(err,user){
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
			user.socketId=socketId;
			user.save();
		}
	})
}

exports.updateUser = function(req,res){
	User.findOne({_id:req.params.userId}).exec(function(err, user){
		if(!err){
			user.email = req.body.email;
			user.password = req.body.password;
			user.name = user.name;
			user.save();
			res.status(200).jsonp({msg:user});
		}
	})
}

exports.delete = function(req,res){
	console.log("here");
	User.remove({_id:req.params.userId}).exec(function(err, user){
		if(!err){
			res.send({msg: user});
		}
	})
}
