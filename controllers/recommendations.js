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

var transcript='';

exports.fetchAll = function(text) {
	transcript=text;
	var result = [];
	var danger = [];
	var resulti=0;
	var dangeri=0;
	Recommendation.find({type:2}).exec(function(err,recommendations){
		if(recommendations){
			for(var i=0; i<recommendations.length; i++){
				dangeri=i;
				danger.push({"name":recommendations[dangeri].name, tags:[], count:0});
				for(var j=0; j<recommendations[dangeri].tags.length; j++){
					if((transcript.split(recommendations[dangeri].tags[j].value).length-1)>0){
						danger[dangeri].count+=transcript.split(recommendations[dangeri].tags[j].value).length-1;
						danger[dangeri].percent=danger[dangeri].count*(recommendations[dangeri].factor)*100;
						danger[dangeri].tags.push({"tag":recommendations[dangeri].tags[j].value, "count":transcript.split(recommendations[dangeri].tags[j].value).length-1});
					}						
				}
			}
			var d=0;
			var x=0;
			for(var i=0; i<danger.length; i++){
				if(danger[i].tags.length){
					d+=danger[i].percent;
					x++;
				}
			}
			process.emit('danger',(d/x));
		}		
	});
  	Recommendation.find({type:1}).exec(function(err,recommendations){
		if(recommendations){
			for(var i=0; i<recommendations.length; i++){
				resulti=i;
				result.push({"name":recommendations[resulti].name,tags:[], count:0});
				for(var j=0; j<recommendations[resulti].tags.length; j++){
					if((transcript.split(recommendations[resulti].tags[j].value).length-1)>0){
						result[resulti].count+=transcript.split(recommendations[resulti].tags[j].value).length-1;
						result[resulti].percent=result[resulti].count*(recommendations[resulti].factor)*100;
						result[resulti].tags.push({"tag":recommendations[resulti].tags[j].value, "count":transcript.split(recommendations[resulti].tags[j].value).length-1});
					}						
				}				
			}			
			process.emit('recommendations',result);
		}
	});
}