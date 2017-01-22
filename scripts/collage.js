












CollageBuilder = function (w, h) {

    this.init(w, h);
}


CollageBuilder.prototype = {

    init: function (w, h) {
        this.arr = [];

        for (var i = 0; i < 9; i++) {
            this.arr[i] = [];
            for (var j = 0; j < 9; j++) {
                this.arr[i][j] = new CollageItem(i, j, w / 9, h / 9);
            }
        }
    },

    fit: function (blocks) {
        var blockNum = 0;
        for (var row = 0; row < this.arr.length; row++) {
            for (var column = 0; column < this.arr[row].length; column++) {                

                var item = this.arr[row][column];
                var block = blocks[blockNum];

                var cell = this.arr[row][column];

                if (!cell.available) {
                    continue;
                }


                if (block.renderWidth < cell.width) {
                    block.renderHeight = scaleToWidth(cell.width + 10, block.renderWidth, block.renderHeight);
                    block.renderWidth = cell.width + 10;
                }
                else if (block.renderHeight < cell.height) {
                    block.renderWidth = scaleToHeight(cell.height + 10, block.renderWidth, block.renderHeight);
                    block.renderHeight = cell.height + 10;
                }

                // setting the startX
                if (column == 0) {
                    block.startX = 0;
                }
                else if (column == this.arr[row].length - 1) {
                    block.startX = cell.getRightEdge() - block.renderWidth;
                }
                else {
                    block.startX = cell.getHorizontalCenter() - block.renderWidth / 2;
                }

                // setting the startY
                if (row == 0) {
                    block.startY = 0;
                }
                else if (row == this.arr.length - 1) {
                    block.startY = cell.getBottomEdge() - block.renderHeight;
                }
                else {
                    block.startY = cell.getVerticalCenter() - block.renderHeight / 2;
                }

                /*
                if (block.renderWidth > (cell.width * 1.5)) {
                    if (this.arr[row][column + 1] != null) {
                        this.arr[row][column + 1].available = false;
                    }
                }
                if (block.renderHeight > (cell.height * 1.5) && column > 0 && column < this.arr.length -1) {
                    if (this.arr[row + 1][column] != null) {
                        this.arr[row + 1][column].available = false;
                    }
                }
                */

                if (blocks[blockNum].hasOwnProperty("startX") && blocks[blockNum].hasOwnProperty("startY")) {
                    blockNum++;
                    block.fit = true;
                    cell.available = false;
                }
            }
        }
    },



}


CollageItem = function (row, column, width, height) {
    this.row = row;
    this.column = column;
    this.width = width;
    this.height = height;
    this.available = true;
}

CollageItem.prototype = {

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
	for (var x = 0; x <= bh; x += 100) {
		context.moveTo(0 + x + p, p);
		context.lineTo(0 + x + p, bh + p);
	}


	for (var x = 0; x <= bw; x += 100) {
		context.moveTo(p, 0 + x + p);
		context.lineTo(bw + p, 0 + x + p);
	}

	context.strokeStyle = "black";
	context.stroke();
}