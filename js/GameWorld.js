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
	id: 1, color:'#5555ee', troop: 0, landOccupied: 0
};
var player2 = {
	id: 2, color:'orange', troop: 0, landOccupied: 0
};

var PlayerList = [player1, player2];
gameLoop();

function gameLoop() {
    buildGrid(row_num, col_num);
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
        $("#hexGrid polygon, #hexGrid text").on('click', function(event) {
            if (flag == 0) {moveTroopFrom(event); flag = 1; showDist(event);}
            else if (flag == 1) {moveTroopTo(event); flag = 0; clearHighlight();}
        });
    });

    $("button#player1").click(function() { 
    	$("button#player2").css({"background-color":"white"});
        $("button#player1").css({"background-color":"yellow"}); player = 1;});

    $("button#player2").click(function() { 
    	$("button#player1").css({"background-color":"white"});
        $("button#player2").css({"background-color":"yellow"}); player = 2;});

    // $("#hexGrid polygon").mouseover(function(event){mouseoverHandler(event);});
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
    // Land move
    var styleDist = 'fill:red; opacity:0.5; stroke:black; stroke-width:1px; cursor:pointer;';
    var polygon = $("#hexGrid polygon");
    var cid = parseInt($(event.target).attr('data-id'));  // Starting point id
    ids = findMoveDist(cid);
    // console.log(polygon[0].getAttribute("data-x"));
    // console.log($(event.target));
    // currentX = $(event.target).attr("data-x");
    // currentY = $(event.target).attr("data-y");
    // currentZ = $(event.target).attr("data-z");

    // for (var i = 0; i < polygon.length; i++) {
    //     var elem = polygon[i];
    //     var xx = elem.getAttribute("data-x");
    //     var yy = elem.getAttribute("data-y");
    //     var zz = elem.getAttribute("data-z");
    //     if (hexDistance(xx, yy, zz, currentX, currentY, currentZ) <= moveDist) {
    //         if (elem.getAttribute("data-land") == "1") {
    //             elem.setAttribute('style', styleDist);
    //         } 
    //         else {
    //             elem.setAttribute('style', styles3); 
    //         }
    //     }
    // }

    for (var i = 0; i < ids.length; i++) {
    	polygon[ids[i]].setAttribute('style', styleDist);
    }

	if ((event.target.tagName) == "polygon") {
		$(event.target).attr('style', styles2);
	}
	else if ((event.target.tagName) == "text") {
		$(event.target).prev("polygon").attr('style', styles2);
	}
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

// function mouseoverHandler(event) {
//   console.log($(event.target).attr("data-x")+" "+$(event.target).attr("data-y")+" "+$(event.target).attr("data-z"));
// }

function hexDistance(x1, y1, z1, x2, y2, z2) {
    return Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1), Math.abs(z2 - z1));
}

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
    if (polygon[id].getAttribute('data-land') == "1" && player > 0) {
        var troop = parseInt(polygon[id].getAttribute("data-troop"));
	    // Add troop in every click
	    troop++;

	    polygon[id].setAttribute("data-troop",troop);
	 	polygon[id].setAttribute("data-player",player);
	    // texting[id].setAttribute("data-troop", troop);
	    // $(event.target).attr("data-troop", troop);
	    texting[id].innerHTML = troop;
	    refreshTroop();
	  }
}

// Move troop from starting point
function moveTroopFrom(event) { 
    var polygon = $("svg polygon");
    start_id = parseInt($(event.target).attr("data-id"));
    start_troop = parseInt(polygon[start_id].getAttribute("data-troop"));
    start_coor = returnPos(start_id);
    move_troop = start_troop;
		console.log("from: "+ids);

}

function moveTroopTo(event) {
    var polygon = $("svg polygon");
    end_id = parseInt($(event.target).attr("data-id"));
    end_troop = parseInt(polygon[end_id].getAttribute("data-troop"));
    end_coor = returnPos(end_id);
    // var dist = hexDistance(start_coor[0], start_coor[1], start_coor[2], end_coor[0], end_coor[1], end_coor[2]);
        console.log("start_id= "+start_id);
        console.log("end_id= "+end_id);
        console.log(ids);
    for (var i=0;i<ids.length; i++) {
		if (end_id==ids[i]) {
			attackJudge(start_id, end_id, move_troop);
			refreshTroop();
		}
	}
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
    	var land = polygon[i].getAttribute("data-land"); // data-land = 1:land, 0:water
    	if (hexDistID(cid,i) == 1 && land == "1") {
            id1.push(i);     // Distance 1's id 
        }
    }
    for (var i = 0; i < polygon.length; i++) {
        for (var j = 0; j < id1.length; j++) {
            var node = id1[j];
	    	var land = polygon[i].getAttribute("data-land");
	    	if (hexDistID(i,node) == 1 && land == "1" && i != cid) {
                id2.push(i);  // Distance 2's id
            }
        }
    }

	// Turn Set object to normal array
    function logging(v1, v2, set) {
        ids.push(v1);
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

	// See if same person / not occupied
	if (user1 == user2 || user2 == -1) {  
		result[0] = army1 - move; // Start: move = troop - moved
        result[1] = army2 + move; // End

		if (result[0] == 0) {    
            polygon[attackID].setAttribute('data-player', -1); 
        }
		if (user2 == -1) { 
            polygon[defenseID].setAttribute('data-player', user1); 
        }
	} else if (user1 != user2) {    
		var attackRemain = Math.round(move - army2 * defensePercent);
		var defenseRemain = Math.round(army2 - move * attackPercent);
		if (attackRemain < 0) {
            attackRemain = 0;
        }	else if (defenseRemain < 0) {defenseRemain = 0;}

		if (defenseRemain <= 0) {
            // Attack wins!
			result[0] = army1 - move;
            result[1] = attackRemain;
			polygon[defenseID].setAttribute('data-player', user1);
		} else if(defenseRemain > 0) {
            // Defense wins!
			result[0] = army1 - move + attackRemain;		
            result[1] = defenseRemain;
        }
	}
	
	polygon[attackID].setAttribute('data-troop', result[0]);
	polygon[defenseID].setAttribute('data-troop', result[1]);
}

// function toggleHandler(event) {
//     Toggle between two classes of different colors
//     var styles1 = 'fill:#00ff00; opacity:0.5; stroke:black; stroke-width:1px; cursor:pointer;';
//     var styles2 = 'fill:red; opacity:1; stroke:black; stroke-width:1px; cursor:pointer;';
//     $(event.target).attr('style', function(index, attr) {
//         return attr == styles1 ? styles2 : styles1 ;
//     });
// }