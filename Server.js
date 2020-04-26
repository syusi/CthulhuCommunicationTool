
const http = require('http');
const fs = require('fs');
const url = require('url');
const socket = require('socket.io');
const cookie = require('cookie');
const date = require('date-utils');

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
var Masterin = false;


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
    //Master用
    /*if ((url_parts['pathname'] == '/canvasTest.html')　&& Masterin) {
        url_parts['pathname'] = '/canvasTest.html';
    }else{
        console.log('masterin');
        Masterin = true;
    }*/

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
                //logoutを実装したらなぜかこういった状況になった。要修正
                if (userInfo[cookies.id] != null) {
                    console.log("login(id:" + cookies.id + ")\n params : \n" + userInfo[cookies.id].printParam());   
                }
            }
            //res.write(str);
            //res.write("<br>cookie : " + req.headers.cookie);
            //res.write("<bt>id : " + cookies.id);
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
    //connectionが成功したときの最初の動作
    socket.on("conected",function(num) {
        //var addr = socket.request.connection.remoteAddress;
        var id = socket.id;

        console.log("id:" + socket.id + "\n");
        //console.log("num" + num['id']);
        
        io.sockets.emit("sendcliant",{text:userInfo[num['id']].name+" : \n入室しました\n"});
        console.log(userInfo[num['id']].name+" : \n入室しました\n");

        //自分以外に自分のデータを流す。最ログインの場合は要らない
        socket.broadcast.emit("MemberInfoCatch",userInfo[num['id']],num['id']);

        //自分に全てのデータを流す。
        for (let i = 0; i < userInfo.length; i++) {
            io.to(socket.id).emit("MemberInfoCatch",userInfo[i],i);
        }

    });

    //通常メッセージのサーバーへの受信
    socket.on("sendserver",function(mes){
        //var addr = socket.request.connection.remoteAddress;
        //var id = socket.id;
        console.log(userInfo[mes.id].name+" : \n"+mes.value);
        io.sockets.emit("sendcliant",{text:userInfo[mes.id].name+" : \n"+mes.value});
        MemoryLog(userInfo[mes.id],mes.value);
    });

    //戦闘の際の順番提示
    socket.on("battleEvent",function(params) {
        //data = [{no:1,name:"aaa",dex:18},{no:2,name:"bbb",dex:3}];
        var battleParam = []
        //console.log(params);
        var Player = params[0];
        //console.log("P:"+Player['0']+"\nl:"+Object.keys(Player).length);
        for (let i = 0; i < Object.keys(Player).length; i++) {
            if (Player[i]) {
                //console.log("\nin");
                battleParam.push({no:0,name:userInfo[i].name,dex:(userInfo[i].dex*4)});
            }
        }

        var EnemyNo = 65;
        for (let i = 1; i < params.length; i++) {
            var element = params[i];
            if (element['Num'] == 1) {
                battleParam.push({no:0,name:element['Name'],dex:(element['Dex']*4)});
            }else{
                for (let j = 0; j < element['Num']; j++) {
                    battleParam.push({no:0,name:(element['Name']+String.fromCharCode(EnemyNo)),dex:(element['Dex']*4)});
                    EnemyNo++;
                }
                EnemyNo = 65;
            }
        }

        battleParam.sort(function(a,b){
            if(a.dex > b.dex) return -1;
            if(a.dex < b.dex) return 1;
            return 0;
        });

        for (let i = 0; i < battleParam.length; i++) {
            battleParam[i].no = i+1;
        }
        console.log(battleParam);
        MemoryLog('battle',battleParam);
        io.sockets.emit("ButtleInfoCatch",battleParam);
    });
    //画像タブの生成
    socket.on("CanvasInfoSend",function(info){
        MemoryLog('canvas',info);
        io.sockets.emit("CanvasInfoCatch",info);
    });

    //canvasのメッセージの受信
    socket.on("LinePushOnServer",function(line){
        console.log(line);
        io.sockets.emit("DrowLineCatch",line);
    });

    socket.on("DaiceInfoSend",function(info){
        console.log(info);
        var result = userInfo[info.id].name+" : \n";
        result += info['num']+"d"+info['surface']+" ";
        var rand = 0;
        var sum = 0;
        for (let i = 0; i < info['num']; i++) {
            var rand = Math.floor(Math.random() * Math.floor(info['surface']))+1;
            result += rand + " ";
            sum += rand;
        }
        if(info['surface'] == 100 && info['num'] == 1){
            result += (rand <= 5) ? "クリティカル!!" : "";
            result += (rand >= 96) ? "ファンブル!!" : "";
        }else if(info['num'] != 1){
            result += "(sum:"+sum+")";
        }
        MemoryLog("daice",info);
        io.sockets.emit("sendcliant",{text:result});
    });

});

function MemoryLog(id,text) {
    // text等のログを残す。時間と内容でよいはず。
    // 追加、時間は要らないけど、しゃべった人は必要
    var dt = new Date();
    var formatted = dt.toFormat("YYYY/MM/DD HH24時MI分SS秒 :\n");
    var content = formatted + JSON.stringify(id) + " : " + JSON.stringify(text) + "\n";
    fs.appendFile('log.txt',content,function (err) {
        if (err != null) {
            throw err;
        }
    });
}