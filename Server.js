
const http = require('http');
const fs = require('fs');
const url = require('url');
const socket = require('socket.io');

var server = http.createServer();
server.on('request',doRequest);
server.listen(1234);
console.log('server running');

//リクエスト処理
function doRequest(req,res) {
    var url_parts = url.parse(req.url);
    if (url_parts['path'] == '/') {
        url_parts['path'] = 'canvasTest.html';
    }

    console.log(url_parts);
    if (url_parts['path'].match(/.*\.jpg$/)){
        fs.readFile("."+url_parts['path'],'base64',
        function(err,data) {
            res.writeHead(200,{'Content-Type': 'image/jpeg'});
            res.write(data,'base64');
            res.end();
        });
        return;
    }

    if (url_parts['path'].match(/.*\.js$/)){
        fs.readFile('.' + url_parts['path'],'UTF-8',
        function(err, data) {
            res.writeHead(200,{'Content-Type': 'text/javascript'});
            res.write(data);
            res.end();
        });
        return;
    }

    if (url_parts['path'].match(/.*\.html$/)){
        fs.readFile('./canvasTest.html','UTF-8',
        function(err, data) {
            res.writeHead(200,{'Content-Type': 'text/html'});
            res.write(data);
            res.end();
        });
        return;
    }

    res.writeHead(401);
    res.write("File not found!!");
    res.end();

}

//web socketの関数
var io = socket.listen(server);

io.sockets.on("connection",function(socket){
    socket.on("conected",function() {
        var addr = socket.request.connection.remoteAddress;
        var id = socket.id;
        io.sockets.emit("sendcliant",{text:id+" : 入室しました\n"});
        console.log(addr+"入室しました\n");
    });

    socket.on("sendserver",function(mes){
        var addr = socket.request.connection.remoteAddress;
        var id = socket.id;
        console.log(addr+" : "+mes.value);
        io.sockets.emit("sendcliant",{text:id+" : "+mes.value});

    });

    socket.on("LinePushOnServer",function(line){
        console.log(line);
        io.sockets.emit("DrowLineCatch",line);
    });

});
