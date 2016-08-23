var svg = document.getElementById('hexGrid');

var x, y, row, col, pointX, pointY, theta;
var currentX,currentY; // current selection
var start_troop,start_coor,end_troop,end_coor,move_troop;  // for moving troops
// Radius can be configured later
var radius = 35;
var moveDist = 2;
// The initial center point of drawing (+1 is to compensate the stroke width)
var HexPoints;
gameLoop();

function gameLoop(){
    buildGrid(10,10);
    // $("#hexGrid polygon").click(function(event){showDist(event);});
    $("button#add").click(function(){
        $("#hexGrid polygon,#hexGrid text").off();
        $("#hexGrid polygon, #hexGrid text").on('click',function(event){addTroop(event);});
        // console.log("start");
    });
    $("button#stop").click(function(){
        $("#hexGrid polygon,#hexGrid text").off();
        // $("#hexGrid polygon").click(function(event){showDist(event);});
        // console.log("stop");
    });
    $("button#move").click(function(){  // deal with $(svg text) later
        var flag = 0;
        $("#hexGrid polygon,#hexGrid text").off();
        $("#hexGrid polygon").on('click',function(event){
            showDist(event);
            if (flag==0) {moveTroopFrom(event); flag=1;}
            else if (flag==1) {moveTroopTo(event); flag = 0; clearHighlight();}
        });
    })
    // $("#hexGrid polygon").mouseover(function(event){mouseoverHandler(event);});
}
// =============================================================================================

function makeHexagon(x,y,hex_x,hex_y,id){
    // Again, these information can be configured later
    var troop=0;
    var polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    polygon.style.fill = '#00ff00';
    polygon.style.opacity = '0.5';
    polygon.style.stroke = 'black';
    polygon.style.strokeWidth = '1px';
    polygon.style.cursor = "pointer";

    polygon.setAttribute('points', drawHexSVG(x,y,radius));
    polygon.setAttribute('data-x', hex_x);    // data-* : custom attribute
    polygon.setAttribute('data-y', hex_y);
    polygon.setAttribute('data-z', (-hex_x-hex_y));
    polygon.setAttribute('data-cx', x);
    polygon.setAttribute('data-cy', y);
    polygon.setAttribute('data-troop', troop);
    polygon.setAttribute('data-id', id);

    svg.appendChild(polygon);
    //build text for army number
    var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x",(x - radius*0.2));
    text.setAttribute("y",(y + radius*0.2));
    text.setAttribute("data-id",id);
    // text.setAttribute('data-troop', troop);
    text.setAttribute("font-size",radius*0.7);
    text.innerHTML=troop;
    
    svg.appendChild(text);
}

function buildGrid(row_num,col_num){
    HexPoints=[];  var id=-1;
    var hex_x = 0; var count=0;
    for (row = 0; row < row_num; row ++) {
        for (col = 0; col < col_num; col ++) {
            // Offset is equal to the horizontal distance
            id++;           // add unique identifier for grids
            var initial = radius + 1;
            var offset = radius * Math.cos(Math.PI / 6);       // r*cos(30deg)
            x = initial + col * offset * 2;
            y = initial + row * offset * Math.sqrt(3);    // r*(sin30 +1)
            // Offset to push the hexagons of every second rows
            if (row % 2 !== 0) {x += offset;}
            makeHexagon(x,y,hex_x+col,row,id);   // use special coordinate
        } 
        count++; if (count%2 == 0 && count>0) {hex_x--;}
    }
    refreshTroop();
}

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
function showDist(event){
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
        if (hexDistance(xx,yy,zz,currentX,currentY,currentZ)<=moveDist){
            // console.log(hexDistance(xx,yy,zz,currentX,currentY,currentZ));
            elem.setAttribute('style',styleDist);
        }
    }
    $(event.target).attr('style',styles2);
}
function clearHighlight(){
    var polygon = $("#hexGrid polygon");
    var styles1 = 'fill:#00ff00; opacity:0.5;stroke:black;stroke-width:1px;cursor:pointer;';
    for (var i=0; i<polygon.length; i++){
        polygon[i].setAttribute('style',styles1);
    } 
}
// function mouseoverHandler(event){
//      console.log($(event.target).attr("data-x")+" "+$(event.target).attr("data-y")
//         +" "+$(event.target).attr("data-z"));
// }

function hexDistance(x1,y1,z1,x2,y2,z2){
    return Math.max(Math.abs(x2-x1),Math.abs(y2-y1),Math.abs(z2-z1));
}
function addTroop(event){
    var polygon = $("svg polygon");
    var texting = $("svg text");
    var id = parseInt($(event.target).attr("data-id"));
    var troop = parseInt(polygon[id].getAttribute("data-troop"));
     // add troop in every click
    troop++;
    polygon[id].setAttribute("data-troop",troop);
    // texting[id].setAttribute("data-troop",troop);
    $(event.target).attr("data-troop",troop);
    texting[id].innerHTML=troop;
    refreshTroop();
}

function moveTroopFrom(event){
    var polygon = $("svg polygon");
    var id = parseInt($(event.target).attr("data-id"));
    start_troop = parseInt(polygon[id].getAttribute("data-troop"));
    start_coor = returnPos(id);
    move_troop = start_troop;
}
function moveTroopTo(event){
    var polygon = $("svg polygon");
    var id = parseInt($(event.target).attr("data-id"));
    end_troop = parseInt(polygon[id].getAttribute("data-troop"));
    // console.log(end_troop);
    end_coor = returnPos(id);
    var dist = hexDistance(start_coor[0],start_coor[1],start_coor[2],
        end_coor[0],end_coor[1],end_coor[2]);
    if ( dist<= moveDist && dist>0  ) {
        total = end_troop+move_troop;
        polygon[start_coor[3]].setAttribute("data-troop",start_troop-move_troop);
        polygon[end_coor[3]].setAttribute("data-troop",end_troop+move_troop);

        refreshTroop();
    }
}
function returnPos(id){
    var polygon = $("svg polygon");
    var coor=[];
    coor[0] = parseInt(polygon[id].getAttribute("data-x"));
    coor[1] = parseInt(polygon[id].getAttribute("data-y"));
    coor[2] = parseInt(polygon[id].getAttribute("data-z"));
    coor[3] = parseInt(polygon[id].getAttribute("data-id")); 
    return coor;
}
function refreshTroop(){
    var polygon = $("svg polygon");
    var text = $("svg text");
    for (var i=0; i<polygon.length; i++){
        var troop = polygon[i].getAttribute("data-troop");
        text[i].innerHTML=troop;
        if (troop==0) { text[i].style.display = "none"; }
        else { 
            if (troop >=10) { 
            var x = polygon[i].getAttribute('data-cx');
            text[i].setAttribute("x",(x - radius*0.35));}
            text[i].style.display = "block"; 
        }
    }

}








// function toggleHandler(event){
//     // toggle between two classes of different color
//     var styles1 = 'fill:#00ff00; opacity:0.5;stroke:black;stroke-width:1px;cursor:pointer;';
//     var styles2 = 'fill:red; opacity:1;stroke:black;stroke-width:1px;cursor:pointer;';
//     $(event.target).attr('style',function(index,attr){
//         return attr == styles1 ? styles2 : styles1 ;
//     });
// }
