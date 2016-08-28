// Constructor
DistanceCalculator = function () {};

// Find move
DistanceCalculator.prototype.findMoveDist = function (cid) {
    var polygon = $("svg polygon");

    var id1 = [];
    var id2 = [];
    ids = [];

    for (var i = 0; i < polygon.length; i++) {
        var land = polygon[i].getAttribute("data-land"); // data-land = 1:land, 0:water
        if (this.hexDistID(cid, i) == 1 && land == "1") {
            id1.push(i); // distance 1's id 
        }
    }
    for (var i = 0; i < polygon.length; i++) {
        for (var j = 0; j < id1.length; j++) {
            var node = id1[j];
            var land = polygon[i].getAttribute('data-land');
            if (this.hexDistID(i, node) == 1 && land == "1" && i != cid) {
                id2.push(i); // distance 2's id
            }
        }
    }

    function logging(v1, v2, set) {
        ids.push(v1);
    }
    // Turn Set object to normal array
    new Set(id1.concat(id2)).forEach(logging);

    return ids;
}

DistanceCalculator.prototype.hexDistID = function (id1, id2) {
    var polygon = $("svg polygon");
    var x1 = parseInt(polygon[id1].getAttribute('data-x'));
    var y1 = parseInt(polygon[id1].getAttribute('data-y'));
    var z1 = parseInt(polygon[id1].getAttribute('data-z'));
    var x2 = parseInt(polygon[id2].getAttribute('data-x'));
    var y2 = parseInt(polygon[id2].getAttribute('data-y'));
    var z2 = parseInt(polygon[id2].getAttribute('data-z'));
    return Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1), Math.abs(z2 - z1));
}