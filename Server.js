
const http = require('http');
const fs = require('fs');
const url = require('url');
const socket = require('socket.io');

//クラスの定義(ユーザーデータの保持)
/*名前 : name、
性別 : gender、
年齢 : year、
Dex、: dex
顔 : face
*/
function User(_name,_gender,_year,_dex,_face) {
    this.name = _name;
    this.genger = _gender;
    this.year = _year;
    this.dex = _dex;
    this.face = _face;
}

var userInfo = [];




var server = http.createServer();
server.on('request',doRequest);
server.listen(1234);
console.log('server running');

//リクエスト処理
function doRequest(req,res) {
    var url_parts = url.parse(req.url,true);
    if (url_parts['pathname'] == '/') {
        url_parts['pathname'] = '/canvasTest.html';
    }

    console.log(url_parts);
    // jpg
    if (url_parts['pathname'].match(/.*\.jpg$/)){
        fs.readFile("."+url_parts['pathname'],'base64',
        function(err,data) {
            res.writeHead(200,{'Content-Type': 'image/jpeg'});
            res.write(data,'base64');
            res.end();
        });
        return;
    }

    if (url_parts['pathname'].match(/.*\.js$/)){
        fs.readFile('.' + url_parts['pathname'],'UTF-8',
        function(err, data) {
            res.writeHead(200,{'Content-Type': 'text/javascript'});
            res.write(data);
            res.end();
        });
        return;
    }

    if (url_parts['pathname'].match(/.*\.html$/)){
        fs.readFile('.' + url_parts['pathname'],'UTF-8',
        function(err, data) {
            res.writeHead(200,{'Content-Type': 'text/html'});
            res.write(data);
            var str = "query<br>";
            for(var key in url_parts.query){
                str += "key : "+key+" , data : " + url_parts.query[key];
            }
            res.write(str);

            var body = "body<br>";
            req.on('data',function(chanks) {
                body += chanks;
            });
            req.on('end',function() {
                //console.log("body" + body);
                res.end(body);
            });
        });
        return;
    }

    res.writeHead(401);
    res.write("File not found!!");
    res.end();

}

function chackMedia(url){
    
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

function MemoryLog(Time,Text) {
    
}