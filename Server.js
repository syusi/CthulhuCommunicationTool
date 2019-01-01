
const http = require('http');
const fs = require('fs');
const url = require('url');
const socket = require('socket.io');
const cookie = require('cookie');

//クラスの定義(ユーザーデータの保持)
/*名前 : name、
名前振り仮名 : namehuri、
性別 : gender、
年齢 : old、
職業 : work、
Dex、: dex
*/
/*function User(_name,_namehuri,_gender,_old,_work,_dex) {
    this.name = _name;
    this.namehuri = _namehuri;
    this.genger = _gender;
    this.old = _old;
    this.dex = _dex;
    this.work = _work;
};*/
function User(arrayParams) {
    this.name = arrayParams['name'];
    this.namehuri = arrayParams['namehuri'];
    this.genger = arrayParams['gender'];
    this.old = arrayParams['old'];
    this.dex = arrayParams['dex'];
    this.work = arrayParams['work'];

    this.printParam = function () {
        var str = "";
        for(var key in this){
            str += (key+" : " + this[key] + "\n");
        }
        return str;
    }
}

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
    if(url_parts['pathname'] == '/' && cookies.id != null && userInfo[cookies.id] != null){
        url_parts['pathname'] = '/canvasTest.html';
    }else if((url_parts['pathname'] == '/') ) {
        url_parts['pathname'] = '/Infomation.html';
    }
    url_parts['pathname'] = '.' + url_parts['pathname'];
    //console.log(url_parts);

    // jpg
    if (url_parts['pathname'].match(/.*\.jpg$/)){
        fs.readFile(url_parts['pathname'],'base64',
        function(err,data) {
            res.writeHead(200,{'Content-Type': 'image/jpeg'});
            res.write(data,'base64');
            res.end();
        });
        return;
    }

    //js
    if (url_parts['pathname'].match(/.*\.js$/)){
        fs.readFile(url_parts['pathname'],'UTF-8',
        function(err, data) {
            res.writeHead(200,{'Content-Type': 'text/javascript'});
            res.write(data);
            res.end();
        });
        return;
    }

    if (url_parts['pathname'].match(/.*\.html$/)){
        fs.readFile(url_parts['pathname'],'UTF-8',
        function(err, data) {
            // informationのときは、特別なルーティングで
            if(url_parts['pathname'] == './Infomation.html'){
                res.writeHead(200,headProperty);
                res.end(data);
                return;
            }
            if (cookies.id == null || userInfo[cookies.id] == null) {
                console.log("idpuls. now: "+userID);
                if(Object.keys(url_parts.query).length){
                    userInfo[userID] = new User(url_parts.query);
                }
                headProperty['Set-Cookie'] = [cookie.serialize('id',userID,{maxAge:(60*60*24)})];
                cookies.id = userID;
                userID++;
            }
            res.writeHead(200,headProperty);
            res.write(data);
            /*var str = "query<br>";
            for(var key in url_parts.query){
                str += "key : "+key+" , data : " + url_parts.query[key];
            }*/
            if (cookies.id != null) {
                console.log("login(id:" + cookies.id + ")\n params : \n" + userInfo[cookies.id].printParam());
            }
            //res.write(str);
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