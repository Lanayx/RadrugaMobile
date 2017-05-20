import enums = require("../../Enums");
import navigation = require("../../Navigation");

export function navigate() {
    navigation.navigateToCommonPlaceView(enums.Direction.left, { showTries: false });
}