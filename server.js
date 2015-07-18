var http = require("http");
var url = require("url");
var path = require("path");
var fs = require("fs");
var port = "3000";

function onRequest(request, response) {
  var urlPath = url.parse(request.url).pathname;
  var fsPath = "." + urlPath;
  var fileExt = path.extname(urlPath);

  if (request.method === "GET") {
    if (request.url === "/") {
      sendFile(response, "./index.html", ".html");
    } else if (request.url === "/server.js" || request.url === "/images") {
      error403(response, fsPath);
    } else {
      sendFile(response, fsPath, fileExt);
    }
  } else {
    error404(response, fsPath);
  }
}

function sendFile(res, path, ext) {
  var fileStream = fs.createReadStream(path);
  var mimeType = {
    ".html": "text/html",
    ".md": "text/markdown",
    ".jpg": "image/jpeg"
  };

  fileStream.on("open", function() {
    res.writeHead(200, {"Content-Type": mimeType[ext]});
  })
  fileStream.on("end", function() {
    console.log("Status 200: OK (Path: " + path + ")");
  })
  fileStream.on("error", function() {
    error404(res, path);
  })
  fileStream.pipe(res);
}

function error403(res, path) {
  res.writeHead(403, {"Content-Type": "text/html"});
  fs.createReadStream("./403.html").pipe(res);
  console.log("Error 403: Forbidden (Path: " + path + ")")
}

function error404(res, path) {
  res.writeHead(404, {"Content-Type": "text/html"});
  fs.createReadStream("./404.html").pipe(res);
  console.log("Error 404: Not found (Path: " + path + ")")
}

http.createServer(onRequest).listen(port);
console.log("Server is running!");
