// Constructor
GridsBuilder = function(row_num, col_num, radius) 
{
	this.row_num = row_num;
	this.col_num = col_num;
	this.radius = radius;
};

// Generate the map with land and water
GridsBuilder.prototype.generateMap = function()
{
	this.landPercent = 0.85;
	this.waterPercent = 0.15;
	
	this.groundMap = new Array(this.col_num);
	for (var i = 0; i < this.row_num; i++) 
	{ 
        this.groundMap[i] = [];
    }
	
	for (var i = 0; i < this.col_num; i++) 
	{
        for (var j = 0; j < this.row_num; j++) 
		{
            var random = Math.random();
            // 0: land, 1: water
            if (random <= this.landPercent) 
			{ 
                this.groundMap[i][j] = 0; 
            } 
            else 
			{ 
                this.groundMap[i][j] = 1; 
            }
		}
	}
};

// Generate hexagons according to the specified row number and column number
GridsBuilder.prototype.generateHexagons = function()
{
	var hex_x = 0; 
	var id = -1;

    for (var row = 0; row < this.row_num; row ++) 
    {
        for (var col = 0; col < this.col_num; col ++) 
        {
            // Offset is equal to the horizontal distance

            // Add unique identifier for grids
            id++;
            // The initial center point of drawing (+1 is to compensate the stroke width)
            var initial = this.radius + 1;
            var offset = this.radius * Math.cos(Math.PI / 6); // r*cos(30deg)
            x = initial + col * offset * 2;
            y = initial + row * offset * Math.sqrt(3);        // r*(sin30 +1)
            // Offset to push the hexagons of every second row
            if (row % 2 !== 0) 
            {
                x += offset;
            }
            // Use special coordinate hex_x
            grids.drawHexagons(row, col, x, y, hex_x+col, row, id);
        } 
        // Every second row
        if ((row+1) % 2 == 0 && (row+1) > 0) 
        {
            hex_x--;
        }
    }
    
    player = 0;
    renderer.refreshTroop();
};

// =============================================================================================
// Hexagons attributes
// Draw hexagons with different colors
GridsBuilder.prototype.drawHexagons = function(row, col, x, y, hex_x, hex_y, id)
{
    var fillColor, land;
	var troop = 0;
    player = -1;

	var polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
	if (this.groundMap[row][col] == 0) {fillColor = '#00ff00'; land = 1;}      // 1: Land
	else if (this.groundMap[row][col] == 1) {fillColor = '#0000ff'; land = 0;} // 0: Water

	polygon.style.fill = fillColor;
	polygon.style.opacity = '0.5';
	polygon.style.stroke = 'black';
	polygon.style.strokeWidth = '1px';
	polygon.style.cursor = "pointer";

	polygon.setAttribute('points', grids.drawSingleHexagon(x, y, this.radius));
    polygon.setAttribute('data-cx', x);               // data-* : custom attribute
	polygon.setAttribute('data-cy', y);
	polygon.setAttribute('data-x', hex_x);            
	polygon.setAttribute('data-y', hex_y);
	polygon.setAttribute('data-z', (-hex_x - hex_y));
	polygon.setAttribute('data-id', id);
    
	polygon.setAttribute('data-land', land);
	polygon.setAttribute('data-troop', troop);
	polygon.setAttribute('data-player', player);
	polygon.setAttribute('data-moveRemain', 0);

	var svg = document.getElementById('hexGrid');
	svg.appendChild(polygon);
	// Build text for army number
	var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
	text.setAttribute('x', (x - this.radius * 0.2));
	text.setAttribute('y', (y + this.radius * 0.2));
	text.setAttribute('data-id', id);
	text.setAttribute('font-size', this.radius * 0.7);
	text.innerHTML = troop;
	svg.appendChild(text);
};

// Draw a single hexagon using mathematics and return the coordinate in svg format
GridsBuilder.prototype.drawSingleHexagon = function(x, y, radius) 
{
    // Count from 2 pt from top, anti-clockwise
    var tmp = [];
    for (var theta = Math.PI / 6; theta < (Math.PI * 2); theta += Math.PI / 3) 
	{
        var pointX = x + radius * Math.cos(theta);
        var pointY = y + radius * Math.sin(theta);
        // HexPoints.push([pointX, pointY]); // Overall hex array storage
        tmp.push(pointX + "," + pointY);  // tmp output for drawing one hexagon
    }   
    return tmp.join(" ");
};