/// <reference path="../tsDefinitions/custom/geoLib.d.ts" />
import coord = require("../geoLocation/GeoCoordinate");
import direction = require("../geoLocation/GeoDirection");

export function areCoordinatesEqual(coord1: coord.GeoCoordinate, coord2: coord.GeoCoordinate, accuracy: number): JQueryPromise<boolean> {
    return coord1.getDistance(coord2).then((dist) => { return (dist < accuracy); });
}

export function getPathLength(...coordinates: coord.GeoCoordinate[]): JQueryPromise<number> {
    return getGeolib().then((geoLib) => {
        return geoLib.getPathLength(coordinates);
    });
}

export function getSpeed(start: coord.GeoCoordinate, end: coord.GeoCoordinate): JQueryPromise<number> {
    return getGeolib().then((geoLib) => {
        return geoLib.getSpeed(start, end);
    });
}

export function getDistanceInDirection(start: coord.GeoCoordinate,
    end: coord.GeoCoordinate, direct
    : direction.GeoDirection): JQueryPromise<number> {

    var dirCoord = new coord.GeoCoordinate();
    var endInWest = start.longitude < end.longitude;
    var endInNorth = start.latitude < end.latitude;
    switch (direct) {
        case direction.GeoDirection.East: {
            dirCoord.latitude = start.latitude;
            dirCoord.longitude = end.longitude;
            return start.getDistance(dirCoord).then((val) => {
                return (endInWest ? (val * -1) : val);
            });
        }
        case direction.GeoDirection.West: {
            dirCoord.latitude = start.latitude;
            dirCoord.longitude = end.longitude;
            return start.getDistance(dirCoord).then((val) => {
                return (endInWest ? val : (val * -1));
            });
        }
        case direction.GeoDirection.South: {
            dirCoord.latitude = end.latitude;
            dirCoord.longitude = start.longitude;
            return start.getDistance(dirCoord).then((val) => {
                return (endInNorth ? val * -1 : val);
            });
        }
        case direction.GeoDirection.North: {
            dirCoord.latitude = end.latitude;
            dirCoord.longitude = start.longitude;
            return start.getDistance(dirCoord).then((val) => {
                return (endInNorth ? val : val * -1);
            });
        }
        default:
            throw new Error("Wrong direction");
    }
}

export function getCoordinateByVector(start: coord.GeoCoordinate, bearing: number, distance: number): coord.GeoCoordinate {

    var toDeg = angle => (angle * 180 / Math.PI);
    var toRad = angle => (angle * Math.PI / 180);

    /** http://www.movable-type.co.uk/scripts/latlong.html
     a is latitude, b is longitude, 
     y is the bearing (clockwise from north), 
     x is the angular distance d/R; 
     d being the distance travelled, R the earth’s radius*
     **/

    var
        radius = 6371e3, //meters
        x = distance / radius, // angular distance in radians
        y = toRad(bearing),
        a1 = toRad(start.latitude),
        b1 = toRad(start.longitude);

    var a2 = Math.asin(Math.sin(a1) * Math.cos(x) + Math.cos(a1) * Math.sin(x) * Math.cos(y));

    var b2 = b1 + Math.atan2(Math.sin(y) * Math.sin(x) * Math.cos(a1), Math.cos(x) - Math.sin(a1) * Math.sin(a2));

    b2 = (b2 + 3 * Math.PI) % (2 * Math.PI) - Math.PI; // normalise to -180..+180°

    var result = new coord.GeoCoordinate();
    result.latitude = toDeg(a2);
    result.longitude = toDeg(b2);
    return result;
}

export function getDirection(from: coord.GeoCoordinate, to: coord.GeoCoordinate): string {
    var toRad = angle => (angle * Math.PI / 180);
    var toDeg = angle => (angle * 180 / Math.PI);

    var startLatitude = toRad(from.latitude);
    var startLongitude = toRad(from.longitude);
    var endLatitude = toRad(to.latitude);
    var endLongitude = toRad(to.longitude);

    var dLong = endLongitude - startLongitude;

    var dPhi = Math.log(Math.tan(endLatitude / 2.0 + Math.PI / 4.0) / Math.tan(startLatitude / 2.0 + Math.PI / 4.0));
    if (Math.abs(dLong) > Math.PI) {
        if (dLong > 0.0) {
            dLong = -(2.0 * Math.PI - dLong);
        } else {
            dLong = (2.0 * Math.PI + dLong);
        }
    };
    var bearing = (toDeg(Math.atan2(dLong, dPhi)) + 360.0) % 360.0;
    if (bearing >= 315 || bearing < 45) {
        return "North";    
    } else if (bearing >= 45 && bearing < 135) {
        return "East";
    } else if (bearing >= 135 && bearing < 225) {
        return "South";
    } else {
        return "West";
    }
}

export function getGeolib(): JQueryPromise<Geolib> {
    var deferred = $.Deferred();
    require(["geolib"], (geolib) => {
        deferred.resolve(geolib);
    });
    return deferred;
}