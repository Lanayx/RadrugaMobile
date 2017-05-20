/// <reference path="tsDefinitions/cordova/plugins/Device.d.ts" />
/// <reference path="../kendo/typescript/jquery.d.ts" />
/// <reference path="tsDefinitions/require.d.ts" />
define(["require", "exports"], function (require, exports) {
    "use strict";
    var ImageCache = (function () {
        function ImageCache() {
        }
        //To call after init
        ImageCache.getImagePath = function (url) {
            var deferred = $.Deferred();
            ImageCache.imgCache.isCached(url, function (path, fileEntry) {
                if (fileEntry != null) {
                    // already cached
                    deferred.resolve(fileEntry.toURL());
                }
                else {
                    // not there, need to cache the image
                    ImageCache.imgCache.cacheFile(url, function (fullPath) {
                        deferred.resolve(fullPath);
                    }, function () {
                        deferred.fail();
                    });
                }
            });
            return deferred.promise();
        };
        ImageCache.getImagePathWithInit = function (url) {
            return ImageCache.init().then(function () { return ImageCache.getImagePath(url); });
        };
        ImageCache.clearCache = function () {
            require(["imgcache"], function (imgCache) {
                imgCache.clearCache();
            });
        };
        ImageCache.init = function () {
            var deferred = $.Deferred();
            if (ImageCache.imgCache) {
                deferred.resolve();
            }
            else {
                require(["imgcache"], function (imgCache) {
                    ImageCache.imgCache = imgCache;
                    imgCache.init(deferred.resolve, deferred.fail);
                });
            }
            return deferred.promise();
        };
        return ImageCache;
    }());
    exports.ImageCache = ImageCache;
});
