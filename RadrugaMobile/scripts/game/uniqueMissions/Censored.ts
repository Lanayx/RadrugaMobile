import enums = require("../../Enums");
import navigation = require("../../Navigation");


export function navigate() {
    navigation.navigateToVideoView(enums.Direction.left);
}