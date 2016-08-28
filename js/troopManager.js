// Constructor
TroopManager = function(attackPercent, defensePercent, moveDist)
{
    this.attackPercent = attackPercent;
    this.defensePercent = defensePercent;
    this.moveDist = moveDist;   
}

// For moving troops
var start_troop, start_coor, end_troop, end_coor, move_troop, start_id, end_id;  
var addedTroop, rangeNumber;

TroopManager.prototype.addTroop = function(id)
{
    var polygon = $("svg polygon");
    var currentTroop = parseInt(polygon[id].getAttribute('data-troop'));
    $(".popup").css({"display": "none"});
    // addedTroop is easily undefied, since input element is not triggered
    if (!addedTroop) 
    {
        addedTroop = PlayersInit.prototype.playersList[player].roundAddNum;
    }

    polygon[id].setAttribute('data-troop', currentTroop + addedTroop);
    PlayersInit.prototype.playersList[player].roundAddNum -= addedTroop;
    // console.log(addedTroop);
    // console.log("after:"+PlayersInit.prototype.playersList[player].roundAddNum);

    renderer.refreshTroop();
}


TroopManager.prototype.passAddTroop = function(event)
{
    var polygon = $("svg polygon");
    var id = parseInt($(event.target).attr('data-id'));
    var who = parseInt(polygon[id].getAttribute('data-player'));
    
    console.log(player, who, polygon[id].getAttribute('data-land'));
    
    if (polygon[id].getAttribute('data-land') == "1" && player >= 0 && who == player) 
    {
        var svg_coor = svg.getBoundingClientRect();
        var cx = parseInt(polygon[id].getAttribute('data-cx')) + svg_coor.left;
        var cy = parseInt(polygon[id].getAttribute('data-cy')) + svg_coor.top;
        
        // Change previous addedTroop value to avoid error
        roundAdd = PlayersInit.prototype.playersList[player].roundAddNum;
        if (addedTroop > roundAdd || !addedTroop) 
        {
            addedTroop = roundAdd;
        }
        document.getElementById("range").innerHTML = addedTroop;        
        $(".popup input").attr('max', roundAdd);
        $(".popup input").attr('value',addedTroop);
        $(".popup .bar #title").text("add troops");

        // console.log(PlayersInit.prototype.playersList[player].roundAddNum);
        $(".popup input").attr('onmousemove', "renderer.showAddValue(this.value)");
        $(".popup input").attr('onchange', "renderer.showAddValue(this.value)");
        renderer.popup_pos(cx, cy);
        
        $(".popup").css({"display": "block"});

        return id;
    } 
    return -1;
}

// Move troop from starting point
function moveTroopFrom(event) 
{        
    var polygon = $("svg polygon");
    start_player = parseInt($(event.target).attr('data-player'));
    start_id = parseInt($(event.target).attr('data-id'));
    var moveRemain = parseInt(polygon[start_id].getAttribute('data-moveRemain'));
    if (start_player == player && moveRemain > 0)
    {
        start_troop = parseInt(polygon[start_id].getAttribute('data-troop'));
        if (!move_troop) // Make popup text responsive
        {
            move_troop = addedTroop;
        } 
        if (move_troop > moveRemain) 
        {
            move_troop = moveRemain;
        }
        document.getElementById("range").innerHTML = move_troop;
        // console.log("move_troop= ",move_troop);
        // console.log("range="+$("#range").text());
        return true;
    }
    return false;
}

TroopManager.prototype.passMoveTroop = function(event)
{
    var polygon = $("svg polygon");
    end_id = parseInt($(event.target).attr('data-id'));
    end_troop = parseInt(polygon[end_id].getAttribute('data-troop'));
    var moveRemain = parseInt(polygon[start_id].getAttribute('data-moveRemain'));
    
    for (var i = 0; i < ids.length; i++)
    {
        if (end_id == ids[i] && moveRemain > 0) 
        {
            var svg_coor = svg.getBoundingClientRect();
            var cx = parseInt(polygon[end_id].getAttribute('data-cx')) + svg_coor.left;
            var cy = parseInt(polygon[end_id].getAttribute('data-cy')) + svg_coor.top;
            $(".popup").css({"display": "block"});
            $(".popup input").attr('max', moveRemain);
            $(".popup input").attr('value', move_troop);
            $(".popup .bar #title").text("move troops");

            // move_troop=moveRemain if mouse not moved
            $(".popup input").attr('onmousemove', "renderer.showMoveValue(this.value)");
            $(".popup input").attr('onchange', "renderer.showMoveValue(this.value)");
            renderer.popup_pos(cx, cy); 

            return 1;
        }
    }
    return -1;
}

TroopManager.prototype.moveTroopTo = function() 
{
    $(".popup").css({"display": "none"});
    this.transferMoveRemain(start_id, move_troop);
    this.attackJudge(start_id, end_id, move_troop);
    renderer.refreshTroop();
}


TroopManager.prototype.attackJudge = function(attackID, defenseID, move) 
{
    var polygon = $("svg polygon"); 
    var result = [];
    var user1 = parseInt(polygon[attackID].getAttribute('data-player'));
    var user2 = parseInt(polygon[defenseID].getAttribute('data-player'));
    var army1 = parseInt(polygon[attackID].getAttribute('data-troop'));
    var army2 = parseInt(polygon[defenseID].getAttribute('data-troop'));

    // See if same person / not occupied
    if (user1 == user2 || user2 == -1) 
    {   
        result[0] = army1 - move; // move = troop moved (start)
        result[1] = army2 + move; // end

        // User moves all troops from one place to another
        if (result[0] == 0) 
        {
            landsAssigner.deleteLandIDs(user1,attackID);   
        }
        // User gets unoccupied land
        if (user2 == -1) 
        {
            landsAssigner.addLandIDs(user1,defenseID);
        }
    } 
    else if (user1 != user2)
    {    
        // Formula calculate casualty
        var attackRemain = Math.round(move - army2 * this.defensePercent);
        var defenseRemain = Math.round(army2 - move * this.attackPercent);
        if (attackRemain < 0) 
        {
            attackRemain = 0;
        }
        else if (defenseRemain < 0) 
        {
            defenseRemain = 0;
        }

        if (defenseRemain == 0 && attackRemain > 0) 
        {
            // Attack wins!
            result[0] = army1 - move;
            result[1] = attackRemain;
            landsAssigner.deleteLandIDs(user2, defenseID);
            landsAssigner.addLandIDs(user1, defenseID);
            this.transferMoveRemain(defenseID, army2); // all defense die

        } 
        else if(defenseRemain > 0) 
        {
            // Defense wins!
            result[0] = army1 - move + attackRemain;     
            result[1] = defenseRemain;
            if (result[0] == 0) 
            { 
                // All attack die, no army left from starting point
                landsAssigner.deleteLandIDs(user1, attackID);
            } 
        } 
        else if (defenseRemain == 0 && attackRemain == 0)
        {
            // Both die :)
            result[0]=0; result[1]=0;
            landsAssigner.deleteLandIDs(user1, attackID);
            landsAssigner.deleteLandIDs(user2, defenseID);
            this.transferMoveRemain(defenseID, army2); // all defense die
        }
    }
    
    polygon[attackID].setAttribute('data-troop', result[0]);
    polygon[defenseID].setAttribute('data-troop', result[1]);
}


TroopManager.prototype.renewMoveRemain = function()
{
    var polygon = $("svg polygon");
    for (var i = 0; i < PlayersInit.prototype.playersList.length; i++)
    {
        var lands = PlayersInit.prototype.playersList[i].landIDs;
        for (var j = 0; j < lands.length; j++)
        {
            var troop = polygon[lands[j]].getAttribute('data-troop');
            polygon[lands[j]].setAttribute('data-moveRemain', troop);
        }
    } 
};

TroopManager.prototype.transferMoveRemain = function(target_id, move)
{
    var polygon = $("svg polygon"); 
    var moveRemain = parseInt(polygon[target_id].getAttribute('data-moveRemain'));
    polygon[target_id].setAttribute('data-moveRemain', moveRemain-move);
}
