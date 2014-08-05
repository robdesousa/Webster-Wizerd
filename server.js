/**
 * Module dependencies.
 */

var express = require('express'),
    http = require('http'),
    path = require('path'),
    app = express(),
    myth = require('myth'),
    fs = require('fs'),
    methodOverride = require('method-override'),
    httpProxy = require('http-proxy'),
    request = require('request'),
    colors = require('colors'),
    requestCache = {};

function reportProxy(req, url){
    console.log('proxying', req.originalUrl.blue ,'to', url.magenta);
}

function cacheIt(){
    console.log(arguments)
}

// all environments
app.set('port', process.argv[2] || process.env.PORT || 3000);
app.use(methodOverride());

app.get("*.css", function(req, res) { //*.css
    var path = __dirname + req.url;
    fs.readFile(path, "utf8", function(err, data) {
        res.header("Content-type", "text/css");
        if (err) {
            console.error("Yo dawg, I heard you like files that don't exist. ", err);
            res.send("");
            return;
        }
        try {
            res.send(myth(data));
        } catch (e) {
            console.log(e);
            res.send(data);
        }
    });
});

app.get('/dictionary/:q/:key', function(req, res){
    var url = "http://www.dictionaryapi.com/api/v1/references/collegiate/xml/" + req.params.q +'?key='+req.params.key;
    reportProxy(req, url);
    var cached = requestCache[url];
    if(cached){
        console.log('sending cached');
        res.set('Content-Type', 'text/xml');
        res.send(cached);
    } else {
        req.pipe(request(url, function(err, response, body){
            if(err){ return res.send(404); }
            requestCache[url] = body;
        })).pipe(res);
    }
})

app.get('/thesaurus/:q/:key', function(req, res){
    // http://www.dictionaryapi.com/api/v1/references/thesaurus/xml/
    // http://www.dictionaryapi.com/api/v1/references/collegiate/xml/
    var url = "http://www.dictionaryapi.com/api/v1/references/thesaurus/xml/" + req.params.q +'?key='+req.params.key;
    reportProxy(req, url);
    var cached = requestCache[url];
    if(cached){
        console.log('sending cached');
        res.set('Content-Type', 'text/xml');
        res.send(cached);
    } else {
        req.pipe(request(url, function(err, response, body){
            if(err){ return res.send(404); }
            requestCache[url] = body;
        })).pipe(res);
    }
})

app.use(express.static(path.join(__dirname, '')));

http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});
