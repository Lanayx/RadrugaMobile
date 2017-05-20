import enums = require("../../Enums");
import navigation = require("../../Navigation");

export function navigate() {
    navigation.navigateToPerpetumMobileView(enums.Direction.left);
}