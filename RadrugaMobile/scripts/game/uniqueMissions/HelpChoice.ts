import enums = require("../../Enums");
import navigation = require("../../Navigation");
import miss = require("../../models/Mission");
import storage = require("../../Storage");

export function navigate() {

    var model: miss.Mission = JSON.parse(storage.PermanentStorage.get("MissionDetails"));
    model.maxTries = 1;
    storage.PermanentStorage.set("MissionDetails", JSON.stringify(model));


    navigation.navigateToRightAnswerView(enums.Direction.left);
}