(function($) {
    $.fn.ImageResize = function(options) {
        var defaults = {
            maxWidth: Number.MAX_VALUE,
            maxHeight: Number.MAX_VALUE,
            longestEdge: Number.MAX_VALUE,
            onImageResized: null,
            onComplete: null,
            onFailure: null
    };

        var settings = $.extend({}, defaults, options);
        var selector = $(this);

        selector.each(function(index) {
            var control = selector.get(index);
            if ($(control).attr("tagName").toLowerCase() == "input" && $(control).attr("type").toLowerCase() == "file") {
                $(control).attr("accept", "image/*");
                $(control).attr("multiple", "true");

                control.addEventListener('change', handleFileSelect, false);
            } else {
                settings.onFailure("Invalid file input field");
            }
        });

        function handleFileSelect() {
            //Check File API support
            if (window.File && window.FileList && window.FileReader) {
                var files = event.target.files;

                if (files.length === 0) {
                    settings.onFailure("");
                    return false;
                }

                for (var i = 0; i < files.length; i++) {
                    var uploadedFile = files[i];
                    ////Only pics
                    var reader = new FileReader();

                    if (!uploadedFile.type.match('image')) {
                        reader.addEventListener("load", function(event) {
                            var file = event.target;
                            var fileData = file.result;
                            selector.each(function () {
                                if ($(this).val() !== "") {
                                    settings.onFailure("Please upload an image");
                                    return;
                                }
                            });
                        });
                    } else {
                        reader.addEventListener("load", function(event) {
                            var file = event.target;
                            var fileData = file.result;

                            var canvasSettings = {
                                width: 0,
                                height: 0,
                                adjustedHeight: Number.MAX_VALUE,
                                adjustedWidth: Number.MAX_VALUE,
                                img: new Image()
                            };
                            canvasSettings.img.src = fileData;
                            canvasSettings.img.onload = function() {
                                canvasSettings.height = canvasSettings.img.height;
                                canvasSettings.width = canvasSettings.img.width;

                                if (settings.longestEdge == Number.MAX_VALUE) {
                                    if (canvasSettings.img.width > settings.maxWidth || canvasSettings.img.height > settings.maxHeight) {

                                        if (canvasSettings.img.width > settings.maxWidth) {
                                            setBasedOnWidth(settings.maxWidth, canvasSettings);
                                        }

                                        if (canvasSettings.height > settings.maxHeight) {
                                            setBasedOnHeight(settings.longestEdge, canvasSettings);
                                        }
                                    }
                                } else {
                                    var widthIsLongest = (canvasSettings.img.width > canvasSettings.img.height) ? true : false;
                                    if (widthIsLongest) {
                                        if (canvasSettings.img.width > settings.longestEdge) {
                                            setBasedOnWidth(settings.longestEdge, canvasSettings);
                                        }
                                    } else {
                                        if (canvasSettings.img.height > settings.longestEdge) {
                                            setBasedOnHeight(settings.longestEdge, canvasSettings);
                                        }
                                    }
                                }

                                var canvas = $("<canvas/>").get(0);
                                canvas.width = canvasSettings.width;
                                canvas.height = canvasSettings.height;
                                var context = canvas.getContext('2d');
                                context.drawImage(canvasSettings.img, 0, 0, canvasSettings.width, canvasSettings.height);
                                fileData = canvas.toDataURL();

                                if (settings.onImageResized !== null && typeof (settings.onImageResized) == "function") {
                                    settings.onImageResized(fileData);
                                }

                                selector.each(function () {
                                    if ($(this).val() !== "") {
                                        settings.onComplete(fileData, true, $(this));
                                    }
                                });

                            };
                            canvasSettings.img.onerror = function() {
                                settings.onFailure("Please upload a file.");
                            };
                        });
                    }
                        //Read the file
                        reader.readAsDataURL(uploadedFile);

                }
            } else {
                settings.onFailure("Your browser does not support File API");
            }

        }

        function setBasedOnWidth(adjustedWidth, canvasSettings) {
            canvasSettings.width = adjustedWidth;
            var ration = canvasSettings.width / canvasSettings.img.width;
            canvasSettings.height = Math.round(canvasSettings.img.height * ration);
        }

        function setBasedOnHeight(adjustedHeight, canvasSettings) {
            canvasSettings.height = adjustedHeight;
            var ration = canvasSettings.height / canvasSettings.img.height;
            canvasSettings.width = Math.round(canvasSettings.img.width * ration);
        }

    };
}(jQuery));
