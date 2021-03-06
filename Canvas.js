var mess = "別のメッセージ";

var isMouseClicked = false;
var oldX = 0;
var oldY = 0;
var width = 10;
var rgbaVal = '#ff0000';
var eraser = false;
//var canvasAlptha = 10;
function init() {
     var can = document.getElementById('canvas');
     can.addEventListener("mousemove",draw,false);
     can.addEventListener("mousedown",function(e){
                                                     var r = e.target.getBoundingClientRect();
                                                     isMouseClicked = true;
                                                     oldX = e.clientX-r.left;
                                                     oldY = e.clientY-r.top;
                                                },false);
     can.addEventListener("mouseup",function(e){isMouseClicked = false;},false);
     /*var image = new Image();
     image.onload = function(){
         can.width = image.naturalWidth;
         can.height = image.naturalHeight;
     }
     image.src = "allmap.jpg";
     can.style.backgroundImage = 'url(allmap.jpg)';*/
}
function changeLine(){
    var p = document.getElementById('lineproperty');
    width = p.LineWidth.value;
    rgbaVal = p.LineColor.value;
    //canvasAlptha = p.LineAlpha.value;
}
function draw(e) {
    if (!isMouseClicked) {
            return;
    }
    var r = e.target.getBoundingClientRect();
    var x = e.clientX - r.left;
    var y = e.clientY - r.top;
    //var can = document.getElementById('canvas');
    //var con = can.getContext("2d");
    //con.fillStyle = "rgba(255,0,0,1)";
    //con.fillRect(x,y,10,10);
    drawLine(oldX,oldY,x,y,width,rgbaVal,eraser);
    DrowLinePush(oldX,oldY,x,y,width,rgbaVal,eraser);
    oldX = x;
    oldY = y;

}
function drawLine(x1,y1,x2,y2,w,c,e) {
    var can = document.getElementById("canvas");
    var con = can.getContext("2d");
    con.strokeStyle = c;
    con.lineWidth = w;
    if(e){
        con.globalCompositeOperation = "destination-out";
    }else {
        con.globalCompositeOperation = "source-over";
    }
    //con.globalAlpha = a/10;
    con.lineCap = "round";
    con.beginPath();
    con.moveTo(x1,y1);
    con.lineTo(x2,y2);
    con.stroke();
    con.closePath();
}
function changeImage(imageName) {
    var image = new Image();
    var can = document.getElementById('canvas');
    image.onload = function(){
        can.width = image.naturalWidth;
        can.height = image.naturalHeight;
    }
    image.src = imageName;
    can.style.backgroundImage = 'url('+imageName+')';

}
function clearCanvas(){
    var can = document.getElementById('canvas');
    can.getContext("2d").clearRect(0,0,can.width,can.height);
}
function eraseLine() {
    var con = document.getElementById('canvas').getContext("2d");
    var p = document.getElementById('lineproperty');
    eraser = p.erase.checked;
    /*
    if(p.erase.checked){
        con.globalCompositeOperation = "destination-out";
    }else {
        con.globalCompositeOperation = "source-over";
    }*/
}
