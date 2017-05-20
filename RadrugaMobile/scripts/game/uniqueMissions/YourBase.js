define(["require", "exports", "../../Enums", "../../Navigation", "../../geoLocation/GeoTools", "../../models/User", "../../Storage", "../../../scripts/ApplicationTools"], function (require, exports, enums, navigation, GeoTools, us, storage, appTools) {
    "use strict";
    function navigate() {
        var user = us.User.getFromStorage();
        if (!user.homeCoordinate) {
            appTools.logError("Home coordinate is " + user.homeCoordinate + ", on Your base. User data: " + JSON.stringify(user) + ". Trying user refresh");
            us.User.getFromApi().done(function (freshUser) {
                process(freshUser);
            }).fail(function () {
                appTools.logError("Couldn't refresh user");
                navigator.notification.alert(appTools.getText("cmApiError"), function () { }, appTools.getText("cmApiErrorTitle"), "OK");
            });
        }
        else {
            process(user);
        }
    }
    exports.navigate = navigate;
    function process(user) {
        var north = GeoTools.getCoordinateByVector(user.homeCoordinate, 0, 200);
        var east = GeoTools.getCoordinateByVector(user.homeCoordinate, 90, 200);
        var south = GeoTools.getCoordinateByVector(user.homeCoordinate, 180, 200);
        var west = GeoTools.getCoordinateByVector(user.homeCoordinate, 270, 200);
        var accuracy = 50;
        var model = JSON.parse(storage.PermanentStorage.get("MissionDetails"));
        var alreadyFilled = model.requiredCoordinates && model.requiredCoordinates[0];
        model.requiredCoordinates = alreadyFilled ? model.requiredCoordinates : [
            { requiredCoordinate: { coordinate: north, name: "Северная граница" }, reached: false },
            { requiredCoordinate: { coordinate: east, name: "Восточная граница" }, reached: false },
            { requiredCoordinate: { coordinate: south, name: "Южная граница" }, reached: false },
            { requiredCoordinate: { coordinate: west, name: "Западная граница" }, reached: false }
        ];
        model.accuracyRadius = accuracy;
        model.isFullFilled = true;
        storage.PermanentStorage.set("MissionDetails", JSON.stringify(model));
        navigation.navigateToPathView(enums.Direction.left, { showTimer: false });
    }
});
