// js codes go here
var svg = document.getElementById('hexGrid');
var x, y, row, col, pointX, pointY, theta;
// Radius can be configured later
var radius = 35;
// The initial center point of drawing (+1 is to compensate the stroke width)
var initial = radius + 1;

for (row = 0; row < 10; row += 1) {
    for (col = 0; col < 20; col += 1) {
        // Offset is equal to the horizontal distance
        var offset = radius * Math.cos(Math.PI / 6);

        x = initial + col * offset * 2;
        y = initial + row * offset * Math.sqrt(3);

        // Offset to push the hexagons of every second rows
        if (row % 2 !== 0) 
        {
            x += offset;
        }

        var polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        // Again, these information can be configured later
        polygon.style.fill = '#00ff00';
        polygon.style.opacity = '0.5';
        polygon.style.stroke = 'black';
        polygon.style.strokeWidth = '1px';

        polygon.setAttribute('points', drawHexSVG(x, y, radius));

        svg.appendChild(polygon);
    }
}

// Scan the hexagon from theta 30 degrees to 360 degrees
function drawHexSVG(x, y, radius) {
    // Array
    var points = [];

    for (var theta = Math.PI / 6; theta < Math.PI * 2; theta += Math.PI / 3) {
        var pointX, pointY;

        // Calculate the x and y increments
        pointX = x + radius * Math.cos(theta);
        pointY = y + radius * Math.sin(theta);

        // Push into array
        points.push(pointX + ',' + pointY);
    }
    // Format of SVG (x1,y1 x2,y2)
    return points.join(' ');
}