var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Recommendation = mongoose.model('Recommendation', new Schema({ name: String, tags:[], factor: Number, type: Number /*0 Recommendations,1 Danger*/  }));


exports.fetch = function(req, res, next) {
  	Recommendation.find({type:req.params.type}).exec(function(err,recommendations){
		if(err){
			res.status(404).jsonp({"msg":err});
		}else if(recommendations){
			res.status(200).jsonp({"data":recommendations,"msg":""});
		}else{
			res.status(404).jsonp({"msg":(req.params.type==1?"Recommendations":"Danger Harms")+" not found"});
		}
	});
}

exports.save = function(req, res, next) {
  	var recommendation = {};
  	var query = {};
  	console.log("body", req.body)
  	if(req.body.tags){
		recommendation.tags=[];
		recommendation.tags=req.body.tags;
	}
	if(req.body.name)
		recommendation.name=req.body.name;
	if(req.body.factor)
		recommendation.factor=req.body.factor;
	if(req.body.type)
		recommendation.type=req.body.type;
	if(req.body.id){
		query['_id']=req.body.id
	}
  	if(recommendation){
  		if(query["_id"]){
			Recommendation.update(query,{$set:recommendation}).exec(function(err, rec){
	  			if(err){
	  				res.status(404).jsonp({"msg":err});
	  			}else{
	  				res.status(200).jsonp({"data":rec});
	  			}
	  		})
		}else{
			Recommendation(recommendation).save(function(err, rec){
				if(err){
	  				res.status(404).jsonp({"msg":err});
	  			}else{
	  				res.status(200).jsonp({"data":rec});
	  			}
			})
		}
  	}else{
  		if(query["_id"]){
  			res.status(404).jsonp({"msg":"Either type or tags or name is/are required to update the record"});
  		}else{
  			res.status(404).jsonp({"msg":"type, name and Tags are required"});	
  		}  		
  	}
}