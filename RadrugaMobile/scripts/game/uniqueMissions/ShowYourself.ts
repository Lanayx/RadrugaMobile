import enums = require("../../Enums");
import navigation = require("../../Navigation");

export function navigate() {
    navigation.navigateToShowYourselfView(enums.Direction.left);
}