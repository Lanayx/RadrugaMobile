/// <reference path="tsDefinitions/cordova/plugins/Device.d.ts" />
/// <reference path="../kendo/typescript/jquery.d.ts" />
/// <reference path="tsDefinitions/require.d.ts" />

export class ImageCache {
    private static imgCache;

    //To call after init
    static getImagePath(url: string): JQueryPromise<string> {
        var deferred = $.Deferred();

        ImageCache.imgCache.isCached(url, (path, fileEntry) => {
            if (fileEntry != null) {
                // already cached
                deferred.resolve(fileEntry.toURL());
            } else {
                // not there, need to cache the image
                ImageCache.imgCache.cacheFile(url,
                    (fullPath) => {
                        deferred.resolve(fullPath);
                    },
                    () => {
                        deferred.fail();
                    });
            }
        });
        return deferred.promise();
    }

    static getImagePathWithInit(url: string) : JQueryPromise<string> {
        return ImageCache.init().then<string>(() => { return ImageCache.getImagePath(url); });
    }
  
    static clearCache() {
        require(["imgcache"], (imgCache) => {
            imgCache.clearCache();
        });
    }

    static init() : JQueryPromise<any> {
        var deferred = $.Deferred();

        if (ImageCache.imgCache) {
            deferred.resolve();
        } else {
            require(["imgcache"], (imgCache) => {
                ImageCache.imgCache = imgCache;
                imgCache.init(deferred.resolve, deferred.fail);
            });
        }
        return deferred.promise();
    }
}
