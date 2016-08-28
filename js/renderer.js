// Constructor
Renderer = function() 
{
    // Land
    this.stylesLand = 'fill:#00ff00; opacity:0.5; stroke:black; stroke-width:1px; cursor:pointer;';
    // Water
    this.stylesWater = 'fill:#ff00ff; opacity:0.5; stroke:black; stroke-width:1px; cursor:pointer;';
    // Starting point
    this.stylesStart = 'fill:red; opacity:1; stroke:black; stroke-width:1px; cursor:pointer;';

    // Distance
    this.stylesDist = 'fill:red; opacity:0.5; stroke:black; stroke-width:1px; cursor:pointer;';
    // No more troops to add
    this.stylesFinish = 'fill:grey; opacity:0.5; stroke:black; stroke-width:1px; cursor:pointer;';
    // Normal state
    this.stylesNormal = 'opacity:0.5; stroke:black; stroke-width:1px; cursor:pointer;';
};

Renderer.prototype.showDist = function(event) 
{
    var polygon = $("#hexGrid polygon");
    var cid = parseInt($(event.target).attr('data-id')); // Starting point id
    
    ids = distanceCalculator.findMoveDist(cid);
    for (var i = 0; i < ids.length; i++) 
    {
        polygon[ids[i]].setAttribute('style', this.stylesDist);
    }

    $(event.target).attr('style', this.stylesStart);
}

Renderer.prototype.refreshTroop = function()
{
    var polygon = $("svg polygon");
    var text = $("svg text");
    
    // console.log(renderer.refreshTroop);
    for (var i = 0; i < polygon.length; i++) 
    {
        var troop = parseInt(polygon[i].getAttribute('data-troop'));
        var playerID = polygon[i].getAttribute('data-player');
        var moveRemain = parseInt(polygon[i].getAttribute('data-moveRemain'));
        // if empty land, belong to nobody
        if (troop == 0) 
        {
            polygon[i].setAttribute('data-player', -1);
        }
        if (playerID > -1) 
        {
            var color = PlayersInit.prototype.playersList[playerID].color;
        }

        text[i].innerHTML = troop;
        text[i].setAttribute('fill', color);
        if (troop == 0) 
        {
            text[i].style.display = "none";
        }
        else 
        {
            if (troop >= 10)
            {
                var x = polygon[i].getAttribute('data-cx');
                text[i].setAttribute('x', (x - grids.radius * 0.35));
            }
            text[i].style.display = "block"; 
            // console.log("moving", moveRemain, i);
            
            if (gameMode == "move")
            {
                if (moveRemain == 0)
                {
                    // console.log("grey");
                    polygon[i].setAttribute('style', this.stylesFinish);
                } 
                else if (moveRemain > 0)
                {
                    // console.log("black");
                    polygon[i].setAttribute('style', this.stylesLand);
                }
            }  
        }  
    }
};

Renderer.prototype.refreshAdd = function()
{
    $("footer #roundAddNum").text("Add Troop remain: "+PlayersInit.prototype.playersList[player].roundAddNum);
};
/*
function refreshAddRangeNum()
{
    $(".popup span#range").text(PlayerList[player].roundAddNum);
}
*/

Renderer.prototype.clearHighlight = function()
{
    var polygon = $("#hexGrid polygon");
    for (var i = 0; i < polygon.length; i++) 
    {
        if (polygon[i].getAttribute('data-land') == "1") 
        {
            polygon[i].setAttribute('style', this.stylesNormal+"fill:#00ff00");
        }
        else if (polygon[i].getAttribute('data-land') == "0") 
        {
            polygon[i].setAttribute('style', this.stylesNormal+"fill:#0000ff");
        }
    } 
};

// popup window
Renderer.prototype.popup_pos = function(x,y)
{
    $(".popup").css({"top":(y+20),"left":(x+20)});
};

Renderer.prototype.showAddValue = function(value)
{
    document.getElementById("range").innerHTML = value;
    $("input").attr('value', value);
    addedTroop = parseInt(value);
    // console.log("addedTroop=", addedTroop);
};

Renderer.prototype.showMoveValue = function(value)
{
    document.getElementById("range").innerHTML = value;
    $("input").attr('value', value);
    move_troop = parseInt(value);
    // console.log(value);;
};