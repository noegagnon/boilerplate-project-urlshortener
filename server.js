'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');

var cors = require('cors');

var app = express();

var dns = require('dns');

var port = process.env.PORT || 3000;

mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true }); 

app.use(cors());

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:false}));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

// create schema to save short url
var Schema = mongoose.Schema;
var monModel = new Schema({
  "original_url":String,
  "short_url":{type: Number, unique:true}
})

var Url = mongoose.model('url', monModel);

var myquery={short_url:1};
Url.remove(myquery, function(err, obj){
  if(err) throw err;
  
})

// end point to create a new shorturl
app.post('/api/shorturl/new', function(req, res) {  
  var error = false;
  
  var w3 = dns.lookup(req.body.url, function (err, addresses, family) {
    if(err) error = true;
  });
  
  var randomNumber = Math.floor(Math.random()*100000);
  
  if(!error){        // if url valid
    console.log("test");
    var adresse = req.body.url;
    var addr = new Url({"original_url": adresse, "short_url": randomNumber})
    console.log(addr)
    addr.save(function(err, data) {
      if(err) return console.log(err);
      console.log("save successful\n" + data);
    })
    res.json({"original_url":adresse, "short_url": randomNumber})
  } else {           // if url not valid
    res.json({"error":"invalid URL"})
  }
})

app.get('/api/shorturl/:shorturl', function(req, res){
  console.log("ce que je get " + req.params.shorturl);
  // aller chercher le vrai url dans la base de donnees avec le shorturl
  Url.findOne({short_url: req.params.shorturl}, function(err, data){
    if(err) {
      res.json({"error":"invalid short_url"})
    }
    if(data == null){
      res.json({"error":"No short URL found for the given input"});
    }
    res.redirect(data.original_url);
  })
})


app.listen(port, function () {
  console.log('Node.js listening ...');
});