var svg = document.getElementById('hexGrid');

// Drag and drop
var mx, my, oldMx, oldMy;
var transX, transY;
var start_drag = false;
var refreshVar, refreshVar2;
var framing = document.getElementById("frame");
var frame_width = parseInt($("main").css('width'));
var frame_height = parseInt($("main").css('height'));
$(".page-wrapper").css({
    "width": $(window).width(),
    "height": ($(window).height() - 60)
});
// $(".frame").css({"wdith": $(window).width(), "height": $(window).height()});

// Store ids within moving distance 2
var ids;

//OBJECTS INIT
var renderer = new Renderer();

var grids = new GridsBuilder(10, 10, 35);
grids.generateMap();
grids.generateHexagons();

var player1 = new PlayersInit(0, '#5555ee', 0, 0, 5);
var player2 = new PlayersInit(1, 'orange', 0, 0, 5);
PlayersInit.prototype.playersList = [player1, player2];

var landsAssigner = new LandsAssigner();
landsAssigner.randomAssign();

var troopManager = new TroopManager(0.6, 0.7, 2);
var distanceCalculator = new DistanceCalculator();

var gameMode = "stop";

//main

gameLoop();

function gameLoop() {
    roundBegin();

    $(document).click(function () {
        console.log(gameMode);
    });

    $("button#player1").css({
        "background-color": "yellow"
    });
    player = 0;
    $(window).resize(function () {
        $(".page-wrapper").css({
            "width": $(window).width(),
            "height": ($(window).height() - 60)
        });
    });

    refreshVar = setInterval(renderer.refreshAdd, 500);
    // Update news
    $("button#add").click(function () {
        // var id;
        gameMode = "add";
        refreshVar = setInterval(renderer.refreshAdd, 500);
        $("button").not("button#player1, button#player2").css({
            "background-color": "white"
        });
        $("button#add").css({
            "background-color": "yellow"
        });
    });

    // popup window
    var moveFlag = 0;
    var flag2 = 0;
    var idAdd;
    $("#hexGrid polygon, #hexGrid text").on('click', function (event) {
        // console.log("hihi");
        if (gameMode == "add") {
            idAdd = troopManager.passAddTroop(event);
        }
        // console.log("added mode1");
        else if (gameMode == "move") {
            if (moveFlag == 0) {
                // Only allow players to control their troops
                if (moveTroopFrom(event)) {
                    renderer.showDist(event);
                    moveFlag = 1;
                } else {
                    moveFlag = 0;
                } // Fail
            }
            // Second step, pass id after click ok
            else if (moveFlag == 1) {
                flag2 = troopManager.passMoveTroop(event);
                moveFlag = 0;

                if (flag2 == -1) {
                    renderer.clearHighlight();
                    flag2 = 0;
                }
            }
            // console.log("transfer mode1");
        }
    });

    $(".popup #ok").on('click', function () {
        if (gameMode == "add" && idAdd != -1) {
            troopManager.addTroop(idAdd);
        } else if (gameMode == "move" && flag2 == 1) {
            troopManager.moveTroopTo();
            renderer.clearHighlight();
            renderer.refreshTroop();
        }
    });

    $(".popup #remove").click(function () {
        $(".popup").css({
            "display": "none"
        });
        if (gameMode == "move") {
            renderer.clearHighlight();
        }
    });

    /*
    $("button#finishAdd").click(function()
    {
        gameMode = "finishAdd";
        $("button").not("button#player1, button#player2").css
        ({
            "background-color": "white"
        });
        
        $("button#finishAdd").css
        ({
            "background-color": "yellow"
        });
        troopManager.renewMoveRemain()
    });
    */

    $("button#stop").click(function () {
        gameMode = "stop";
        clearInterval(refreshVar); // Clear add remain
        $("footer #roundAddNum").text("");

        $("button").not("button#player1, button#player2").css({
            "background-color": "white"
        });

        $("button#stop").css({
            "background-color": "yellow"
        });
    });

    $("button#move").click(function () {
        if (PlayersInit.prototype.playersList[player].roundAddNum == 0) {
            gameMode = "move";
            clearInterval(refreshVar); // Clear add remain
            troopManager.renewMoveRemain(); // Ensure all troops added
            $("footer #roundAddNum").text("");

            $("button").not("button#player1, button#player2").css({
                "background-color": "white"
            });
            $("button#move").css({
                "background-color": "yellow"
            });
        } else {
            alert("Not completed the add troop step!");
        }
    });

    $("button#player1").click(function () {
        $("button#player2").css({
            "background-color": "white"
        });

        $("button#player1").css({
            "background-color": "yellow"
        });

        player = 0;
    });

    $("button#player2").click(function () {
        $("button#player1").css({
            "background-color": "white"
        });

        $("button#player2").css({
            "background-color": "yellow"
        });

        player = 1;
    });

    $("button#commit").click(function () {
        $("button").not("button#player1, button#player2").css({
            "background-color": "white"
        });

        $("button#commit").css({
            "background-color": "yellow"
        });

        roundBegin();
    });

    setCenter();

    svg.addEventListener('mousemove', function (event) {
        traceMouse(event);
    }, false);

    framing.addEventListener('mousewheel', function (event) {
        var flag;
        traceMouse(event);
        resizeSVG(event);
    }, false);

    svg.addEventListener('mousedown', dragStart, false);
    document.body.addEventListener('mouseup', dragEnd, false);
}

function roundBegin() {
    for (var i = 0; i < PlayersInit.prototype.playersList.length; i++) {
        PlayersInit.prototype.playersList[i].roundAddNum = 5;
    }
    troopManager.renewMoveRemain();
    renderer.refreshTroop();
}

// Drag and drop, resize
function setCenter() {
    var box_height = parseInt(svg.getAttribute('height'));
    var box_width = parseInt(svg.getAttribute('width'));
    transX = frame_width / 2 - box_width / 2;
    transY = frame_height / 2 - box_height / 2;
    svg.style.transform = "translate(" + transX + "px," + transY + "px)";
}

function traceMouse(event) {
    var svg_coor = svg.getBoundingClientRect();
    var framing_coor = framing.getBoundingClientRect();
    mx = event.clientX - svg_coor.left;
    my = event.clientY - svg_coor.top;
    if (start_drag == true) {
        var frameX = event.clientX - framing_coor.left;
        var frameY = event.clientY - framing_coor.top;
        transX = frameX - oldMx;
        transY = frameY - oldMy;
        svg.style.transform = "translate(" + transX + "px," + transY + "px)";
    }
}

function resizeSVG(e) {
    var size_x, size_y, scale_x, scale_y;
    var step_x = 100;
    var step_y = 100;
    var minSize_x = 450;
    var minSize_y = 380;
    var maxSize_x = 1850;
    var maxSize_y = 1780;
    var oldTransX = transX;
    var oldTransY = transY;
    size_x = parseInt(svg.getAttribute('width'));
    size_y = parseInt(svg.getAttribute('height'));

    var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail))); // -1 to 1
    size_x = Math.max(minSize_x, Math.min(maxSize_x, size_x + delta * step_x));
    size_y = Math.max(minSize_y, Math.min(maxSize_y, size_y + delta * step_y));
    svg.setAttribute('height', size_y);
    svg.setAttribute('width', size_x);

    if (size_x != minSize_x && size_x != maxSize_x &&
        size_y != minSize_y && size_y != maxSize_y) {
        resizeFlag = true;
    }

    if (resizeFlag == true) {
        if (delta == 1) {
            scale_y = size_y / (size_y - step_y);
            scale_x = size_x / (size_x - step_x);
        } else if (delta == -1) {
            scale_x = size_x / (size_x + step_x);
            scale_y = size_y / (size_y + step_y);
        }

        var dx = (scale_x - 1) * mx; // Find distance moved for chosen point
        var dy = (scale_y - 1) * my;
        transX = oldTransX - dx;
        transY = oldTransY - dy;

        svg.style.transform = "translate(" + transX + "px," + transY + "px)";
        if (size_x == minSize_x || size_x == maxSize_x ||
            size_y == minSize_y || size_y == maxSize_y) {
            resizeFlag = false;
        }
    }
}

function dragStart() {
    start_drag = true;
    oldMx = mx;
    oldMy = my;
}

function dragEnd() {
    start_drag = false;
}