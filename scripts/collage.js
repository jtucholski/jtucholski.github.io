const OverlapAmount = 0.6;

CollageBuilder = function (w, h, rows, columns) {
    this.init(w, h, rows, columns);
    
}


CollageBuilder.prototype = {

    init: function (w, h, numRows, numColumns) {
        this.arr = [];

        for (var i = 0; i < numRows; i++) {
            this.arr[i] = [];
            for (var j = 0; j < numColumns; j++) {
                this.arr[i][j] = new CollageCell(i, j, (w / numColumns), (h / numRows));
            }
        }
    },

    fit: function (blocks) {
        var blockNum = 4;

        this.fitCorners(blocks);        

        for (var row = 0; row < this.arr.length; row++) {
            for (var column = 0; column < this.arr[row].length; column++) {                
                
                var block = blocks[blockNum];                
                var cell = this.arr[row][column];

                if (!cell.isAvailable) {
                    console.log(`Cell ${row},${column} not available, skipping!`);
                    continue;
                }

                

                // setting the startX
                if (column == 0) {
                    block.startX = 0;
                }
                else if (column == this.arr[row].length - 1) {
                    block.startX = cell.getRightEdge() - block.renderWidth;
                }
                else {
                    if (row == 0){
                        block.startX = cell.getLeftEdge();                        
                        this.fitPicture(block, cell);
                    }
                    //block.startX = cell.getHorizontalCenter() - block.renderWidth / 2;
                }

                // setting the startY
                if (row == 0) {
                    block.startY = 0;
                }
                else if (row == this.arr.length - 1) {
                    block.startY = cell.getBottomEdge() - block.renderHeight;
                }
                else {                    
                   /* if (column == 0){
                        block.startY = cell.getTopEdge();
                        this.fitPicture(block, cell);
                    }
                    */
                }
                


                if (blocks[blockNum].hasOwnProperty("startX") && blocks[blockNum].hasOwnProperty("startY")) {
                    blockNum++;
                    block.fit = true;                    
                    this.blockAdjacentCells(block, cell);                                        
                }
            }
        }
    },

    fitCorners: function(blocks){

        var maxIndex = this.arr.length - 1;


        blocks[0].startX = 0; 
        blocks[0].startY = 0; 
        blocks[0].fit = true; 
        this.blockAdjacentCells(blocks[0], this.arr[0][0]);
        
        blocks[1].startX = this.arr[0][maxIndex].getRightEdge() - blocks[1].renderWidth;
        blocks[1].startY = 0;
        blocks[1].fit = true; 
        this.blockAdjacentCells(blocks[1], this.arr[0][maxIndex]);
        
        blocks[2].startX = 0;
        blocks[2].startY = this.arr[maxIndex][0].getBottomEdge() - blocks[2].renderHeight;
        blocks[2].fit = true;
        this.blockAdjacentCells(blocks[2], this.arr[maxIndex][0]);

        blocks[3].startX = this.arr[maxIndex][maxIndex].getRightEdge() - blocks[3].renderWidth;
        blocks[3].startY = this.arr[maxIndex][maxIndex].getBottomEdge() - blocks[3].renderHeight;
        blocks[3].fit= true;
        this.blockAdjacentCells(blocks[3], this.arr[maxIndex][maxIndex]);
    },

    blockAdjacentCells: function(block, cell){
                
        

        var numberOfRows = Math.floor(block.renderHeight / cell.height);
        var numberOfCols = Math.floor(block.renderWidth / cell.width);

        if((block.renderHeight / cell.height) % 1 > OverlapAmount){
            numberOfRows++;
        }
        if((block.renderWidth / cell.width) % 1 > OverlapAmount) { 
            numberOfCols++;
        }
        
        var i, j;        
        
        if(block.startY < cell.getTopEdge()) { 
            i = cell.row - (numberOfRows - 1);
        }
        else { 
            i = cell.row;
        }
 
                
        for(; i < cell.row + numberOfRows && i < this.arr.length; i++) {
            
            if (block.startX < cell.getLeftEdge()){
                j = cell.column - (numberOfCols - 1);
            }
            else {
                j = cell.column;
            }

            for(; j < cell.column + numberOfCols && j < this.arr[i].length; j++) {
                if(this.arr[i][j] != null) {
                    console.log(`Cell ${i},${j} - now unavailable.`);
                    this.arr[i][j].isAvailable = false;
                }
            }
        }
    },

    fitPicture: function(block, cell){

        var numberOfRows = Math.floor(block.renderHeight / cell.height);
        var numberOfCols = Math.floor(block.renderWidth / cell.width);

        var desiredWidth = block.renderWidth;

        //<-- MAX COL SIZE TODO
        
        if (numberOfCols >= 6) { 
            numberOfCols /= 1.5;
            numberOfRows /= 1.5;
            console.log("Image too large, cutting by 50%");
            desiredWidth = ((numberOfCols / 1.5) * cell.width) + 18;
            
        }
        else if ((block.renderWidth / cell.width) % 1 > 0.7 ) {
            numberOfCols++;            
            console.log("Image too small, adding width to consume remaining column");
            desiredWidth = (numberOfCols * cell.width) + 18;
        }
        else if((block.renderWidth / cell.width) % 1 == 0.0) {
            console.log("Image too small, adding width to fit square");            
            desiredWidth = (numberOfCols * cell.width) + 18;            
        }// Perfect Fit for the box, add overlap 

        console.log(`Going from ${block.renderWidth} to ${desiredWidth}`);
        block.renderHeight = scaleToWidth(desiredWidth, block.renderWidth, block.renderHeight);
        block.renderWidth = desiredWidth;

                   
        // Check to see if we need to shrink the picture
        for (var row = cell.row; row < cell.row + numberOfRows && row < this.arr.length; row++){            

            var desiredWidth = cell.width;

            for(var column = cell.column; column < cell.column + numberOfCols && column < this.arr[row].length; column++) {
            
                if(!this.arr[row][column].isAvailable){                                
                    block.renderHeight = scaleToWidth(desiredWidth, block.renderWidth, block.renderHeight);
                    block.renderWidth = desiredWidth;
                    console.log("RESIZING IMAGE!");
                    break;    
                }

                desiredWidth += cell.width;
            }            
        }        
    },

    

}


CollageCell = function (row, column, width, height) {
    this.row = row;
    this.column = column;
    this.width = width;
    this.height = height;
    this.isAvailable = true;
}

CollageCell.prototype = {

    getLeftEdge: function () {
        return this.column * this.width;
    },
    getTopEdge: function () {
        return this.row * this.height;
    },
    getRightEdge: function () {
        return this.width * (this.column + 1);
    },
    getBottomEdge: function () {
        return this.height * (this.row + 1);
    },
    getVerticalCenter: function () {
        return this.getTopEdge() + this.height / 2;
    },
    getHorizontalCenter: function () {
        return this.getLeftEdge() + (this.width / 2);
    }
}


function scaleToWidth(desiredWidth, actualWidth, actualHeight) {
    return (desiredWidth * actualHeight) / actualWidth;
}

function scaleToHeight(desiredHeight, actualWidth, actualHeight) {
    return (desiredHeight * actualWidth) / actualHeight;
}

function drawBoard(canvas, context) {
	var bh = 900;
	var bw = 900;
	var p = 0;
	for (var x = 0; x <= bh; x += 50) {
		context.moveTo(0 + x + p, p);
		context.lineTo(0 + x + p, bh + p);
	}


	for (var x = 0; x <= bw; x += 50) {
		context.moveTo(p, 0 + x + p);
		context.lineTo(bw + p, 0 + x + p);
	}

	context.strokeStyle = "black";
	context.stroke();
}