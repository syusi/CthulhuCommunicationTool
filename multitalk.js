var http = require('http');
var sock = require('socket.io');
var fs = require('fs');

var serval = http.createServer();
serval.on('request',doConnect);
serval.listen(12345);

function doConnect(req , res){
    res.writeHead(200,{'Content-Type':'text/html'})
    res.write(fs.readFileSync("./cliant.html","utf-8"));
    res.end();
}

var io = sock.listen(serval);

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
        io.sockets.emit("sendcliant",{text:id+" : "+mes.value + "<br>"});

    });

});
console.log("serval runnning!!");
/*ここよりメモ
イメージとしては、まずブラウザ上でイベントを起こし、そこから
コールバックでサーバにアクセスを飛ばす。その後、
又コールバッグでブラウザ側に返答が帰り、表示が行われる。
emitが自分以外のソケット全てに送信するやつらしいので利用
形式は非ブロッキングIOらしいよ
ログに表示される::1はIPv6でローカルアドレスからのやつらしいので…用件賞*/
