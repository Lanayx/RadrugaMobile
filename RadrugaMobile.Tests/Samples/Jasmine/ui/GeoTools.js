define(["require", "exports", "../../../../RadrugaMobile/scripts/geoLocation/GeoCoordinate", "../../../../RadrugaMobile/scripts/geoLocation/Movement", "../../../../RadrugaMobile/scripts/Tools", "../../../../RadrugaMobile/scripts/Storage"], function(require, exports, coord, move, tools, storage) {
    function areCoordinatesEqual(coord1, coord2) {
        return coord1.getDistance(coord2, 1).then(function (dist) {
            return (dist < 2);
        });
    }
    exports.areCoordinatesEqual = areCoordinatesEqual;

    function getDistanceTo(target) {
        return coord.GeoCoordinate.getCurrent().then(function (current) {
            return current.getDistance(target);
        });
    }
    exports.getDistanceTo = getDistanceTo;

    function startMoving() {
        var movement = new move.Movement();
        movement.id = tools.getGuid();
        movement.startTime = new Date();
        return coord.GeoCoordinate.getCurrent().then(function (coord) {
            movement.start = coord;
            return movement;
        }).then(function (move) {
            storage.PermanentStorage.set("move_" + move.id, JSON.stringify(move));
            return move;
        });
    }
    exports.startMoving = startMoving;

    function continueMoving(id) {
        var movement = JSON.parse(storage.PermanentStorage.get("move_" + id));
        return coord.GeoCoordinate.getCurrent().then(function (coord) {
            movement.interMediatePoints.push(coord);
            return movement;
        }).then(function (move) {
            storage.PermanentStorage.set("move_" + move.id, JSON.stringify(move));
            return move;
        });
    }
    exports.continueMoving = continueMoving;

    function endMoving(id) {
        var movement = JSON.parse(storage.PermanentStorage.get("move_" + id));
        return coord.GeoCoordinate.getCurrent().then(function (coord) {
            movement.end = coord;
            movement.endTime = new Date();
            return movement;
        }).then(function (move) {
            storage.PermanentStorage.set("move_" + move.id, JSON.stringify(move));
            return move;
        });
    }
    exports.endMoving = endMoving;

    function clearMoving(id) {
        storage.PermanentStorage.remove(id);
    }
    exports.clearMoving = clearMoving;
});
//# sourceMappingURL=GeoTools.js.map
