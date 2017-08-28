var jwt = require('jsonwebtoken');
var encKey='shhhhh';

//backdate a jwt 30 seconds 
//var older_token = jwt.sign({ foo: 'bar', iat: Math.floor(Date.now() / 1000) - 30 }, 'shhhhh');

exports.getToken = function(req, res, next){
	var token = jwt.sign(req.user, encKey);	
	var user = {};
	user.token=token;
	user.name=req.user.name;
	user.email=req.user.email;
	user._id=req.user._id;
	res.status(200).jsonp({"data":user,"msg":""});
}

exports.getUser = function(req, res, next){	
	if(req.headers.authorization){
		var token = req.headers.authorization.substr(7)
		jwt.verify(token, encKey, function(err, decoded) {
			if(err){
				res.status(401).jsonp({"msg":err});
			}else{
				res.status(200).jsonp({"data":decoded["_doc"]});
			}  
		});
	}else{
		res.status(401).jsonp({"msg":"Token is required"});
	}	
}

exports.validateToken = function(req, res, next){	
	if(req.headers.authorization){
		var token = req.headers.authorization.substr(7)
		jwt.verify(token, encKey, function(err, decoded) {
			if(err){
				res.status(401).jsonp({"msg":err});
			}else{
				req.user=decoded["_doc"];
				next();
			}  
		});
	}else{
		res.status(401).jsonp({"msg":"Token is required"});
	}	
}