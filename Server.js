
const http = require('http');
const fs = require('fs');
const url = require('url');
const socket = require('socket.io');
const cookie = require('cookie');

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
 ;
var userInfo = [];

var userID = 0;


var server = http.createServer();
server.on('request',doRequest);
server.listen(1234);
console.log('server running');

//リクエスト処理
function doRequest(req,res) {
    var url_parts = url.parse(req.url,true);
    var cookies = (req.headers.cookie == null ? {} : cookie.parse(req.headers.cookie));
    var headProperty = {'Content-Type': 'text/html'};

    //初期設定、'/'かつcookie.idが無ければ最初のページへ。idがあって'/'ならcanvasTest.htmlへ飛ばす。
    if(url_parts['pathname'] == '/' && cookies.id != null){
        url_parts['pathname'] = '/canvasTest.html';
    }else if(url_parts['pathname'] == '/' && cookies.id == null) {
        url_parts['pathname'] = '/Infomation.html';
    }

    //console.log(url_parts);

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
            var c = cookie.serialize('test','日本語だと思うよ');
            if (cookies.id == null) {
                headProperty['Set-Cookie'] = [cookie.serialize(id,userID,{maxAge:(60*60*24)})];
                userID++;
                console.log("idpuls. now: "+userID);
                
            }
            res.writeHead(200,headProperty);
            res.write(data);
            var str = "query<br>";
            for(var key in url_parts.query){
                str += "key : "+key+" , data : " + url_parts.query[key];
            }
            res.write(str);
            res.write("<br>cookie : " + req.headers.cookie);
            res.write("<bt>id : " + cookies.id);
            /*var body = "<br>body : ";
            req.on('data',function(chanks) {
                body += chanks;
            });
            req.on('end',function() {
                //console.log("body" + body);
                res.end(body);
            });*/
            res.end();
        });
        return;
    }

    res.writeHead(401);
    res.write("File not found!!");
    res.end();

}

function chackMedia(url){
    //メディアとエンコード形式を分けて、それを返す。
}

//writeHeadで使う'setcookie':---を返す。
function makeCookieElement(params) {
    
}


//web socketの関数
var io = socket.listen(server);

io.sockets.on("connection",function(socket){
    socket.on("conected",function() {
        var addr = socket.request.connection.remoteAddress;
        var id = socket.id;

        console.log("id:" + socket.id + "\n");
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

function MemoryLog(id,Text) {
    // text等のログを残す。時間と内容でよいはず。
    // 追加、時間は要らないけど、しゃべった人は必要

}