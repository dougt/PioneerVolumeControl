var fs = require('fs');
var http = require("http");
var path = require('path');
var util = require("util");

var fileContents = fs.readFileSync("./options.js", 'utf8');
var options = JSON.parse(fileContents);

http.createServer(function(request, response) {

  var filePath = '.' + request.url;
  if (filePath == './')
    filePath = './index.html';
         
  var extname = path.extname(filePath);
  var contentType = 'text/html';
  switch (extname) {
  case '.js':
    contentType = 'text/javascript';
    break;
  case '.css':
    contentType = 'text/css';
    break;
  }

  path.exists(filePath, function(exists) {
      if (exists) {
        fs.readFile(filePath, function(error, content) {
            if (error) {
              response.writeHead(500);
              response.end();
            }
            else {
              response.writeHead(200, { 'Content-Type': contentType });
              response.end(content, 'utf-8');
            }
          });
      }
      else {

        // we only want to pass certian requests over to the pioneer equipment.
        if (filePath != "./StatusHandler.asp" &&
            filePath != "./EventHandler.asp?WebToHostItem=VU" &&
            filePath != "./EventHandler.asp?WebToHostItem=VD")
        {
            console.log("Invalid request to pioneer: " + filePath);
            response.end();
            return;
        }

        response.writeHead(200, { 'Content-Type': 'text/javascript' });
        var requestopt = {  
          host: options.pioneer,   
          port: 80,   
          path: request.url,
        };   

        var req = http.get(requestopt, function(res) {
            res.on('data', function(chunk) {
                response.write(chunk);
              });
            res.on('end', function(chunk) {  
                response.end();
              });   
          });

        req.on('error', function(e) {  
            console.log("Got error: " + e.message);
            response.end();
          });
      }
   });
}).listen(options.port)
    
