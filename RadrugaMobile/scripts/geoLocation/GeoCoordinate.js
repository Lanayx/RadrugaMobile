define(["require", "exports", "../Configuration", "../geoLocation/GeoTools", "../ApplicationTools"], function (require, exports, conf, geoTools, appTools) {
    "use strict";
    var GeoCoordinate = (function () {
        function GeoCoordinate() {
        }
        GeoCoordinate.prototype.getDistance = function (coordinate, accuracy) {
            var _this = this;
            return geoTools.getGeolib().then(function (geolib) {
                return geolib.getDistance(_this, coordinate, accuracy || conf.Configuration.baseGeolocationAccuracy);
            });
        };
        GeoCoordinate.getCurrent = function (enableHighAccuracy) {
            var deferred = $.Deferred();
            var options = { timeout: 10000, maximumAge: 5000, enableHighAccuracy: enableHighAccuracy };
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
                appTools.logError("Message: " + error.message + "; Code: " + error.code);
                deferred.reject(error.message);
            }, options);
            return deferred;
        };
        GeoCoordinate.getFromWsData = function (wsData) {
            var location = new GeoCoordinate();
            if (wsData == undefined) {
                return location;
            }
            location.altitude = wsData.Altitude;
            location.latitude = wsData.Latitude;
            location.longitude = wsData.Longitude;
            location.speed = wsData.Speed;
            location.course = wsData.Course;
            location.horizontalAccuracy = wsData.HorizontalAccuracy;
            location.verticalAccuracy = wsData.VerticalAccuracy;
            return location;
        };
        GeoCoordinate.getFromString = function (coordinate) {
            var location = new GeoCoordinate();
            if (coordinate == undefined) {
                return location;
            }
            var parts = coordinate.split(",");
            location.latitude = parts[0] ? +parts[0] : 0;
            location.longitude = parts[1] ? +parts[1] : 0;
            return location;
        };
        GeoCoordinate.convertToWsData = function (coordinate) {
            var location = {
                Altitude: coordinate.altitude,
                Latitude: coordinate.latitude,
                Longitude: coordinate.longitude,
                Speed: coordinate.speed,
                Course: coordinate.course,
                HorizontalAccuracy: coordinate.horizontalAccuracy,
                VerticalAccuracy: coordinate.verticalAccuracy
            };
            return location;
        };
        return GeoCoordinate;
    }());
    exports.GeoCoordinate = GeoCoordinate;
});
