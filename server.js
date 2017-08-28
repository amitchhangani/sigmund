var express = require('express');
var app = express();

app.use(express.static(__dirname + '/dist' ) )

app.get('*', function(req,res){
  	res.sendFile("index.html", { root: __dirname+'/dist' })
})
app.listen(4102);
