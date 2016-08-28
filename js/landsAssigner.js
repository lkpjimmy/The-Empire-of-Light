// Constructor
LandsAssigner = function () {
    var polygon = $("svg polygon");

    // Number of lands each player starts with
    this.initialLandNum = 4;
    // For choosing lands
    this.idList = [];

    // Initialize lands list
    for (var i = 0; i < polygon.length; i++) {
        if (polygon[i].getAttribute('data-land') == "1") {
            this.idList.push(i);
        }
    }
};

// user=user id; id=land id
LandsAssigner.prototype.addLandIDs = function (user, id) {
    var polygon = $("svg polygon");

    PlayersInit.prototype.playersList[user].landIDs.push(id);
    PlayersInit.prototype.playersList[user].land++;
    polygon[id].setAttribute('data-player', user);
};

LandsAssigner.prototype.deleteLandIDs = function (user, id) {
    var polygon = $("svg polygon");

    var land_ids = PlayersInit.prototype.playersList[user].landIDs;
    for (var i = land_ids.length - 1; i >= 0; i--) {
        if (land_ids[i] == id) {
            land_ids.splice(i, 1);
        }
    }
    PlayersInit.prototype.playersList[user].land--;
    polygon[id].setAttribute('data-player', -1);
};

LandsAssigner.prototype.randomAssign = function () {
    var polygon = $("svg polygon");

    // Assigns lands to users
    for (var j = 0; j < PlayersInit.prototype.playersList.length; j++) { // User id starts from 0
        for (var i = 0; i < this.initialLandNum; i++) { // Choose a random land to assign
            var random = Math.round(Math.random() * (this.idList.length - 1));
            this.addLandIDs(j, this.idList[random]);
            // Default troop number is 5
            polygon[this.idList[random]].setAttribute('data-troop', 5);
            // Remove chosen land from waiting list
            this.idList.pop(random);
        }
    }

    renderer.refreshTroop();
};