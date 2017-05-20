import geoCoordinate = require("../geoLocation/GeoCoordinate");

export class Image {
    localUrl: string;
    description: string;
    geoTag: geoCoordinate.GeoCoordinate;

    constructor(localUrl: string, description?: string, geoTag?: geoCoordinate.GeoCoordinate) {
        this.localUrl = localUrl;
        this.description = description || "";
        this.geoTag = geoTag || null;
    }
}