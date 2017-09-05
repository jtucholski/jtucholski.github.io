HotspotCanvas = function (hotspots, canvas_id, backgroundImage, eventCallback) {

    this.canvas = new fabric.Canvas(canvas_id);


    this.setBackground(backgroundImage);
    this.setHotspots(hotspots);
    this.setEventHandlers();

    this.selectedPhotoUrl = null;

    this.eventCallback = eventCallback;
}

HotspotCanvas.prototype = {

    getSelectedPhotoUrl: function () {
        return this.selectedPhotoUrl;
    },

    setSelectedPhotoUrl: function (url) {
        this.selectedPhotoUrl = url;
    },

    setBackground: function (backgroundImage) {
        this.addImage(backgroundImage, { selectable: false }, function (img) {
            img.sendToBack();
        });
    },

    addImageToHotspot: function (hotspotRect) {
        var _this = this;
        
        hotspotRect.image = true;        

        this.addImage(this.selectedPhotoUrl,
            {
                originX: 'left',
                originY: 'top',
                lockUniScaling: true,
                lockRotation: false,
                left: hotspotRect.hotspot.x,
                top: hotspotRect.hotspot.y,
                clipTo: function (ctx) {
                    var retina = _this.canvas.getRetinaScaling();
                    ctx.save();
                    ctx.setTransform(retina, 0, 0, retina, 0, 0);
                    ctx.rect(
                        hotspotRect.left,
                        hotspotRect.top,
                        hotspotRect.width,
                        hotspotRect.height);
                    ctx.restore();
                },

            }, function (img) {

                if (hotspotRect.width > hotspotRect.height) {
                    img.scaleToWidth(hotspotRect.width);
                }
                else {
                    img.scaleToHeight(hotspotRect.height);
                }
            });
    },

    downloadCanvas: function () {        

        var dataURLtoBlob = function (dataurl) {
            var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new Blob([u8arr], { type: mime });
        }

        var link = document.createElement("a");
        var imgData = this.canvas.toDataURL({
            format: 'png',
            multiplier: 4
        });
        var strDataURI = imgData.substr(22, imgData.length);
        var blob = dataURLtoBlob(imgData);
        var objurl = URL.createObjectURL(blob);

        link.download = "helloWorld.png";

        link.href = objurl;

        link.click();

    },

    setEventHandlers: function () {
        var _this = this;

        var disableScroll = function () {
            _this.canvas.allowTouchScrolling = false;
        };

        var enableScroll = function () {
            _this.canvas.allowTouchScrolling = true;
        };

        this.canvas.on('object:moving', disableScroll);
        this.canvas.on('object:scaling', disableScroll);
        this.canvas.on('object:rotating', disableScroll);
        this.canvas.on('mouse:up', enableScroll);


        var objects = this.canvas.getObjects('rect');
        objects.forEach(function (rect) {
            rect.on('mouseup', function () {
                if (_this.enabled) {
                    _this.addImageToHotspot(this);
                    _this.enableHotspots(false);
                    _this.eventCallback({
                        hotspotsRemaining: _this.getHotspotsWithoutImages(),
                        hotspots: _this.canvas.getObjects('rect').length
                    });
                }
            }, this);
        }, this);

    },

    getHotspotsWithoutImages: function () {
        var rects = this.canvas.getObjects('rect');
        return rects.filter((rect) => {
            return rect.image === undefined || rect.image === false;
        }).length;
    },

    setHotspots: function (hotspots) {
        for (var i = 0; i < hotspots.length; i++) {
            var hotspot = hotspots[i];
            var clipSpot = new fabric.Rect({
                originX: 'left',
                originY: 'top',
                left: hotspot.x,
                top: hotspot.y,
                height: hotspot.height,
                width: hotspot.width,
                fill: 'transparent',
                stroke: '#000',
                strokeWidth: 0,
                selectable: false,
            });

            this.canvas.add(clipSpot);
            clipSpot.hotspot = hotspot;
        }
    },

    /*
    * adds an image to the canvas
    * @imageUrl relative or global url of the image
    * @properties an object with the canvas properties to set on the image
    * @callback a callback function to invoke after the image has been added
    */
    addImage: function (imageUrl, properties, callback) {
        var _this = this;

        var imageObj = new Image();
        
        imageObj.onload = function() { 
            var image = new fabric.Image(imageObj);

            if (properties !== undefined) { 
                for(var p in properties) { 
                    image.set(p, properties[p]);
                }
            }

            _this.canvas.add(image);

            if (callback !== undefined) { 
                callback(image);
            }
        }
        imageObj.crossOrigin = 'anonymous';
        imageObj.src = imageUrl;

        // fabric.Image.fromURL(imageUrl, function (img) {

        //     if (properties !== undefined) {
        //         for (var p in properties) {
        //             img.set(p, properties[p]);
        //         }
        //     }

        //     _this.canvas.add(img);

        //     if (callback !== undefined) {
        //         callback(img);
        //     }
        // });
    },

    getDataUrl: function () {
        return this.canvas.toDataURL({

        });
    },

    enableHotspots: function (shouldEnable) {

        var strokeWidth = (shouldEnable) ? 1 : 0;

        this.enabled = shouldEnable;

        var objects = this.canvas.getObjects('rect');
        objects.forEach(function (rect) {
            rect.set('strokeWidth', strokeWidth);
            rect.bringToFront();
        }, this);

    },



}

function findByClipName(name) {
    return _(canvas.getObjects()).where({
        clipFor: name
    }).first()
}

var clipByName = function (ctx) {
    this.setCoords();
    var clipRect = findByClipName(this.clipName);
    var scaleXTo1 = (1 / this.scaleX);
    var scaleYTo1 = (1 / this.scaleY);
    ctx.save();

    var ctxLeft = -(this.width / 2) + clipRect.strokeWidth;
    var ctxTop = -(this.height / 2) + clipRect.strokeWidth;
    var ctxWidth = clipRect.width - clipRect.strokeWidth;
    var ctxHeight = clipRect.height - clipRect.strokeWidth;

    ctx.translate(ctxLeft, ctxTop);

    ctx.rotate(degToRad(this.angle * -1));
    ctx.scale(scaleXTo1, scaleYTo1);
    ctx.beginPath();
    ctx.rect(
        clipRect.left - this.oCoords.tl.x,
        clipRect.top - this.oCoords.tl.y,
        clipRect.width,
        clipRect.height
    );
    ctx.closePath();
    ctx.restore();
}

