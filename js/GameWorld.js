var svg = document.getElementById('hexGrid');
var x, y, row, col, pointX, pointY, theta;
// Radius can be configured later
var radius = 35;
// The initial center point of drawing (+1 is to compensate the stroke width)
var HexPoints;
gameLoop();

function gameLoop(){
    buildGrid(2,2);
    $("#hexGrid").click(function(event){clickHandler(event);});
    console.log(svg);
}


function Hexagon(x,y){
    // Again, these information can be configured later
    this.x=x;  this.y=y;
    var polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    this.fillColor = '#00ff00';
    this.opacity = '0.5';
    polygon.style.fill = this.fillColor;
    polygon.style.opacity = this.opacity;
    polygon.style.stroke = 'black';
    polygon.style.strokeWidth = '1px';
    polygon.style.cursor = "pointer";
    // this.draw = function(){
    polygon.setAttribute('points', drawHexSVG(this.x,this.y,radius));
    svg.appendChild(polygon);
    // }
}

function buildGrid(row_num,col_num){
    HexPoints=[];
    for (row = 0; row < row_num; row ++) {
        for (col = 0; col < col_num; col ++) {
            // Offset is equal to the horizontal distance
            var initial = radius + 1;
            var offset = radius * Math.cos(Math.PI / 6);       // r*cos(30deg)
            x = initial + col * offset * 2;
            y = initial + row * offset * Math.sqrt(3);    // r*(sin30 +1)
            // Offset to push the hexagons of every second rows
            if (row % 2 !== 0) {x += offset;}
            var hex = new Hexagon(x,y);
    }}
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
function clickHandler(event){
    $(event.target).attr('style','fill:red; opacity:1;stroke:black;stroke-width:'+
        '1px;cursor:pointer;');
}


