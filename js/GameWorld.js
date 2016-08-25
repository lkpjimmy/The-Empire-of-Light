var svg = document.getElementById('hexGrid');
var row_num = 10; var col_num = 10;
var ids;
var x, y, row, col, pointX, pointY, theta;

// Current selection
var currentX, currentY;
// For moving troops
var start_troop, start_coor, end_troop, end_coor, move_troop, start_id, end_id;  

// Radius can be configured later
var radius = 35;

var landPercent = 0.8;   var waterPercent = 0.2;
var attackPercent = 0.6; var defensePercent = 0.7;
var moveDist = 2;

// The initial center point of drawing (+1 is to compensate the stroke width)
var HexPoints;
var groundMap;

var player1 = {
    id: 1, color:'#5555ee', troop: 0, land: 0, landIDs:[]
};
var player2 = {
    id: 2, color:'orange', troop: 0, land: 0, landIDs:[]
};
var PlayerList = [player1, player2];
// drag and drop
var mx,my,oldMx,oldMy;
var transX, transY;
var start_drag; start_drag=false;

var framing = document.getElementById("frame");
var frame_width = parseInt($("main").css('width'));
var frame_height = parseInt($("main").css('height'));
// $(".frame").css({"wdith":$(window).width(),"height":$(window).height()});
gameLoop();

function gameLoop() {
    buildGrid(row_num, col_num);
    playerGetLand();
    // $("#hexGrid polygon").click(function(event){showDist(event);});
    $("button#player1").css({"background-color":"yellow"}); player = 1;

    $("button#add").click(function() {
    	$("button").not("button#player1, button#player2").css({"background-color":"white"});
        $("button#add").css({"background-color":"yellow"});
        $("#hexGrid polygon, #hexGrid text").off();
        $("#hexGrid polygon, #hexGrid text").on('click', function(event){addTroop(event);});
        // console.log("start");
    });

    $("button#stop").click(function() {
    	$("button").not("button#player1, button#player2").css({"background-color":"white"});
        $("button#stop").css({"background-color":"yellow"});
        $("#hexGrid polygon, #hexGrid text").off();
        // $("#hexGrid polygon").click(function(event){showDist(event);});
        // console.log("stop");
    });

    $("button#move").click(function() {
    	$("button").not("button#player1, button#player2").css({"background-color":"white"});
        // Deal with $(svg text) later
        $("button#move").css({"background-color":"yellow"}); 
        var flag = 0; 
        $("#hexGrid polygon, #hexGrid text").off();
        $("#hexGrid polygon").on('click', function(event) {
            if (flag == 0 ) {
                // only allow players to control their troops
                if (moveTroopFrom(event)){  showDist(event); flag = 1;} 
                else { flag = 0;}
            } else if (flag == 1) {
                moveTroopTo(event); clearHighlight(); flag = 0;}
        });
    });

    $("button#player1").click(function() { 
    	$("button#player2").css({"background-color":"white"});
        $("button#player1").css({"background-color":"yellow"}); player = 1;});

    $("button#player2").click(function() { 
    	$("button#player1").css({"background-color":"white"});
        $("button#player2").css({"background-color":"yellow"}); player = 2;});

    setCenter();
    svg.addEventListener('mousemove',function(event){traceMouse(event);},false);
    framing.addEventListener('mousewheel',function(event){
        var flag; traceMouse(event); resizeSVG(event);},false);
    svg.addEventListener('mousedown',dragStart,false);
    document.body.addEventListener('mouseup',dragEnd,false);
}
// =============================================================================================

function makeHexagon(row, col, x, y, hex_x, hex_y, id) {
    // Again, these information can be configured later
    var troop = 0;
    var fillColor, land; player = -1;

    var polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    if (groundMap[row][col] == 0) {fillColor = '#00ff00'; land = 1;}      // Ground
    else if (groundMap[row][col] == 1) {fillColor = '#0000ff'; land = 0;} // Water

    polygon.style.fill = fillColor;
    polygon.style.opacity = '0.5';
    polygon.style.stroke = 'black';
    polygon.style.strokeWidth = '1px';
    polygon.style.cursor = "pointer";

    polygon.setAttribute('data-land', land);
    polygon.setAttribute('points', drawHexSVG(x, y, radius));
    polygon.setAttribute('data-x', hex_x);            // data-* : custom attribute
    polygon.setAttribute('data-y', hex_y);
    polygon.setAttribute('data-z', (-hex_x - hex_y));
    polygon.setAttribute('data-cx', x);
    polygon.setAttribute('data-cy', y);
    polygon.setAttribute('data-troop', troop);
    polygon.setAttribute('data-id', id);
    polygon.setAttribute('data-player', player);

    svg.appendChild(polygon);
    // Build text for army number
    var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", (x - radius * 0.2));
    text.setAttribute("y", (y + radius * 0.2));
    text.setAttribute("data-id", id);
    // text.setAttribute('data-troop', troop);
    text.setAttribute("font-size", radius * 0.7);
    text.innerHTML = troop;
    
    svg.appendChild(text);
}

function buildGrid(row_num, col_num) {
    HexPoints = [];  
    var id = -1;
    var hex_x = 0; 
    var count = 0;

    mapGenerator();
    for (row = 0; row < row_num; row ++) {
        for (col = 0; col < col_num; col ++) {
            // Offset is equal to the horizontal distance

            // Add unique identifier for grids
            id++;          
            var initial = radius + 1;
            var offset = radius * Math.cos(Math.PI / 6); // r*cos(30deg)
            x = initial + col * offset * 2;
            y = initial + row * offset * Math.sqrt(3);   // r*(sin30 +1)
            // Offset to push the hexagons of every second row
            if (row % 2 !== 0) {x += offset;}
            // Use special coordinate
            makeHexagon(row, col, x, y, hex_x+col, row, id);
        } 
        count++;
        // Every second row
        if (count % 2 == 0 && count > 0) {hex_x--;}
    }
    player = 1;
    refreshTroop();
}

function drawHexSVG(x, y, radius) {
    // Count from 2 pt from top, anti-clockwise
    var tmp = [];
    for (var theta = Math.PI / 6; theta < (Math.PI * 2); theta += Math.PI / 3) {
        var pointX = x + radius * Math.cos(theta);
        var pointY = y + radius * Math.sin(theta);
        HexPoints.push([pointX, pointY]); // Overall hex array storage
        tmp.push(pointX + "," + pointY);  // tmp output for drawing one hexagon
    }   
    return tmp.join(" ");
}

function showDist(event) {
    // Normal land
    var styles1 = 'fill:#00ff00; opacity:0.5; stroke:black; stroke-width:1px; cursor:pointer;';
    // Starting point
    var styles2 = 'fill:red; opacity:1; stroke:black; stroke-width:1px; cursor:pointer;';
    // Sea move
    var styles3 = 'fill:#ff00ff; opacity:0.5; stroke:black; stroke-width:1px; cursor:pointer;';
    // land move
    var styleDist = 'fill:red; opacity:0.5; stroke:black; stroke-width:1px; cursor:pointer;';
    var polygon = $("#hexGrid polygon");
    var cid = parseInt($(event.target).attr('data-id'));   // starting point id
    ids = findMoveDist(cid);
    for (var i = 0; i < ids.length; i++) {
    	polygon[ids[i]].setAttribute('style', styleDist);
    }

    $(event.target).attr('style', styles2);
}

function clearHighlight() {
    var polygon = $("#hexGrid polygon");
    for (var i = 0; i < polygon.length; i++) {
        if (polygon[i].getAttribute('data-land') == "1") {addition = "fill:#00ff00";}
        else if (polygon[i].getAttribute('data-land') == "0") {addition = "fill:#0000ff";}
        var styles1 = 'opacity:0.5; stroke:black; stroke-width:1px; cursor:pointer;'+addition;
        polygon[i].setAttribute('style', styles1);
    } 
}

// function hexDistance(x1, y1, z1, x2, y2, z2) {
//     return Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1), Math.abs(z2 - z1));
// }

function hexDistID(id1, id2) {
    var polygon = $("svg polygon");
	var x1 = parseInt(polygon[id1].getAttribute("data-x"));
	var y1 = parseInt(polygon[id1].getAttribute("data-y"));
	var z1 = parseInt(polygon[id1].getAttribute("data-z"));
	var x2 = parseInt(polygon[id2].getAttribute("data-x"));
	var y2 = parseInt(polygon[id2].getAttribute("data-y"));
	var z2 = parseInt(polygon[id2].getAttribute("data-z"));
    return Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1), Math.abs(z2 - z1));
}

function addTroop(event) {
    var polygon = $("svg polygon");
    var texting = $("svg text");
    var id = parseInt($(event.target).attr("data-id"));
    var who = parseInt(polygon[id].getAttribute('data-player'));
    if (polygon[id].getAttribute('data-land') == "1" && player > 0 &&
        who==player) {
        var troop = parseInt(polygon[id].getAttribute("data-troop"));
	    // Add troop in every click
	    troop++;
	    polygon[id].setAttribute("data-troop",troop);

	 	// polygon[id].setAttribute("data-player",player);
	    // texting[id].setAttribute("data-troop", troop);
	    // $(event.target).attr("data-troop", troop);
	    // texting[id].innerHTML = troop;
	    refreshTroop();
	  }
}

function moveTroopFrom(event) {        // move troop from starting point
    var polygon = $("svg polygon");
    start_player = parseInt($(event.target).attr("data-player"));
    if (start_player==player){
        start_id = parseInt($(event.target).attr("data-id"));
        start_troop = parseInt(polygon[start_id].getAttribute("data-troop"));
        move_troop = start_troop;
        return true;
    }
        // console.log("from:"+ids);
    return false;
}

function moveTroopTo(event) {
    var polygon = $("svg polygon");
    end_id = parseInt($(event.target).attr("data-id"));
    end_troop = parseInt(polygon[end_id].getAttribute("data-troop"));
    for (var i=0;i<ids.length; i++){
        if (end_id==ids[i]) {
            attackJudge(start_id, end_id, move_troop);
            refreshTroop();
    }}
}

function returnPos(id) {
    var polygon = $("svg polygon");
    var coor = [];
    coor[0] = parseInt(polygon[id].getAttribute("data-x"));
    coor[1] = parseInt(polygon[id].getAttribute("data-y"));
    coor[2] = parseInt(polygon[id].getAttribute("data-z"));
    coor[3] = parseInt(polygon[id].getAttribute("data-id")); 
    return coor;
}

function refreshTroop() {
    var polygon = $("svg polygon");
    var text = $("svg text");
    for (var i = 0; i < polygon.length; i++) {
        var troop = polygon[i].getAttribute("data-troop");
        var playerID = polygon[i].getAttribute("data-player");
        // if empty land, belong to nobody
        if (troop == 0) {
            polygon[i].setAttribute('data-player', -1);
        }
        if (playerID > 0) {
            var color = PlayerList[playerID - 1].color;
        }

        text[i].innerHTML = troop;
        text[i].setAttribute('fill', color);
        if (troop == 0) {
            text[i].style.display = "none";
        }
        else { 
            if (troop >= 10) { 
                var x = polygon[i].getAttribute('data-cx');
                text[i].setAttribute("x", (x - radius * 0.35));
            }
            text[i].style.display = "block"; 
        }
    }
}

function mapGenerator() {
    groundMap = new Array(col_num);
    for (var i = 0; i < row_num; i++) { 
        groundMap[i] = [] 
    }

    for (var i = 0; i < col_num; i++) {
        for (var j = 0; j < row_num; j++) {
            var random = Math.random();
            // 0: land, 1: water
            if (random <= landPercent) { 
                groundMap[i][j] = 0; 
            } 
            else { 
                groundMap[i][j] = 1; 
            }
    }}
    return groundMap;
}

function findMoveDist(cid) {
    var id1 = []; var id2 = []; ids = [];

    var polygon = $("svg polygon");
    for (var i = 0; i < polygon.length; i++) {
    	var land = polygon[i].getAttribute("data-land"); // data-land=1:land, 0:water
    	if (hexDistID(cid,i) == 1 && land == "1") {
            id1.push(i);   // distance 1's id 
        }
    }
    for (var i = 0; i < polygon.length; i++) {
        for (var j = 0; j < id1.length; j++) {
            var node = id1[j];
	    	var land = polygon[i].getAttribute("data-land");
	    	if (hexDistID(i,node) == 1 && land == "1" && i != cid) {
                id2.push(i);  // distance 2's id
            }
        }
    }

    function logging(v1, v2, set) {
        ids.push(v1);   // turn Set object to normal array
    }
    new Set(id1.concat(id2)).forEach(logging);

    return ids;
}

// Bug
function attackJudge(attackID, defenseID, move) {
	var polygon = $("svg polygon");	
    var result = [];
	var user1 = polygon[attackID].getAttribute("data-player");
	var user2 = polygon[defenseID].getAttribute("data-player");
	var army1 = parseInt(polygon[attackID].getAttribute("data-troop"));
	var army2 = parseInt(polygon[defenseID].getAttribute("data-troop"));

	if (user1 == user2 || user2 == -1) {   // see if same person / not occupied
		result[0] = army1 - move;     // move = troop moved    start
        result[1] = army2 + move;       // end

		if (result[0] == 0) {    
            polygon[attackID].setAttribute('data-player', -1); 
        }
		if (user2 == -1) { 
            polygon[defenseID].setAttribute('data-player', user1); 
        }
	} else if (user1 != user2){    
		var attackRemain = Math.round(move - army2 * defensePercent);
		var defenseRemain = Math.round(army2 - move * attackPercent);
		if (attackRemain < 0) {
            attackRemain = 0;
        }	else if (defenseRemain<0) { defenseRemain=0;}

		if (defenseRemain <= 0) {
            // Attack wins!
			result[0] = army1 - move;
            result[1] = attackRemain;
			polygon[defenseID].setAttribute('data-player', user1);
		} else if(defenseRemain>0) {
            // Defense wins!
			result[0] = army1 -move + attackRemain;		
            result[1] = defenseRemain;
        }
	}
	
	polygon[attackID].setAttribute('data-troop', result[0]);
	polygon[defenseID].setAttribute('data-troop', result[1]);
}

// game start
function playerGetLand(){
    var polygon = $("svg polygon");
    var initialLandNum = 3; 
    var idList = [];  // for choosing land
    for (var i=0; i<polygon.length; i++) { 
        if (polygon[i].getAttribute("data-land")=="1") {idList.push(i); }
    }
    for (var j=0; j<PlayerList.length; j++){
        for (var i=0; i<initialLandNum; i++){
            var random = Math.round(Math.random()*(idList.length));
            (PlayerList[j].landIDs).push(idList[random]);
            PlayerList[j].land++;
            polygon[idList[random]].setAttribute('data-player',PlayerList[j].id);
            polygon[idList[random]].setAttribute('data-troop',5);
            idList.pop(random);
        }
    }
    refreshTroop();
} 






// drag and drop, resize

function setCenter(){
    var box_height = parseInt(svg.getAttribute('height'));
    var box_width = parseInt(svg.getAttribute('width'));
    transX = frame_width/2-box_width/2;
    transY = frame_height/2-box_height/2;
    svg.style.transform = "translate("+transX+"px,"+transY+"px)";
}
function traceMouse(event){
    var svg_coor = svg.getBoundingClientRect();
    var framing_coor = framing.getBoundingClientRect();
    mx = event.clientX - svg_coor.left; 
    my = event.clientY - svg_coor.top;
    if (start_drag==true){
        var frameX = event.clientX - framing_coor.left;
        var frameY = event.clientY - framing_coor.top;
        transX = frameX - oldMx;
        transY = frameY - oldMy;
        svg.style.transform = "translate("+transX+"px,"+transY+"px)";
    }
}

function resizeSVG(e){
    var size_y,size_x,scale_x,scale_y; 
    var step_x=100; var step_y=100;
    var minSize_x=450; var minSize_y=380;
    var maxSize_x=1850; var maxSize_y=1780;
    var oldTransX = transX;  var oldTransY = transY;
    size_x = parseInt(svg.getAttribute('width'));
    size_y = parseInt(svg.getAttribute('height'));
    var delta = Math.max(-1,Math.min(1,(e.wheelDelta || -e.detail)));   // -1 to 1
    size_x = Math.max(minSize_x, Math.min(maxSize_x,size_x+delta*step_x));
    size_y = Math.max(minSize_y, Math.min(maxSize_y,size_y+delta*step_y));
    svg.setAttribute('height',size_y);
    svg.setAttribute('width',size_x);

    if (size_x!=minSize_x && size_x!=maxSize_x && 
        size_y!=minSize_y && size_y!=maxSize_y) {resizeFlag=true;}
    if (resizeFlag == true){
        if (delta==1) { scale_y = size_y/(size_y-step_y);
            scale_x = size_x/(size_x-step_x);  }
        else if (delta==-1) {scale_x = size_x/(size_x+step_x);
            scale_y = size_y/(size_y+step_y);}
        var dx = (scale_x-1)*mx;  // find distance moved for chosen point
        var dy = (scale_y-1)*my;
        transX = oldTransX-dx;
        transY = oldTransY-dy;

        svg.style.transform = "translate("+transX+"px,"+transY+"px)";
        if (size_x==minSize_x || size_x==maxSize_x ||
            size_y==minSize_y || size_y==maxSize_y) {resizeFlag=false;}
    }
} 

function dragStart(){
    start_drag = true;
    oldMx = mx;  oldMy=my;
}
function dragEnd(){
    start_drag = false;
}


