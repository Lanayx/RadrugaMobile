/// <reference path="../tsDefinitions/require.d.ts" />
/// <reference path="../tsDefinitions/custom/geoLib.d.ts" />
/// <reference path="../../kendo/typescript/jquery.d.ts" />

import conf = require("../Configuration");
import geoTools = require("../geoLocation/GeoTools");
import wsInterfaces = require("../models/WsInterfaces");
import appTools = require("../ApplicationTools");

export class GeoCoordinate {

    latitude:number;
    longitude:number;
    altitude:number;
    verticalAccuracy:number;
    horizontalAccuracy:number;
    speed:number;
    course: number;

    getDistance(coordinate: GeoCoordinate, accuracy? :number): JQueryPromise<number> {
        return geoTools.getGeolib().then((geolib) => {
            return geolib.getDistance(this, coordinate, accuracy || conf.Configuration.baseGeolocationAccuracy);
        });
    }

    static getCurrent(enableHighAccuracy?: boolean): JQueryPromise<GeoCoordinate> {
        var deferred = $.Deferred();

        var options: PositionOptions = { timeout: 10000, maximumAge: 5000, enableHighAccuracy: enableHighAccuracy };
        
        navigator.geolocation.getCurrentPosition((position: Position) => {
            var location = new GeoCoordinate();
            location.altitude = position.coords.altitude;
            location.latitude = position.coords.latitude;
            location.longitude = position.coords.longitude;
            location.speed = position.coords.speed;
            location.course = position.coords.heading;
            location.horizontalAccuracy = position.coords.accuracy;
            location.verticalAccuracy = position.coords.altitudeAccuracy;
            deferred.resolve(location);
        }, (error: PositionError) => {
            appTools.logError(`Message: ${error.message}; Code: ${error.code}`);
            deferred.reject(error.message);
        }, options);
        return deferred;
    }

    static getFromWsData(wsData: wsInterfaces.IWsCoordinate) : GeoCoordinate {
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
    }

    static getFromString(coordinate: string): GeoCoordinate {
        var location = new GeoCoordinate();
        if (coordinate == undefined) {
            return location;
        }
        var parts = coordinate.split(",");
        location.latitude = parts[0] ? +parts[0] : 0;
        location.longitude = parts[1] ? +parts[1] : 0;
        //location.altitude = parts[2] ? +parts[2] : 0;
        //location.horizontalAccuracy = parts[3] ? +parts[3] : 0;
        //location.verticalAccuracy = parts[4] ? +parts[4] : 0;
        //location.speed = parts[5] ? +parts[5] : 0;
        //location.course = parts[6] ? +parts[6] : 0;
        return location;
    }

    static convertToWsData(coordinate: GeoCoordinate): wsInterfaces.IWsCoordinate {
        var location: wsInterfaces.IWsCoordinate = {
            Altitude:coordinate.altitude,
            Latitude: coordinate.latitude,
            Longitude: coordinate.longitude,
            Speed: coordinate.speed,
            Course: coordinate.course,
            HorizontalAccuracy: coordinate.horizontalAccuracy,
            VerticalAccuracy: coordinate.verticalAccuracy
        };        
        return location;
    }
}