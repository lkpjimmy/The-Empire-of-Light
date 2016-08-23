var svg = document.getElementById('hexGrid');
var x, y, row, col, pointX, pointY, theta;
var currentX,currentY; // current selection
// Radius can be configured later
var radius = 35;
// The initial center point of drawing (+1 is to compensate the stroke width)
var HexPoints;
gameLoop();

function gameLoop(){
    buildGrid(10,10);
    $("#hexGrid polygon").click(function(event){clickHandler(event);});
    $("#hexGrid polygon").mouseover(function(event){mouseoverHandler(event);});
    // console.log(svg);
}


function Hexagon(x,y,hex_x,hex_y){
    // Again, these information can be configured later
    this.x=x;  this.y=y;
    var polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    polygon.style.fill = '#00ff00';
    polygon.style.opacity = '0.5';
    polygon.style.stroke = 'black';
    polygon.style.strokeWidth = '1px';
    polygon.style.cursor = "pointer";
    // this.draw = function(){
    polygon.setAttribute('points', drawHexSVG(this.x,this.y,radius));
    polygon.setAttribute('data-x', hex_x);    // data-* : custom attribute
    polygon.setAttribute('data-y', hex_y);
    polygon.setAttribute('data-z', (-hex_x-hex_y));
    svg.appendChild(polygon);
    // }
}

function buildGrid(row_num,col_num){
    HexPoints=[];  
    var hex_x = 0; var count=0;
    for (row = 0; row < row_num; row ++) {
        for (col = 0; col < col_num; col ++) {
            // Offset is equal to the horizontal distance
            var initial = radius + 1;
            var offset = radius * Math.cos(Math.PI / 6);       // r*cos(30deg)
            x = initial + col * offset * 2;
            y = initial + row * offset * Math.sqrt(3);    // r*(sin30 +1)
            // Offset to push the hexagons of every second rows
            if (row % 2 !== 0) {x += offset;}
            var hex = new Hexagon(x,y,hex_x+col,row);

        } 
        count++; if (count%2 == 0 && count>0) {hex_x--;}
    }
}
// Scan the hexagon from theta 30 degrees to 360 degrees
function drawHexSVG(x,y,radius){
    // count from 2 pt from top, anti-clockwise
    var tmp=[];
    for (var theta = Math.PI / 6; theta < (Math.PI * 2); theta += Math.PI / 3) {
        var pointX = x + radius * Math.cos(theta);
        var pointY = y + radius * Math.sin(theta);
        HexPoints.push([pointX,pointY]);    // overall hex array storage
        tmp.push(pointX + "," + pointY);    // tmp output for drawing one hexagon
    }   
    return tmp.join(" ");
}
function toggleHandler(event){
    // toggle between two classes of different color
    var styles1 = 'fill:#00ff00; opacity:0.5;stroke:black;stroke-width:1px;cursor:pointer;';
    var styles2 = 'fill:red; opacity:1;stroke:black;stroke-width:1px;cursor:pointer;';
    $(event.target).attr('style',function(index,attr){
        return attr == styles1 ? styles2 : styles1 ;
    });
}
function clickHandler(event){
    var styles1 = 'fill:#00ff00; opacity:0.5;stroke:black;stroke-width:1px;cursor:pointer;';
    var styles2 = 'fill:red; opacity:1;stroke:black;stroke-width:1px;cursor:pointer;';
    var styleDist = 'fill:red; opacity:0.5;stroke:black;stroke-width:1px;cursor:pointer;';
    var polygon = $("#hexGrid polygon");
    // console.log(polygon[0].getAttribute("data-x"));
    // console.log($(event.target));
    currentX = $(event.target).attr("data-x");
    currentY = $(event.target).attr("data-y");
    currentZ = $(event.target).attr("data-z");
    for (var i=0; i<polygon.length; i++){
        polygon[i].setAttribute('style',styles1);
    }
    for (var i=0; i<polygon.length; i++){
        var elem = polygon[i];
        var xx = elem.getAttribute("data-x");
        var yy = elem.getAttribute("data-y");
        var zz = elem.getAttribute("data-z");
        if (hexDistance(xx,yy,zz,currentX,currentY,currentZ)<=2){
            console.log(hexDistance(xx,yy,zz,currentX,currentY,currentZ));
            elem.setAttribute('style',styleDist);
        }
    }
    $(event.target).attr('style',styles2);
}
function mouseoverHandler(event){
     // console.log($(event.target).attr("data-x")+" "+$(event.target).attr("data-y")
        // +" "+$(event.target).attr("data-z"));
}

function hexDistance(x1,y1,z1,x2,y2,z2){
    var dist = Math.max(Math.abs(x2-x1),Math.abs(y2-y1),Math.abs(z2-z1));
    return dist;
}




