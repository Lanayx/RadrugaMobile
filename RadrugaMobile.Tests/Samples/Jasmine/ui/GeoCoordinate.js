/// <reference path="../../../../RadrugaMobile/scripts/tsDefinitions/require.d.ts" />
/// <reference path="../../../../RadrugaMobile/scripts/tsDefinitions/custom/geoLib.d.ts" />
/// <reference path="../../../../RadrugaMobile/kendo/typescript/jquery.d.ts" />
define(["require", "exports", "../../../../RadrugaMobile/scripts/Configuration"], function(require, exports, conf) {
    var GeoCoordinate = (function () {
        function GeoCoordinate() {
        }
        GeoCoordinate.prototype.getDistance = function (coordinate, accuracy) {
            var that = this;
            return this._getGeolib().then(function (geolib) {
                return geolib.getDistance(that, coordinate, accuracy || conf.Configuration.baseGeolocationAccuracy);
            });
        };

        GeoCoordinate.prototype._getGeolib = function () {
            var deferred = $.Deferred();
            require(["geolib"], function (geolib) {
                deferred.resolve(geolib);
            });
            return deferred;
        };

        GeoCoordinate.getCurrent = function (options) {
            var deferred = $.Deferred();

            navigator.geolocation.getCurrentPosition(function (position) {
                var location = new GeoCoordinate();
                location.altitude = position.coords.altitude;
                location.latitude = position.coords.latitude;
                location.longitude = position.coords.longitude;
                location.speed = position.coords.speed;
                location.course = position.coords.heading;
                location.horizontalAccuracy = position.coords.accuracy;
                location.verticalAccuracy = position.coords.altitudeAccuracy;
                deferred.resolve(location);
            }, function (error) {
                deferred.fail(function (errorCallback) {
                    errorCallback(error);
                });
            }, options);
            return deferred;
        };
        return GeoCoordinate;
    })();
    exports.GeoCoordinate = GeoCoordinate;
});
//# sourceMappingURL=GeoCoordinate.js.map
