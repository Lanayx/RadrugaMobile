define(["require", "exports"], function (require, exports) {
    "use strict";
    (function (GeoDirection) {
        GeoDirection[GeoDirection["East"] = 0] = "East";
        GeoDirection[GeoDirection["West"] = 1] = "West";
        GeoDirection[GeoDirection["South"] = 2] = "South";
        GeoDirection[GeoDirection["North"] = 3] = "North";
    })(exports.GeoDirection || (exports.GeoDirection = {}));
    var GeoDirection = exports.GeoDirection;
});
