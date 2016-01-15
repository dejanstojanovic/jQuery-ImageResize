/*
 * jQuery Plugin: jQuery Image Resize
 * https://github.com/dejanstojanovic/jQuery-ImageResize
 * Version 1.0.0
 *
 * Copyright (c) 2016 Dejan Stojanovic (http://dejanstojanovic.net)
 *
 * Released under the MIT license
 */

$.fn.ImageResize = function (options) {
    var defaults = {
        maxWidth: Number.MAX_VALUE,
        maxHeigt: Number.MAX_VALUE,
        onImageResized: null,
        onImagesSelected: null,
        onImagesProcessed: null
    }
    var settings = $.extend({}, defaults, options);
    var selector = $(this);

    selector.each(function (index) {
        var control = selector.get(index);
        if ($(control).prop("tagName").toLowerCase() == "input" && $(control).attr("type").toLowerCase() == "file") {
            $(control).attr("accept", "image/*");
            $(control).attr("multiple", "true");
            
            control.addEventListener('change', handleFileSelect, false);
        }
        else {
            cosole.log("Invalid file input field");
        }
    });

    function handleFileSelect(event) {

        if (settings.onImagesSelected != null && typeof (settings.onImagesSelected) == "function") {
            settings.onImagesSelected(event);
        }

        //Check File API support
        if (window.File && window.FileList && window.FileReader) {
            var count = 0;
            var files = event.target.files;

            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                //Only pics
                if (!file.type.match('image')) {
                    count++;
                    continue;
                }

                var picReader = new FileReader();
                picReader.addEventListener("load", function (event) {
                    var picFile = event.target;
                    var imageData = picFile.result;
                    var img = new Image();
                    img.src = imageData;
                    img.onload = function () {
                        if (img.width > settings.maxWidth || img.height > settings.maxHeigt) {
                            var width = settings.maxWidth;
                            var height = settings.maxHeigt;

                            if (img.width > settings.maxWidth) {
                                width = settings.maxWidth;
                                var ration = settings.maxWidth / img.width;
                                height = Math.round(img.height * ration);
                            }

                            if (height > settings.maxHeigt) {
                                height = settings.maxHeigt;
                                var ration = settings.maxHeigt / img.height;
                                width = Math.round(img.width * ration);
                            }

                            var canvas = $("<canvas/>").get(0);
                            canvas.width = width;
                            canvas.height = height;
                            var context = canvas.getContext('2d');
                            context.drawImage(img, 0, 0, width, height);
                            imageData = canvas.toDataURL();

                            count++;

                            if (settings.onImageResized != null && typeof (settings.onImageResized) == "function") {
                                settings.onImageResized(imageData);
                            }

                            if (count == files.length) {
                                if (settings.onImagesProcessed != null && typeof (settings.onImagesProcessed) == "function") {
                                    settings.onImagesProcessed(imageData);
                                }
                            }
                        }

                    }
                    img.onerror = function () {
                        count++;
                    }
                });
                //Read the image
                picReader.readAsDataURL(file);
            }
        } else {
            console.log("Your browser does not support File API");
        }
    }


}