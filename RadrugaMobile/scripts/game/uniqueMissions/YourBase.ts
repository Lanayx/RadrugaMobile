import enums = require("../../Enums");
import navigation = require("../../Navigation");
import GeoTools = require("../../geoLocation/GeoTools");
import us = require("../../models/User");
import miss = require("../../models/Mission");
import storage = require("../../Storage");
import appTools = require("../../../scripts/ApplicationTools");

export function navigate() {

    var user = us.User.getFromStorage();

    if (!user.homeCoordinate) { //hot fix for some users
        appTools.logError(`Home coordinate is ${user.homeCoordinate}, on Your base. User data: ${JSON.stringify(user)}. Trying user refresh`);
        us.User.getFromApi().done((freshUser) => {
            process(freshUser);
        }).fail(() => {
            appTools.logError(`Couldn't refresh user`);
            navigator.notification.alert(appTools.getText("cmApiError"),
                () => { }, appTools.getText("cmApiErrorTitle"), "OK");
        });
    } else {
        process(user);
    }
}

function process(user: us.User) {
    var north = GeoTools.getCoordinateByVector(user.homeCoordinate, 0, 200);
    var east = GeoTools.getCoordinateByVector(user.homeCoordinate, 90, 200);
    var south = GeoTools.getCoordinateByVector(user.homeCoordinate, 180, 200);
    var west = GeoTools.getCoordinateByVector(user.homeCoordinate, 270, 200);
    var accuracy = 50;



    var model: miss.Mission = JSON.parse(storage.PermanentStorage.get("MissionDetails"));
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