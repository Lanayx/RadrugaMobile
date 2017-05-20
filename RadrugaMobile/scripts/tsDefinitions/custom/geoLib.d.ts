//details at https://github.com/manuelbieh/Geolib

interface Geolib {
    /**
	* Calculates the distance between two geo coordinates
	* Return value is always an integer and represents the distance in meters
	* @param start Latitude and Longitude of start
	* @param end Latutude and Longitude of end
	* @param accuracy Accuracy in meters
	**/
    getDistance(start: GeoLibCoordinate, end: GeoLibCoordinate, accuracy?: number): number

    /**
	* Calculates the length of a collection of coordinates
    * Returns the length of the path in meters
	* @param coords collection of coordinates
	**/
    getPathLength(coords: GeoLibCoordinate[]): number

    /**
	* Calculates the speed between two points within a given time span.
	* Returns the speed in options.unit (default is km/h).
	* @param start Latitude and Longitude of start
	* @param end Latutude and Longitude of end
    **/
    getSpeed(start: GeoLibCoordinate, end: GeoLibCoordinate): number
}

interface GeoLibCoordinate {
    latitude : number;
    longitude : number;
}